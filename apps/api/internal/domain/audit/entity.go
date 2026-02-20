package audit

import (
	"time"

	"gorm.io/gorm"
)

// AuditLog represents an audit log entry
type AuditLog struct {
	ID         string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID     string         `gorm:"type:uuid;index" json:"user_id"`
	Action     string         `gorm:"type:varchar(100);not null" json:"action"`
	Resource   string         `gorm:"type:varchar(100);not null" json:"resource"`
	ResourceID string         `gorm:"type:varchar(100);not null" json:"resource_id"`
	OldValue   string         `gorm:"type:text" json:"old_value"`
	NewValue   string         `gorm:"type:text" json:"new_value"`
	IPAddress  string         `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent  string         `gorm:"type:text" json:"user_agent"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for AuditLog
func (AuditLog) TableName() string {
	return "audit_logs"
}

// AuditLogResponse represents audit log response DTO
type AuditLogResponse struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	Action     string    `json:"action"`
	Resource   string    `json:"resource"`
	ResourceID string    `json:"resource_id"`
	OldValue   string    `json:"old_value"`
	NewValue   string    `json:"new_value"`
	IPAddress  string    `json:"ip_address"`
	UserAgent  string    `json:"user_agent"`
	CreatedAt  time.Time `json:"created_at"`
}

// ToAuditLogResponse converts AuditLog to AuditLogResponse
func (a *AuditLog) ToAuditLogResponse() *AuditLogResponse {
	return &AuditLogResponse{
		ID:         a.ID,
		UserID:     a.UserID,
		Action:     a.Action,
		Resource:   a.Resource,
		ResourceID: a.ResourceID,
		OldValue:   a.OldValue,
		NewValue:   a.NewValue,
		IPAddress:  a.IPAddress,
		UserAgent:  a.UserAgent,
		CreatedAt:  a.CreatedAt,
	}
}

// ListAuditLogRequest represents list audit log request filters
type ListAuditLogRequest struct {
	Page      int        `form:"page" binding:"omitempty,min=1"`
	PerPage   int        `form:"per_page" binding:"omitempty,min=1,max=100"`
	UserID    string     `form:"user_id" binding:"omitempty"`
	Action    string     `form:"action" binding:"omitempty"`
	Resource  string     `form:"resource" binding:"omitempty"`
	StartDate *time.Time `form:"start_date" binding:"omitempty"`
	EndDate   *time.Time `form:"end_date" binding:"omitempty"`
}
