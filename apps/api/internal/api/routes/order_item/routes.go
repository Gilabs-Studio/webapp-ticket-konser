package orderitem

import (
	orderitemhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/order_item"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	orderItemHandler *orderitemhandler.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin only routes for tickets (order items)
	adminRoutes := router.Group("/admin/tickets")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("order.read", roleRepo))
	{
		adminRoutes.GET("/:id", orderItemHandler.GetByID)                    // Get ticket by ID
		adminRoutes.GET("/qr/:qr_code", orderItemHandler.GetByQRCode)      // Get ticket by QR code
		adminRoutes.PUT("/:id", orderItemHandler.Update)                  // Update ticket
		adminRoutes.DELETE("/:id", orderItemHandler.Delete)                 // Delete ticket
	}

	// Order tickets routes (using separate path to avoid conflict with /admin/orders/:id)
	orderTicketsRoutes := router.Group("/admin/order-tickets")
	orderTicketsRoutes.Use(middleware.AuthMiddleware(jwtManager))
	orderTicketsRoutes.Use(middleware.RequirePermission("order.read", roleRepo))
	{
		orderTicketsRoutes.GET("/order/:order_id", orderItemHandler.GetByOrderID)           // Get all tickets for an order
		orderTicketsRoutes.POST("/order/:order_id/generate", orderItemHandler.GenerateTickets) // Generate tickets for an order
	}
}

