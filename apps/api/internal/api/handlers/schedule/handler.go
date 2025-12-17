package schedule

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/schedule"
	scheduleservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/schedule"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
)

type Handler struct {
	scheduleService *scheduleservice.Service
}

func NewHandler(scheduleService *scheduleservice.Service) *Handler {
	return &Handler{
		scheduleService: scheduleService,
	}
}

// GetByID gets a schedule by ID
// GET /api/v1/admin/schedules/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	schedule, err := h.scheduleService.GetByID(id)
	if err != nil {
		if err == scheduleservice.ErrScheduleNotFound {
			errors.NotFoundResponse(c, "schedule", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, schedule, meta)
}

// GetByEventID gets schedules by event ID
// GET /api/v1/admin/schedules/event/:event_id
func (h *Handler) GetByEventID(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "event_id",
		}, nil)
		return
	}

	schedules, err := h.scheduleService.GetByEventID(eventID)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, schedules, meta)
}

// Create creates a new schedule
// POST /api/v1/admin/schedules
func (h *Handler) Create(c *gin.Context) {
	var req schedule.CreateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	schedule, err := h.scheduleService.Create(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponseCreated(c, schedule, meta)
}

// Update updates a schedule
// PUT /api/v1/admin/schedules/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req schedule.UpdateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	schedule, err := h.scheduleService.Update(id, &req)
	if err != nil {
		if err == scheduleservice.ErrScheduleNotFound {
			errors.NotFoundResponse(c, "schedule", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, schedule, meta)
}

// Delete deletes a schedule
// DELETE /api/v1/admin/schedules/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.scheduleService.Delete(id)
	if err != nil {
		if err == scheduleservice.ErrScheduleNotFound {
			errors.NotFoundResponse(c, "schedule", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// List lists all schedules
// GET /api/v1/admin/schedules
func (h *Handler) List(c *gin.Context) {
	schedules, err := h.scheduleService.List()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, schedules, meta)
}

// GetByEventIDPublic gets schedules by event ID (public route - for guest, include rundown)
// GET /api/v1/events/:event_id/schedules
func (h *Handler) GetByEventIDPublic(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "event_id",
		}, nil)
		return
	}

	schedules, err := h.scheduleService.GetByEventID(eventID)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, schedules, meta)
}


