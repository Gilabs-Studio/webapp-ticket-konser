package event

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/event"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
)

func SetupRoutes(
	router *gin.RouterGroup,
	eventHandler *event.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin only routes
	adminRoutes := router.Group("/admin/events")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("event.read", roleRepo))
	{
		adminRoutes.GET("", eventHandler.List)                    // List all events
		adminRoutes.GET("/:id", eventHandler.GetByID)            // Get event by ID
		adminRoutes.POST("", eventHandler.Create)                // Create event
		adminRoutes.PUT("/:id", eventHandler.Update)             // Update event
		adminRoutes.DELETE("/:id", eventHandler.Delete)          // Delete event
		adminRoutes.PATCH("/:id/status", eventHandler.UpdateStatus) // Update event status
		adminRoutes.POST("/:id/banner", eventHandler.UploadBanner)  // Upload banner image
	}

	// Public routes (for authenticated users to view events)
	// Only show published events
	publicRoutes := router.Group("/events")
	publicRoutes.Use(middleware.AuthMiddleware(jwtManager))
	{
		publicRoutes.GET("", eventHandler.ListPublic)            // List published events only
		publicRoutes.GET("/:id", eventHandler.GetByIDPublic)     // Get published event by ID
	}
}

