package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/internal/api/routes"
	"github.com/gilabs/crm-healthcare/api/internal/config"
	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/repository/postgres/auth"
	authservice "github.com/gilabs/crm-healthcare/api/internal/service/auth"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gilabs/crm-healthcare/api/pkg/logger"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gilabs/crm-healthcare/api/seeders"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize logger
	logger.Init()

	// Load configuration
	if err := config.Load(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.AutoMigrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Seed data
	if err := seeders.SeedAll(); err != nil {
		log.Fatal("Failed to seed data:", err)
	}

	// Setup JWT Manager
	jwtManager := jwt.NewJWTManager(
		config.AppConfig.JWT.SecretKey,
		time.Duration(config.AppConfig.JWT.AccessTokenTTL)*time.Hour,
		time.Duration(config.AppConfig.JWT.RefreshTokenTTL)*24*time.Hour,
	)

	// Setup repositories
	authRepo := auth.NewRepository(database.DB)

	// Setup services
	authService := authservice.NewService(authRepo, jwtManager)

	// Setup handlers
	authHandler := handlers.NewAuthHandler(authService)

	// Setup router
	router := setupRouter(
		jwtManager,
		authHandler,
	)

	// Run server
	port := config.AppConfig.Server.Port
	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter(
	jwtManager *jwt.JWTManager,
	authHandler *handlers.AuthHandler,
) *gin.Engine {
	// Set Gin mode
	if config.AppConfig.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Global middleware
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.RequestIDMiddleware())

	// Health check endpoints
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "API is running",
		})
	})

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		v1.GET("/", func(c *gin.Context) {
			response.SuccessResponse(c, gin.H{
				"message": "API v1",
				"version": "1.0.0",
			}, nil)
		})

		// Auth routes
		routes.SetupAuthRoutes(v1, authHandler, jwtManager)
	}

	return router
}
