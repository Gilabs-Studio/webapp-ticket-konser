package permission

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Permission represents a permission entity
type Permission struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Resource    string    `gorm:"type:varchar(100);not null" json:"resource"`
	Action      string    `gorm:"type:varchar(50);not null" json:"action"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Permission
func (Permission) TableName() string {
	return "permissions"
}

// BeforeCreate hook to generate UUID
func (p *Permission) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// PermissionResponse represents permission response DTO
type PermissionResponse struct {
	ID          string    `json:"id"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Resource    string    `json:"resource"`
	Action      string    `json:"action"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToPermissionResponse converts Permission to PermissionResponse
func (p *Permission) ToPermissionResponse() *PermissionResponse {
	return &PermissionResponse{
		ID:          p.ID,
		Code:        p.Code,
		Name:        p.Name,
		Description: p.Description,
		Resource:    p.Resource,
		Action:      p.Action,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

// CreatePermissionRequest represents create permission request DTO
type CreatePermissionRequest struct {
	Code        string `json:"code" binding:"required,min=3,max=100"`
	Name        string `json:"name" binding:"required,min=3,max=255"`
	Description string `json:"description"`
	Resource    string `json:"resource" binding:"required,min=1,max=100"`
	Action      string `json:"action" binding:"required,min=1,max=50"`
}

// UpdatePermissionRequest represents update permission request DTO
type UpdatePermissionRequest struct {
	Name        string `json:"name" binding:"omitempty,min=3,max=255"`
	Description string `json:"description"`
	Resource    string `json:"resource" binding:"omitempty,min=1,max=100"`
	Action      string `json:"action" binding:"omitempty,min=1,max=50"`
}

// ListPermissionsRequest represents list permissions query parameters
type ListPermissionsRequest struct {
	Page     int    `form:"page" binding:"omitempty,min=1"`
	PerPage  int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search   string `form:"search" binding:"omitempty"`
	Resource string `form:"resource" binding:"omitempty"`
}






