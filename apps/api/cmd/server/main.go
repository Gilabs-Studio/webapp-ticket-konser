package main

import (
	"log"
	"net/http"
	"time"

	authhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/auth"
	menuhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/menu"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	authroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/auth"
	menuroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/menu"
	"github.com/gilabs/webapp-ticket-konser/api/internal/config"
	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	authrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/auth"
	menurepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/menu"
	permissionrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/permission"
	rolerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/role"
	authservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/auth"
	menuservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/menu"
	permissionservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/permission"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/logger"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gilabs/webapp-ticket-konser/api/seeders"
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
	authRepo := authrepo.NewRepository(database.DB)
	roleRepo := rolerepo.NewRepository(database.DB)
	permissionRepo := permissionrepo.NewRepository(database.DB)
	menuRepo := menurepo.NewRepository(database.DB)

	// Setup services
	authService := authservice.NewService(authRepo, roleRepo, jwtManager)
	_ = permissionservice.NewService(permissionRepo) // Reserved for future use
	menuService := menuservice.NewService(menuRepo, roleRepo)

	// Setup handlers
	authHandler := authhandler.NewHandler(authService)
	menuHandler := menuhandler.NewHandler(menuService)

	// Setup router
	router := setupRouter(
		jwtManager,
		authHandler,
		menuHandler,
		roleRepo,
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
	authHandler *authhandler.Handler,
	menuHandler *menuhandler.Handler,
	roleRepo role.Repository,
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
		authroutes.SetupRoutes(v1, authHandler, jwtManager)

		// Menu routes
		menuroutes.SetupRoutes(v1, menuHandler, roleRepo, jwtManager)
	}

	return router
}
