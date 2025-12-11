package menu

import (
	menuhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/menu"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	menuHandler *menuhandler.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Public menu routes (for authenticated users)
	menuRoutes := router.Group("/menus")
	menuRoutes.Use(middleware.AuthMiddleware(jwtManager))
	{
		menuRoutes.GET("", menuHandler.GetMenusByRole) // Get menus for current user
	}

	// Admin only routes
	adminRoutes := router.Group("/admin/menus")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("menu.read", roleRepo))
	{
		adminRoutes.GET("", menuHandler.List)          // Get all menus (admin)
		adminRoutes.POST("", menuHandler.Create)       // Create menu (admin)
		adminRoutes.PUT("/:id", menuHandler.Update)    // Update menu (admin)
		adminRoutes.DELETE("/:id", menuHandler.Delete) // Delete menu (admin)
	}
}
