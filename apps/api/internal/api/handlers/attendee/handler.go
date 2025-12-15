package attendee

import (
	"encoding/csv"
	"net/http"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/attendee"
	attendeeservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/attendee"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	attendeeService *attendeeservice.Service
}

func NewHandler(attendeeService *attendeeservice.Service) *Handler {
	return &Handler{
		attendeeService: attendeeService,
	}
}

// List lists attendees with pagination and filters
// GET /api/v1/admin/attendees
func (h *Handler) List(c *gin.Context) {
	var req attendee.ListAttendeesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	attendees, paginationMeta, err := h.attendeeService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: paginationMeta,
		Filters: map[string]interface{}{
			"search":      req.Search,
			"ticket_tier": req.TicketTier,
			"status":      req.Status,
		},
	}

	response.SuccessResponse(c, attendees, meta)
}

// GetStatistics gets attendee statistics
// GET /api/v1/admin/attendees/statistics
func (h *Handler) GetStatistics(c *gin.Context) {
	var req attendee.ListAttendeesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	statistics, err := h.attendeeService.GetStatistics(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, statistics, meta)
}

// Export exports attendees to CSV
// GET /api/v1/admin/attendees/export
func (h *Handler) Export(c *gin.Context) {
	var req attendee.ListAttendeesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	csvData, err := h.attendeeService.Export(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Set response headers for CSV download
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=attendees.csv")

	// Write CSV to response
	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	for _, row := range csvData {
		if err := writer.Write(row); err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
	}
}
