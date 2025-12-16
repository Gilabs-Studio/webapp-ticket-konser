package ticketcategory

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
	ticketcategoryservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/ticket_category"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	ticketCategoryService *ticketcategoryservice.Service
}

func NewHandler(ticketCategoryService *ticketcategoryservice.Service) *Handler {
	return &Handler{
		ticketCategoryService: ticketCategoryService,
	}
}

// List lists all ticket categories
// GET /api/v1/admin/ticket-categories
func (h *Handler) List(c *gin.Context) {
	categories, err := h.ticketCategoryService.List()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, categories, meta)
}

// GetByID gets a ticket category by ID
// GET /api/v1/admin/ticket-categories/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	category, err := h.ticketCategoryService.GetByID(id)
	if err != nil {
		if err == ticketcategoryservice.ErrTicketCategoryNotFound {
			errors.NotFoundResponse(c, "ticket_category", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, category, meta)
}

// GetByEventID gets ticket categories by event ID (admin)
// GET /api/v1/admin/ticket-categories/event/:event_id
func (h *Handler) GetByEventID(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "event_id",
		}, nil)
		return
	}

	categories, err := h.ticketCategoryService.GetByEventID(eventID)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, categories, meta)
}

// GetByEventIDPublic gets ticket categories by event ID (public)
// GET /api/v1/events/:event_id/ticket-categories
func (h *Handler) GetByEventIDPublic(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "event_id",
		}, nil)
		return
	}

	categories, err := h.ticketCategoryService.GetByEventID(eventID)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, categories, meta)
}

// Create creates a new ticket category
// POST /api/v1/admin/ticket-categories
func (h *Handler) Create(c *gin.Context) {
	var req ticketcategory.CreateTicketCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	createdCategory, err := h.ticketCategoryService.Create(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponseCreated(c, createdCategory, meta)
}

// Update updates a ticket category
// PUT /api/v1/admin/ticket-categories/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req ticketcategory.UpdateTicketCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	updatedCategory, err := h.ticketCategoryService.Update(id, &req)
	if err != nil {
		if err == ticketcategoryservice.ErrTicketCategoryNotFound {
			errors.NotFoundResponse(c, "ticket_category", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, updatedCategory, meta)
}

// Delete deletes a ticket category
// DELETE /api/v1/admin/ticket-categories/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.ticketCategoryService.Delete(id)
	if err != nil {
		if err == ticketcategoryservice.ErrTicketCategoryNotFound {
			errors.NotFoundResponse(c, "ticket_category", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}
