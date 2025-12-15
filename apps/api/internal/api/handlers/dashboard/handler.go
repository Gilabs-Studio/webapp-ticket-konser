package dashboard

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/dashboard"
	dashboardservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/dashboard"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	dashboardService *dashboardservice.Service
}

func NewHandler(dashboardService *dashboardservice.Service) *Handler {
	return &Handler{
		dashboardService: dashboardService,
	}
}

// GetDashboardOverview gets complete dashboard overview
// GET /api/v1/admin/dashboard
func (h *Handler) GetDashboardOverview(c *gin.Context) {
	var filters dashboard.DashboardFilters
	if err := c.ShouldBindQuery(&filters); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	overview, err := h.dashboardService.GetDashboardOverview(&filters)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, overview, meta)
}

// GetSalesOverview gets sales overview
// GET /api/v1/admin/dashboard/sales
func (h *Handler) GetSalesOverview(c *gin.Context) {
	var filters dashboard.DashboardFilters
	if err := c.ShouldBindQuery(&filters); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	sales, err := h.dashboardService.GetSalesOverview(&filters)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, sales, meta)
}

// GetCheckInOverview gets check-in overview
// GET /api/v1/admin/dashboard/check-ins
func (h *Handler) GetCheckInOverview(c *gin.Context) {
	var filters dashboard.DashboardFilters
	if err := c.ShouldBindQuery(&filters); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	checkIns, err := h.dashboardService.GetCheckInOverview(&filters)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, checkIns, meta)
}

// GetQuotaOverview gets quota overview
// GET /api/v1/admin/dashboard/quota
func (h *Handler) GetQuotaOverview(c *gin.Context) {
	var filters dashboard.DashboardFilters
	if err := c.ShouldBindQuery(&filters); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	quota, err := h.dashboardService.GetQuotaOverview(&filters)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, quota, meta)
}

// GetGateActivity gets gate activity
// GET /api/v1/admin/dashboard/gates
func (h *Handler) GetGateActivity(c *gin.Context) {
	var filters dashboard.DashboardFilters
	if err := c.ShouldBindQuery(&filters); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	gates, err := h.dashboardService.GetGateActivity(&filters)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, gates, meta)
}

// GetBuyerList gets buyer list
// GET /api/v1/admin/buyers
func (h *Handler) GetBuyerList(c *gin.Context) {
	var filters dashboard.DashboardFilters
	if err := c.ShouldBindQuery(&filters); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	buyers, err := h.dashboardService.GetBuyerList(&filters)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, buyers, meta)
}
