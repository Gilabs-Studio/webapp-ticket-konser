package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	attendeehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/attendee"
	authhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/auth"
	checkinhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/checkin"
	dashboardhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/dashboard"
	eventhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/event"
	gatehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/gate"
	menuhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/menu"
	merchandisehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/merchandise"
	orderhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/order"
	orderitemhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/order_item"
	permissionhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/permission"
	rolehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/role"
	schedulehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/schedule"
	settingshandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/settings"
	tickethandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/ticket"
	ticketcategoryhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/ticket_category"
	userhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/user"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	attendeeroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/attendee"
	authroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/auth"
	checkinroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/checkin"
	dashboardroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/dashboard"
	eventroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/event"
	gateroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/gate"
	menuroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/menu"
	merchandiseroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/merchandise"
	orderroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/order"
	orderitemroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/order_item"
	permissionroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/permission"
	roleroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/role"
	scheduleroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/schedule"
	settingsroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/settings"
	ticketroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/ticket"
	ticketcategoryroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/ticket_category"
	userroutes "github.com/gilabs/webapp-ticket-konser/api/internal/api/routes/user"
	"github.com/gilabs/webapp-ticket-konser/api/internal/config"
	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	redisint "github.com/gilabs/webapp-ticket-konser/api/internal/integration/redis"
	paymentexpirationjob "github.com/gilabs/webapp-ticket-konser/api/internal/job"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	attendeerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/attendee"
	authrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/auth"
	checkinrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/checkin"
	dashboardrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/dashboard"
	eventrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/event"
	gaterepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/gate"
	gatestaffrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/gate_staff"
	menurepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/menu"
	merchandiserepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/merchandise"
	orderrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/order"
	orderitemrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/order_item"
	permissionrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/permission"
	rolerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/role"
	schedulerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/schedule"
	settingsrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/settings"
	ticketrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/ticket"
	ticketcategoryrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/ticket_category"
	userrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/postgres/user"
	attendeeservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/attendee"
	authservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/auth"
	checkinservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/checkin"
	dashboardservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/dashboard"
	eventservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/event"
	gateservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/gate"
	menuservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/menu"
	merchandiseservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/merchandise"
	orderservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order"
	orderitemservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order_item"
	permissionservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/permission"
	roleservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/role"
	scheduleservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/schedule"
	settingsservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/settings"
	ticketservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/ticket"
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

	// Connect to Redis (optional)
	{
		redisCfg := redisint.LoadConfigFromEnv()
		// Prefer central config values when available
		if config.AppConfig != nil {
			if config.AppConfig.Redis.URL != "" {
				// LoadConfigFromEnv already supports REDIS_URL; keep env as source of truth
			}
			redisCfg.Enabled = config.AppConfig.Redis.Enabled
			redisCfg.Addr = config.AppConfig.Redis.Addr
			redisCfg.Password = config.AppConfig.Redis.Password
			redisCfg.DB = config.AppConfig.Redis.DB
			redisCfg.Prefix = config.AppConfig.Redis.Prefix
			if d, err := time.ParseDuration(config.AppConfig.Redis.DialTimeout); err == nil {
				redisCfg.DialTimeout = d
			}
			if d, err := time.ParseDuration(config.AppConfig.Redis.ReadTimeout); err == nil {
				redisCfg.ReadTimeout = d
			}
			if d, err := time.ParseDuration(config.AppConfig.Redis.WriteTimeout); err == nil {
				redisCfg.WriteTimeout = d
			}
		}

		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		if err := redisint.Connect(ctx, redisCfg); err != nil {
			cancel()
			log.Fatal("Failed to connect to redis:", err)
		}
		cancel()
		defer redisint.Close()
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
	ticketRepo := ticketrepo.NewRepository(database.DB)
	scheduleRepo := schedulerepo.NewRepository(database.DB)
	orderRepo := orderrepo.NewRepository(database.DB)
	orderItemRepo := orderitemrepo.NewRepository(database.DB)
	checkInRepo := checkinrepo.NewRepository(database.DB)
	gateRepo := gaterepo.NewRepository(database.DB)
	gateStaffRepo := gatestaffrepo.NewRepository(database.DB)
	userRepo := userrepo.NewRepository(database.DB)
	merchandiseRepo := merchandiserepo.NewRepository(database.DB)
	settingsRepo := settingsrepo.NewRepository(database.DB)
	dashboardRepo := dashboardrepo.NewRepository(database.DB)

	// Setup services
	menuService := menuservice.NewService(menuRepo, roleRepo)
	authService := authservice.NewService(authRepo, roleRepo, menuService, jwtManager)
	attendeeService := attendeeservice.NewService(attendeeRepo)
	permissionService := permissionservice.NewService(permissionRepo)
	roleService := roleservice.NewService(roleRepo, permissionRepo)
	eventService := eventservice.NewService(eventRepo)
	ticketCategoryService := ticketcategoryservice.NewService(ticketCategoryRepo)
	ticketService := ticketservice.NewService(ticketRepo)
	scheduleService := scheduleservice.NewService(scheduleRepo)
	orderItemService := orderitemservice.NewService(orderItemRepo, orderRepo, ticketCategoryRepo)
	orderService := orderservice.NewService(orderRepo, ticketCategoryRepo, scheduleRepo, orderItemRepo, orderItemService)
	checkInService := checkinservice.NewService(checkInRepo, orderItemRepo)
	gateService := gateservice.NewService(gateRepo, gateStaffRepo, orderItemRepo, checkInRepo, checkInService)
	userService := userservice.NewService(userRepo, roleRepo)
	merchandiseService := merchandiseservice.NewService(merchandiseRepo)
	settingsService := settingsservice.NewService(settingsRepo)
	dashboardService := dashboardservice.NewService(dashboardRepo)

	// Setup handlers
	authHandler := authhandler.NewHandler(authService)
	attendeeHandler := attendeehandler.NewHandler(attendeeService)
	permissionHandler := permissionhandler.NewHandler(permissionService)
	roleHandler := rolehandler.NewHandler(roleService)
	menuHandler := menuhandler.NewHandler(menuService)
	eventHandler := eventhandler.NewHandler(eventService)
	ticketCategoryHandler := ticketcategoryhandler.NewHandler(ticketCategoryService)
	ticketHandler := tickethandler.NewHandler(ticketService)
	scheduleHandler := schedulehandler.NewHandler(scheduleService)
	orderHandler := orderhandler.NewHandler(orderService)
	orderItemHandler := orderitemhandler.NewHandler(orderItemService, orderRepo)
	checkInHandler := checkinhandler.NewHandler(checkInService)
	gateHandler := gatehandler.NewHandler(gateService)
	userHandler := userhandler.NewHandler(userService)
	merchandiseHandler := merchandisehandler.NewHandler(merchandiseService)
	settingsHandler := settingshandler.NewHandler(settingsService)
	dashboardHandler := dashboardhandler.NewHandler(dashboardService)

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
		ticketHandler,
		scheduleHandler,
		orderHandler,
		orderItemHandler,
		checkInHandler,
		gateHandler,
		userHandler,
		merchandiseHandler,
		settingsHandler,
		dashboardHandler,
		roleRepo,
	)

	// Start background jobs
	paymentexpirationjob.StartPaymentExpirationJob(orderService)

	// Run server with explicit timeouts + graceful shutdown
	port := config.AppConfig.Server.Port
	addr := ":" + port

	srv := &http.Server{
		Addr:              addr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    maxHeaderBytes(),
	}

	go func() {
		log.Printf("Server starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server:", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("Shutting down server...")
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server shutdown failed:", err)
	}
	log.Println("Server stopped")
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
	ticketHandler *tickethandler.Handler,
	scheduleHandler *schedulehandler.Handler,
	orderHandler *orderhandler.Handler,
	orderItemHandler *orderitemhandler.Handler,
	checkInHandler *checkinhandler.Handler,
	gateHandler *gatehandler.Handler,
	userHandler *userhandler.Handler,
	merchandiseHandler *merchandisehandler.Handler,
	settingsHandler *settingshandler.Handler,
	dashboardHandler *dashboardhandler.Handler,
	roleRepo role.Repository,
) *gin.Engine {
	// Set Gin mode
	if config.AppConfig.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	// Multipart memory budget (files beyond this go to temp file).
	if config.AppConfig != nil && config.AppConfig.Server.MaxMultipartMemoryBytes > 0 {
		router.MaxMultipartMemory = config.AppConfig.Server.MaxMultipartMemoryBytes
	}
	router.Use(gin.Recovery())

	// Global middleware
	router.Use(middleware.RequestIDMiddleware())
	if config.AppConfig != nil {
		router.Use(middleware.RequestTimeoutMiddleware(config.AppConfig.Server.RequestTimeout))
	}
	router.Use(middleware.SecurityHeadersMiddleware())
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware())
	if config.AppConfig != nil {
		router.Use(middleware.BodySizeLimitMiddleware(config.AppConfig.Server.MaxBodyBytes))
	}
	router.Use(middleware.MetricsMiddleware())

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

	// Observability endpoints
	middleware.RegisterMetricsRoute(router)
	middleware.RegisterDebugRoutes(router)

	// Static file serving for uploads
	router.Static("/uploads", "./uploads")

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

		// Ticket Category routes (must be before event routes to avoid route conflict)
		ticketcategoryroutes.SetupRoutes(v1, ticketCategoryHandler, roleRepo, jwtManager)

		// Schedule routes (must be before event routes to avoid route conflict)
		scheduleroutes.SetupRoutes(v1, scheduleHandler, roleRepo, jwtManager)

		// Event routes (must be after nested routes to avoid route conflict)
		eventroutes.SetupRoutes(v1, eventHandler, roleRepo, jwtManager)

		// Ticket routes
		ticketroutes.SetupRoutes(v1, ticketHandler, roleRepo, jwtManager)

		// Order Item (Ticket) routes (must be before order routes to avoid route conflict)
		orderitemroutes.SetupRoutes(v1, orderItemHandler, roleRepo, jwtManager)

		// Order routes (must be after nested routes to avoid route conflict)
		orderroutes.SetupRoutes(v1, orderHandler, orderItemHandler, roleRepo, jwtManager)

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

		// Merchandise routes
		merchandiseroutes.SetupRoutes(v1, merchandiseHandler, roleRepo, jwtManager)

		// Settings routes
		settingsroutes.SetupRoutes(v1, settingsHandler, roleRepo, jwtManager)

		// Dashboard routes
		dashboardroutes.SetupRoutes(v1, dashboardHandler, roleRepo, jwtManager)
	}

	return router
}

func maxHeaderBytes() int {
	if config.AppConfig != nil && config.AppConfig.Server.MaxHeaderBytes > 0 {
		return config.AppConfig.Server.MaxHeaderBytes
	}
	// Safe default: 1 MiB
	return 1 * 1024 * 1024
}
