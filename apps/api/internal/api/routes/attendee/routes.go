package attendee

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/attendee"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	attendeeHandler *attendee.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin only routes
	adminRoutes := router.Group("/admin/attendees")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("attendee.read", roleRepo))
	{
		adminRoutes.GET("", attendeeHandler.List)                    // List all attendees
		adminRoutes.GET("/statistics", attendeeHandler.GetStatistics) // Get statistics
		adminRoutes.GET("/export", attendeeHandler.Export)           // Export to CSV
	}
}
