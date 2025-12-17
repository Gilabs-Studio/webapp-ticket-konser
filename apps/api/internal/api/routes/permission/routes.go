package permission

import (
	"github.com/gin-gonic/gin"
	permissionhandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/permission"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
)

func SetupRoutes(
	router *gin.RouterGroup,
	permissionHandler *permissionhandler.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin only routes
	adminRoutes := router.Group("/admin/permissions")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("permission.read", roleRepo))
	{
		adminRoutes.GET("", permissionHandler.List)                                    // Get all permissions (admin)
		adminRoutes.GET("/:id", permissionHandler.GetByID)                             // Get permission by ID (admin)
		adminRoutes.POST("", middleware.RequirePermission("permission.create", roleRepo), permissionHandler.Create)                    // Create permission (admin)
		adminRoutes.PUT("/:id", middleware.RequirePermission("permission.update", roleRepo), permissionHandler.Update)                // Update permission (admin)
		adminRoutes.DELETE("/:id", middleware.RequirePermission("permission.delete", roleRepo), permissionHandler.Delete)            // Delete permission (admin)
	}
}


