package main

import (
	"log"
	"net/http"
	"time"

	attendeehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/attendee"
	authhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/auth"
	checkinhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/checkin"
	eventhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/event"
	gatehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/gate"
	menuhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/menu"
	orderhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/order"
	permissionhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/permission"
	rolehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/role"
	schedulehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/schedule"
	ticketcategoryhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/ticket_category"
	userhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/user"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	attendeeroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/attendee"
	authroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/auth"
	checkinroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/checkin"
	eventroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/event"
	gateroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/gate"
	menuroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/menu"
	orderroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/order"
	permissionroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/permission"
	roleroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/role"
	scheduleroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/schedule"
	ticketcategoryroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/ticket_category"
	userroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/user"
	"github.com/gilabs/webapp-ticket-konser/api/internal/config"
	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	attendeerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/attendee"
	authrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/auth"
	checkinrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/checkin"
	eventrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/event"
	gaterepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/gate"
	menurepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/menu"
	orderrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/order"
	orderitemrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/order_item"
	permissionrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/permission"
	rolerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/role"
	schedulerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/schedule"
	ticketcategoryrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/ticket_category"
	userrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/user"
	attendeeservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/attendee"
	authservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/auth"
	checkinservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/checkin"
	eventservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/event"
	gateservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/gate"
	menuservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/menu"
	orderservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order"
	permissionservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/permission"
	roleservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/role"
	scheduleservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/schedule"
	ticketcategoryservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/ticket_category"
	userservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/user"
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
	attendeeRepo := attendeerepo.NewRepository(database.DB)
	roleRepo := rolerepo.NewRepository(database.DB)
	permissionRepo := permissionrepo.NewRepository(database.DB)
	menuRepo := menurepo.NewRepository(database.DB)
	eventRepo := eventrepo.NewRepository(database.DB)
	ticketCategoryRepo := ticketcategoryrepo.NewRepository(database.DB)
	scheduleRepo := schedulerepo.NewRepository(database.DB)
	orderRepo := orderrepo.NewRepository(database.DB)
	orderItemRepo := orderitemrepo.NewRepository(database.DB)
	checkInRepo := checkinrepo.NewRepository(database.DB)
	gateRepo := gaterepo.NewRepository(database.DB)
	userRepo := userrepo.NewRepository(database.DB)

	// Setup services
	menuService := menuservice.NewService(menuRepo, roleRepo)
	authService := authservice.NewService(authRepo, roleRepo, menuService, jwtManager)
	attendeeService := attendeeservice.NewService(attendeeRepo)
	permissionService := permissionservice.NewService(permissionRepo)
	roleService := roleservice.NewService(roleRepo, permissionRepo)
	eventService := eventservice.NewService(eventRepo)
	ticketCategoryService := ticketcategoryservice.NewService(ticketCategoryRepo)
	scheduleService := scheduleservice.NewService(scheduleRepo)
	orderService := orderservice.NewService(orderRepo)
	checkInService := checkinservice.NewService(checkInRepo, orderItemRepo)
	gateService := gateservice.NewService(gateRepo, orderItemRepo, checkInRepo, checkInService)
	userService := userservice.NewService(userRepo, roleRepo)

	// Setup handlers
	authHandler := authhandler.NewHandler(authService)
	attendeeHandler := attendeehandler.NewHandler(attendeeService)
	permissionHandler := permissionhandler.NewHandler(permissionService)
	roleHandler := rolehandler.NewHandler(roleService)
	menuHandler := menuhandler.NewHandler(menuService)
	eventHandler := eventhandler.NewHandler(eventService)
	ticketCategoryHandler := ticketcategoryhandler.NewHandler(ticketCategoryService)
	scheduleHandler := schedulehandler.NewHandler(scheduleService)
	orderHandler := orderhandler.NewHandler(orderService)
	checkInHandler := checkinhandler.NewHandler(checkInService)
	gateHandler := gatehandler.NewHandler(gateService)
	userHandler := userhandler.NewHandler(userService)

	// Setup router
	router := setupRouter(
		jwtManager,
		authHandler,
		attendeeHandler,
		permissionHandler,
		roleHandler,
		menuHandler,
		eventHandler,
		ticketCategoryHandler,
		scheduleHandler,
		orderHandler,
		checkInHandler,
		gateHandler,
		userHandler,
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
	attendeeHandler *attendeehandler.Handler,
	permissionHandler *permissionhandler.Handler,
	roleHandler *rolehandler.Handler,
	menuHandler *menuhandler.Handler,
	eventHandler *eventhandler.Handler,
	ticketCategoryHandler *ticketcategoryhandler.Handler,
	scheduleHandler *schedulehandler.Handler,
	orderHandler *orderhandler.Handler,
	checkInHandler *checkinhandler.Handler,
	gateHandler *gatehandler.Handler,
	userHandler *userhandler.Handler,
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

		// Attendee routes
		attendeeroutes.SetupRoutes(v1, attendeeHandler, roleRepo, jwtManager)

		// Menu routes
		menuroutes.SetupRoutes(v1, menuHandler, roleRepo, jwtManager)

		// Event routes
		eventroutes.SetupRoutes(v1, eventHandler, roleRepo, jwtManager)

		// Ticket Category routes
		ticketcategoryroutes.SetupRoutes(v1, ticketCategoryHandler, roleRepo, jwtManager)

		// Schedule routes
		scheduleroutes.SetupRoutes(v1, scheduleHandler, roleRepo, jwtManager)

		// Order routes
		orderroutes.SetupRoutes(v1, orderHandler, roleRepo, jwtManager)

		// Check-in routes
		checkinroutes.SetupRoutes(v1, checkInHandler, roleRepo, jwtManager)

		// Gate routes
		gateroutes.SetupRoutes(v1, gateHandler, roleRepo, jwtManager)

		// User routes
		userroutes.SetupRoutes(v1, userHandler, roleRepo, jwtManager)

		// Role routes
		roleroutes.SetupRoutes(v1, roleHandler, roleRepo, jwtManager)

		// Permission routes
		permissionroutes.SetupRoutes(v1, permissionHandler, roleRepo, jwtManager)
	}

	return router
}
