package role

import (
	"github.com/gin-gonic/gin"
	rolehandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/role"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
)

func SetupRoutes(
	router *gin.RouterGroup,
	roleHandler *rolehandler.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin only routes
	adminRoutes := router.Group("/admin/roles")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("role.read", roleRepo))
	{
		adminRoutes.GET("", roleHandler.List)                                    // Get all roles (admin)
		adminRoutes.GET("/:id", roleHandler.GetByID)                             // Get role by ID (admin)
		adminRoutes.POST("", middleware.RequirePermission("role.create", roleRepo), roleHandler.Create)                    // Create role (admin)
		adminRoutes.PUT("/:id", middleware.RequirePermission("role.update", roleRepo), roleHandler.Update)                // Update role (admin)
		adminRoutes.DELETE("/:id", middleware.RequirePermission("role.delete", roleRepo), roleHandler.Delete)            // Delete role (admin)
		adminRoutes.PUT("/:id/permissions", middleware.RequirePermission("role.assign_permissions", roleRepo), roleHandler.AssignPermissions) // Assign permissions to role (admin)
	}
}

