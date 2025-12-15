package settings

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/settings"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	settingsHandler *settings.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Settings routes (admin only)
	settingsRoutes := router.Group("/settings")
	settingsRoutes.Use(middleware.AuthMiddleware(jwtManager))
	settingsRoutes.Use(middleware.RequirePermission("settings.read", roleRepo))
	{
		settingsRoutes.GET("/event", settingsHandler.GetEventSettings)   // Get event settings
		settingsRoutes.PUT("/event", middleware.RequirePermission("settings.update", roleRepo), settingsHandler.UpdateEventSettings) // Update event settings
		settingsRoutes.GET("/system", settingsHandler.GetSystemSettings) // Get system settings
		settingsRoutes.PUT("/system", middleware.RequirePermission("settings.update", roleRepo), settingsHandler.UpdateSystemSettings) // Update system settings
	}
}
