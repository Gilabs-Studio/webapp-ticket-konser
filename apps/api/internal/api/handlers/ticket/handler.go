package ticket

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket"
	ticketservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/ticket"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	ticketService *ticketservice.Service
}

func NewHandler(ticketService *ticketservice.Service) *Handler {
	return &Handler{
		ticketService: ticketService,
	}
}

// List lists tickets with pagination and filters
// GET /api/v1/tickets
func (h *Handler) List(c *gin.Context) {
	var req ticket.ListTicketsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	tickets, pagination, err := h.ticketService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: pagination,
	}
	response.SuccessResponse(c, tickets, meta)
}

// GetByID gets a ticket by ID
// GET /api/v1/tickets/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	ticket, err := h.ticketService.GetByID(id)
	if err != nil {
		if err == ticketservice.ErrTicketNotFound {
			errors.NotFoundResponse(c, "ticket", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, ticket, meta)
}
