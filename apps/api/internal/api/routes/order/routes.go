package order

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/order"
	orderitemhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/order_item"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	orderHandler *order.Handler,
	orderItemHandler *orderitemhandler.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Payment webhook (no auth - called by Midtrans, rate + IP limited to prevent abuse)
	webhookGroup := router.Group("/payments")
	webhookGroup.Use(middleware.RateLimitMiddleware(middleware.WebhookRateLimitConfig()))
	webhookGroup.Use(middleware.MidtransIPWhitelist())
	{
		webhookGroup.POST("/webhook", orderHandler.HandlePaymentWebhook)
	}

	// Guest/User routes (authenticated users, rate limited for anti-overselling)
	guestRoutes := router.Group("/orders")
	guestRoutes.Use(middleware.AuthMiddleware(jwtManager))
	guestRoutes.Use(middleware.OrderRateLimitMiddleware())
	{
		guestRoutes.POST("", middleware.IdempotencyMiddleware(middleware.IdempotencyConfig{TTL: 10 * time.Minute}), orderHandler.CreateOrder) // Create order
		guestRoutes.GET("", orderHandler.GetMyOrders)                                                                                         // List my orders
		// More specific routes must be defined before less specific ones
		guestRoutes.GET("/:id/tickets", orderItemHandler.GetMyOrderTickets)                                                                                   // Get my order tickets
		guestRoutes.POST("/:id/payment", middleware.IdempotencyMiddleware(middleware.IdempotencyConfig{TTL: 10 * time.Minute}), orderHandler.InitiatePayment) // Initiate payment
		guestRoutes.GET("/:id/payment-status", orderHandler.CheckPaymentStatus)                                                                               // Check payment status
		guestRoutes.GET("/:id", orderHandler.GetMyOrder)                                                                                                      // Get my order by ID (must be last)
	}

	// Admin only routes
	adminRoutes := router.Group("/admin/orders")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("order.read", roleRepo))
	{
		adminRoutes.GET("", orderHandler.List)                            // List all orders with filters
		adminRoutes.GET("/recent", orderHandler.GetRecentOrders)          // Get recent orders
		adminRoutes.GET("/:id", orderHandler.GetByID)                     // Get order by ID
		adminRoutes.GET("/code/:order_code", orderHandler.GetByOrderCode) // Get order by order code
		adminRoutes.PUT("/:id", orderHandler.Update)                      // Update order
		adminRoutes.DELETE("/:id", orderHandler.Delete)                   // Delete order
	}
}
