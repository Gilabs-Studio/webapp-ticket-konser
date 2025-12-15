package settings

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/settings"
	settingsservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/settings"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	settingsService *settingsservice.Service
}

func NewHandler(settingsService *settingsservice.Service) *Handler {
	return &Handler{
		settingsService: settingsService,
	}
}

// GetEventSettings gets event settings
// GET /api/v1/settings/event
func (h *Handler) GetEventSettings(c *gin.Context) {
	eventSettings, err := h.settingsService.GetEventSettings()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, eventSettings, meta)
}

// UpdateEventSettings updates event settings
// PUT /api/v1/settings/event
func (h *Handler) UpdateEventSettings(c *gin.Context) {
	var req settings.UpdateEventSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	eventSettings, err := h.settingsService.UpdateEventSettings(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, eventSettings, meta)
}

// GetSystemSettings gets system settings
// GET /api/v1/settings/system
func (h *Handler) GetSystemSettings(c *gin.Context) {
	systemSettings, err := h.settingsService.GetSystemSettings()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, systemSettings, meta)
}

// UpdateSystemSettings updates system settings
// PUT /api/v1/settings/system
func (h *Handler) UpdateSystemSettings(c *gin.Context) {
	var req settings.UpdateSystemSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	systemSettings, err := h.settingsService.UpdateSystemSettings(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, systemSettings, meta)
}

// GetEventDate gets event date for countdown (public endpoint)
// GET /api/v1/settings/event-date
func (h *Handler) GetEventDate(c *gin.Context) {
	eventDate, err := h.settingsService.GetEventDate()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, eventDate, meta)
}
