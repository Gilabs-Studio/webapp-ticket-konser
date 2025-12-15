package merchandise

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/merchandise"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	merchandiseHandler *merchandise.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Merchandise routes (admin only)
	merchandiseRoutes := router.Group("/merchandise")
	merchandiseRoutes.Use(middleware.AuthMiddleware(jwtManager))
	merchandiseRoutes.Use(middleware.RequirePermission("merchandise.read", roleRepo))
	{
		merchandiseRoutes.GET("", merchandiseHandler.List)                    // Get all merchandises
		merchandiseRoutes.GET("/inventory", merchandiseHandler.GetInventory)  // Get inventory summary
		merchandiseRoutes.GET("/:id", merchandiseHandler.GetByID)            // Get merchandise by ID
		merchandiseRoutes.POST("", middleware.RequirePermission("merchandise.create", roleRepo), merchandiseHandler.Create) // Create merchandise
		merchandiseRoutes.PUT("/:id", middleware.RequirePermission("merchandise.update", roleRepo), merchandiseHandler.Update) // Update merchandise
		merchandiseRoutes.DELETE("/:id", middleware.RequirePermission("merchandise.delete", roleRepo), merchandiseHandler.Delete) // Delete merchandise
		merchandiseRoutes.POST("/:id/image", middleware.RequirePermission("merchandise.update", roleRepo), merchandiseHandler.UploadImage) // Upload merchandise image
	}
}
