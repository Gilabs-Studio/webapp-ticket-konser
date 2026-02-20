package audit

import (
	audithandler "github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/audit"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	handler *audithandler.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	adminRoutes := router.Group("/admin/audit-logs")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("audit.read", roleRepo))
	{
		adminRoutes.GET("", handler.List)
	}
}
