package checkin

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/checkin"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	checkInHandler *checkin.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Check-in routes (authenticated users)
	checkInRoutes := router.Group("/check-in")
	checkInRoutes.Use(middleware.AuthMiddleware(jwtManager))
	checkInRoutes.Use(middleware.RequirePermission("checkin.create", roleRepo))
	checkInRoutes.Use(middleware.CheckInRateLimitMiddleware()) // Rate limiting for check-in endpoints
	{
		checkInRoutes.POST("/validate", checkInHandler.ValidateQRCode)                                                                        // Validate QR code
		checkInRoutes.POST("", middleware.IdempotencyMiddleware(middleware.IdempotencyConfig{TTL: 10 * time.Minute}), checkInHandler.CheckIn) // Perform check-in
	}

	// Check-in history routes (admin only)
	adminRoutes := router.Group("/check-ins")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("checkin.read", roleRepo))
	{
		adminRoutes.GET("", checkInHandler.List)                                       // List all check-ins
		adminRoutes.GET("/:id", checkInHandler.GetByID)                                // Get check-in by ID
		adminRoutes.GET("/qr/:qr_code", checkInHandler.GetByQRCode)                    // Get check-ins by QR code
		adminRoutes.GET("/order-item/:order_item_id", checkInHandler.GetByOrderItemID) // Get check-ins by order item ID
		adminRoutes.GET("/gate/:gate_id", checkInHandler.GetByGateID)                  // Get check-ins by gate ID
	}
}
