package auth

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/auth"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.RouterGroup, authHandler *auth.Handler, jwtManager *jwt.JWTManager) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/register", authHandler.Register) // Public buyer self-registration
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/logout", middleware.AuthMiddleware(jwtManager), authHandler.Logout)
		
		// Protected routes
		auth.GET("/me/menus-permissions", middleware.AuthMiddleware(jwtManager), authHandler.GetUserMenusAndPermissions)
	}
}



