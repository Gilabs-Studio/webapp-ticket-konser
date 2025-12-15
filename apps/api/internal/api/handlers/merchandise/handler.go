package merchandise

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/merchandise"
	merchandiseservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/merchandise"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	merchandiseService *merchandiseservice.Service
}

func NewHandler(merchandiseService *merchandiseservice.Service) *Handler {
	return &Handler{
		merchandiseService: merchandiseService,
	}
}

// List lists merchandises with pagination and filters
// GET /api/v1/merchandise
func (h *Handler) List(c *gin.Context) {
	var req merchandise.ListMerchandiseRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	merchandises, pagination, err := h.merchandiseService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: pagination,
	}
	response.SuccessResponse(c, merchandises, meta)
}

// GetByID gets a merchandise by ID
// GET /api/v1/merchandise/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	merchandise, err := h.merchandiseService.GetByID(id)
	if err != nil {
		if err == merchandiseservice.ErrMerchandiseNotFound {
			errors.NotFoundResponse(c, "merchandise", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, merchandise, meta)
}

// Create creates a new merchandise
// POST /api/v1/merchandise
func (h *Handler) Create(c *gin.Context) {
	var req merchandise.CreateMerchandiseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	merchandise, err := h.merchandiseService.Create(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponseCreated(c, merchandise, meta)
}

// Update updates a merchandise
// PUT /api/v1/merchandise/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req merchandise.UpdateMerchandiseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	merchandise, err := h.merchandiseService.Update(id, &req)
	if err != nil {
		if err == merchandiseservice.ErrMerchandiseNotFound {
			errors.NotFoundResponse(c, "merchandise", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, merchandise, meta)
}

// Delete deletes a merchandise
// DELETE /api/v1/merchandise/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.merchandiseService.Delete(id)
	if err != nil {
		if err == merchandiseservice.ErrMerchandiseNotFound {
			errors.NotFoundResponse(c, "merchandise", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// GetInventory gets merchandise inventory summary
// GET /api/v1/merchandise/inventory
func (h *Handler) GetInventory(c *gin.Context) {
	eventID := c.Query("event_id")

	inventory, err := h.merchandiseService.GetInventory(eventID)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, inventory, meta)
}
