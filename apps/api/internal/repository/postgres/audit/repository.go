package audit

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/audit"
	auditrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/audit"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) auditrepo.Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(log *audit.AuditLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) FindByID(id string) (*audit.AuditLog, error) {
	var log audit.AuditLog
	if err := r.db.Where("id = ?", id).First(&log).Error; err != nil {
		return nil, err
	}
	return &log, nil
}

func (r *Repository) List(page, perPage int, filters map[string]interface{}) ([]*audit.AuditLog, int64, error) {
	var logs []*audit.AuditLog
	var total int64

	query := r.db.Model(&audit.AuditLog{})

	if userID, ok := filters["user_id"].(string); ok && userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	if action, ok := filters["action"].(string); ok && action != "" {
		query = query.Where("action = ?", action)
	}

	if resource, ok := filters["resource"].(string); ok && resource != "" {
		query = query.Where("resource = ?", resource)
	}

	if startDate, ok := filters["start_date"].(time.Time); ok {
		query = query.Where("created_at >= ?", startDate)
	}

	if endDate, ok := filters["end_date"].(time.Time); ok {
		query = query.Where("created_at <= ?", endDate)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * perPage
	if err := query.Order("created_at desc").Offset(offset).Limit(perPage).Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}
