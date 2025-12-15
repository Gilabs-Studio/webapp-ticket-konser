package ticket

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/ticket"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	ticketHandler *ticket.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Ticket routes (admin only)
	ticketRoutes := router.Group("/tickets")
	ticketRoutes.Use(middleware.AuthMiddleware(jwtManager))
	ticketRoutes.Use(middleware.RequirePermission("ticket.read", roleRepo))
	{
		ticketRoutes.GET("", ticketHandler.List)           // Get all tickets
		ticketRoutes.GET("/:id", ticketHandler.GetByID)   // Get ticket by ID
	}
}
