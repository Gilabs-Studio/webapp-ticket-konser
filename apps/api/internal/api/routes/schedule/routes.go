package schedule

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/schedule"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
)

func SetupRoutes(
	router *gin.RouterGroup,
	scheduleHandler *schedule.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin only routes
	adminRoutes := router.Group("/admin/schedules")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("schedule.read", roleRepo))
	{
		adminRoutes.GET("", scheduleHandler.List)                    // List all schedules
		adminRoutes.GET("/:id", scheduleHandler.GetByID)            // Get schedule by ID
		adminRoutes.GET("/event/:event_id", scheduleHandler.GetByEventID) // Get by event ID
		adminRoutes.POST("", scheduleHandler.Create)                // Create schedule
		adminRoutes.PUT("/:id", scheduleHandler.Update)             // Update schedule
		adminRoutes.DELETE("/:id", scheduleHandler.Delete)          // Delete schedule
	}
}


