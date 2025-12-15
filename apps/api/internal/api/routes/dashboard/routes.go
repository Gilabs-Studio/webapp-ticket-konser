package dashboard

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/handlers/dashboard"
	"github.com/gilabs/webapp-ticket-konser/api/internal/api/middleware"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.RouterGroup,
	dashboardHandler *dashboard.Handler,
	roleRepo role.Repository,
	jwtManager *jwt.JWTManager,
) {
	// Admin dashboard routes (admin only)
	adminRoutes := router.Group("/admin")
	adminRoutes.Use(middleware.AuthMiddleware(jwtManager))
	adminRoutes.Use(middleware.RequirePermission("dashboard.read", roleRepo))
	{
		// Dashboard overview
		adminRoutes.GET("/dashboard", dashboardHandler.GetDashboardOverview)           // Get complete dashboard overview
		adminRoutes.GET("/dashboard/sales", dashboardHandler.GetSalesOverview)         // Get sales overview
		adminRoutes.GET("/dashboard/check-ins", dashboardHandler.GetCheckInOverview)    // Get check-in overview
		adminRoutes.GET("/dashboard/quota", dashboardHandler.GetQuotaOverview)        // Get quota overview
		adminRoutes.GET("/dashboard/gates", dashboardHandler.GetGateActivity)          // Get gate activity
		
		// Buyer list
		adminRoutes.GET("/buyers", dashboardHandler.GetBuyerList)                     // Get buyer list
	}
}
