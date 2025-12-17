package ticketcategory

import (
	"github.com/gin-gonic/gin"
	ticketcategoryhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/ticket_category"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
)

func SetupRoutes(
	router *gin.RouterGroup,
	ticketCategoryHandler *ticketcategoryhandler.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Public routes (for guest - no authentication required)
	publicRoutes := router.Group("/events")
	{
		publicRoutes.GET("/:event_id/ticket-categories", ticketCategoryHandler.GetByEventIDPublic) // Get ticket categories by event ID (public)
	}

	// Admin only routes
	adminRoutes := router.Group("/admin/ticket-categories")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("ticket_category.read", roleRepo))
	{
		adminRoutes.GET("", ticketCategoryHandler.List)                    // List all ticket categories
		adminRoutes.GET("/:id", ticketCategoryHandler.GetByID)             // Get ticket category by ID
		adminRoutes.GET("/event/:event_id", ticketCategoryHandler.GetByEventID) // Get by event ID
		adminRoutes.POST("", ticketCategoryHandler.Create)                // Create ticket category
		adminRoutes.PUT("/:id", ticketCategoryHandler.Update)             // Update ticket category
		adminRoutes.DELETE("/:id", ticketCategoryHandler.Delete)          // Delete ticket category
	}
}


