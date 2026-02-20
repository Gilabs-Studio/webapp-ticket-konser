package audit

import (
	"encoding/json"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/audit"
	auditrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/audit"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type Service struct {
	repo auditrepo.Repository
}

func NewService(repo auditrepo.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Log(c *gin.Context, action, resource, resourceID string, oldValue, newValue interface{}) error {
	userID, _ := c.Get("user_id")
	userIDStr, _ := userID.(string)

	oldJSON, _ := json.Marshal(oldValue)
	newJSON, _ := json.Marshal(newValue)

	log := &audit.AuditLog{
		UserID:     userIDStr,
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		OldValue:   string(oldJSON),
		NewValue:   string(newJSON),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}

	return s.repo.Create(log)
}

func (s *Service) List(req *audit.ListAuditLogRequest) ([]*audit.AuditLogResponse, *response.PaginationMeta, error) {
	page := 1
	perPage := 20

	if req.Page > 0 {
		page = req.Page
	}
	if req.PerPage > 0 {
		perPage = req.PerPage
	}

	filters := make(map[string]interface{})
	if req.UserID != "" {
		filters["user_id"] = req.UserID
	}
	if req.Action != "" {
		filters["action"] = req.Action
	}
	if req.Resource != "" {
		filters["resource"] = req.Resource
	}
	if req.StartDate != nil {
		filters["start_date"] = *req.StartDate
	}
	if req.EndDate != nil {
		filters["end_date"] = *req.EndDate
	}

	logs, total, err := s.repo.List(page, perPage, filters)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]*audit.AuditLogResponse, len(logs))
	for i, l := range logs {
		responses[i] = l.ToAuditLogResponse()
	}

	return responses, response.NewPaginationMeta(page, perPage, int(total)), nil
}
