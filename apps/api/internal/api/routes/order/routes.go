package order

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/order"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	orderHandler *order.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin only routes
	adminRoutes := router.Group("/admin/orders")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("order.read", roleRepo))
	{
		adminRoutes.GET("", orderHandler.List)                       // List all orders with filters
		adminRoutes.GET("/recent", orderHandler.GetRecentOrders)     // Get recent orders
		adminRoutes.GET("/:id", orderHandler.GetByID)                // Get order by ID
		adminRoutes.GET("/code/:order_code", orderHandler.GetByOrderCode) // Get order by order code
		adminRoutes.PUT("/:id", orderHandler.Update)                 // Update order
		adminRoutes.DELETE("/:id", orderHandler.Delete)              // Delete order
	}
}


