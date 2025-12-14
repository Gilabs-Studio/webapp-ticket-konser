package gate

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/gate"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	gateHandler *gate.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Gate routes (admin only for CRUD)
	gateRoutes := router.Group("/gates")
	gateRoutes.Use(middleware.AuthMiddleware(jwtManager))
	gateRoutes.Use(middleware.RequirePermission("gate.read", roleRepo))
	{
		gateRoutes.GET("", gateHandler.List)                    // List all gates
		gateRoutes.GET("/:id", gateHandler.GetByID)             // Get gate by ID
		gateRoutes.GET("/:id/statistics", gateHandler.GetStatistics) // Get gate statistics
	}

	// Gate management routes (admin only for create/update/delete)
	adminRoutes := router.Group("/gates")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("gate.create", roleRepo))
	{
		adminRoutes.POST("", gateHandler.Create) // Create gate
	}

	adminUpdateRoutes := router.Group("/gates")
	adminUpdateRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminUpdateRoutes.Use(middleware.RequirePermission("gate.update", roleRepo))
	{
		adminUpdateRoutes.PUT("/:id", gateHandler.Update) // Update gate
	}

	adminDeleteRoutes := router.Group("/gates")
	adminDeleteRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminDeleteRoutes.Use(middleware.RequirePermission("gate.delete", roleRepo))
	{
		adminDeleteRoutes.DELETE("/:id", gateHandler.Delete) // Delete gate
	}

	// Gate assignment routes (admin only)
	assignmentRoutes := router.Group("/gates")
	assignmentRoutes.Use(middleware.AuthMiddleware(jwtManager))
	assignmentRoutes.Use(middleware.RequirePermission("gate.update", roleRepo))
	{
		assignmentRoutes.POST("/:id/assign-ticket", gateHandler.AssignTicketToGate) // Assign ticket to gate
	}

	// Gate check-in routes (authenticated users - staff can check-in at their assigned gate)
	checkInRoutes := router.Group("/gates")
	checkInRoutes.Use(middleware.AuthMiddleware(jwtManager))
	checkInRoutes.Use(middleware.CheckInRateLimitMiddleware()) // Rate limiting for check-in endpoints
	{
		checkInRoutes.POST("/:id/check-in", gateHandler.GateCheckIn) // Perform check-in at gate
	}
}
