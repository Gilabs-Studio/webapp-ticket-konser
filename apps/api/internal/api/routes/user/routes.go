package user

import (
	"github.com/gin-gonic/gin"
	userhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/user"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
)

func SetupRoutes(
	router *gin.RouterGroup,
	userHandler *userhandler.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin only routes
	adminRoutes := router.Group("/admin/users")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("user.read", roleRepo))
	{
		adminRoutes.GET("", userHandler.List)          // Get all users (admin)
		adminRoutes.GET("/:id", userHandler.GetByID)   // Get user by ID (admin)
		adminRoutes.POST("", middleware.RequirePermission("user.create", roleRepo), userHandler.Create)       // Create user (admin)
		adminRoutes.PUT("/:id", middleware.RequirePermission("user.update", roleRepo), userHandler.Update)  // Update user (admin)
		adminRoutes.DELETE("/:id", middleware.RequirePermission("user.delete", roleRepo), userHandler.Delete) // Delete user (admin)
	}
}


