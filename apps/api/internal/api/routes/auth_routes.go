package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
)

func SetupAuthRoutes(router *gin.RouterGroup, authHandler *handlers.AuthHandler, jwtManager *jwt.JWTManager) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/logout", middleware.AuthMiddleware(jwtManager), authHandler.Logout)
	}
}

