package audit

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/audit"
)

type Repository interface {
	Create(log *audit.AuditLog) error
	List(page, perPage int, filters map[string]interface{}) ([]*audit.AuditLog, int64, error)
	FindByID(id string) (*audit.AuditLog, error)
}
