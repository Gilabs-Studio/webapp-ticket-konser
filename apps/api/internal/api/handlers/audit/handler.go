package audit

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/audit"
	auditservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/audit"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *auditservice.Service
}

func NewHandler(service *auditservice.Service) *Handler {
	return &Handler{service: service}
}

// List lists all audit logs with pagination and filters
// GET /api/v1/admin/audit-logs
func (h *Handler) List(c *gin.Context) {
	var req audit.ListAuditLogRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		errors.InvalidQueryParamResponse(c)
		return
	}

	logs, paginationMeta, err := h.service.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: paginationMeta,
		Filters: map[string]interface{}{
			"user_id":  req.UserID,
			"action":   req.Action,
			"resource": req.Resource,
		},
	}

	response.SuccessResponse(c, logs, meta)
}
