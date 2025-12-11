package role

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Role represents a role entity
type Role struct {
	ID           string          `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code         string          `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"`
	Name         string          `gorm:"type:varchar(255);not null" json:"name"`
	Description  string          `gorm:"type:text" json:"description"`
	IsAdmin      bool            `gorm:"default:false" json:"is_admin"`
	CanLoginAdmin bool           `gorm:"default:true" json:"can_login_admin"`
	Permissions  []RolePermission `gorm:"foreignKey:RoleID" json:"permissions,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	DeletedAt    gorm.DeletedAt  `gorm:"index" json:"-"`
}

// RolePermission represents the relationship between role and permission
type RolePermission struct {
	ID           string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RoleID       string    `gorm:"type:uuid;not null;index" json:"role_id"`
	PermissionID string    `gorm:"type:uuid;not null;index" json:"permission_id"`
	CreatedAt    time.Time `json:"created_at"`
}

// TableName specifies the table name for Role
func (Role) TableName() string {
	return "roles"
}

// TableName specifies the table name for RolePermission
func (RolePermission) TableName() string {
	return "role_permissions"
}

// BeforeCreate hook to generate UUID for RolePermission
func (rp *RolePermission) BeforeCreate(tx *gorm.DB) error {
	if rp.ID == "" {
		rp.ID = uuid.New().String()
	}
	return nil
}

// BeforeCreate hook to generate UUID
func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

// RoleResponse represents role response DTO
type RoleResponse struct {
	ID           string    `json:"id"`
	Code         string    `json:"code"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	IsAdmin      bool      `json:"is_admin"`
	CanLoginAdmin bool     `json:"can_login_admin"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// RoleWithPermissionsResponse represents role response with permissions
type RoleWithPermissionsResponse struct {
	ID           string                      `json:"id"`
	Code         string                      `json:"code"`
	Name         string                      `json:"name"`
	Description  string                      `json:"description"`
	IsAdmin      bool                        `json:"is_admin"`
	CanLoginAdmin bool                       `json:"can_login_admin"`
	Permissions  []PermissionResponse        `json:"permissions,omitempty"`
	CreatedAt    time.Time                   `json:"created_at"`
	UpdatedAt    time.Time                   `json:"updated_at"`
}

// PermissionResponse represents permission in role response
type PermissionResponse struct {
	ID          string `json:"id"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	Resource    string `json:"resource"`
	Action      string `json:"action"`
}

// ToRoleResponse converts Role to RoleResponse
func (r *Role) ToRoleResponse() *RoleResponse {
	return &RoleResponse{
		ID:           r.ID,
		Code:         r.Code,
		Name:         r.Name,
		Description:  r.Description,
		IsAdmin:      r.IsAdmin,
		CanLoginAdmin: r.CanLoginAdmin,
		CreatedAt:    r.CreatedAt,
		UpdatedAt:    r.UpdatedAt,
	}
}

// CreateRoleRequest represents create role request DTO
type CreateRoleRequest struct {
	Code         string `json:"code" binding:"required,min=3,max=50"`
	Name         string `json:"name" binding:"required,min=3,max=255"`
	Description  string `json:"description"`
	IsAdmin      *bool  `json:"is_admin"`
	CanLoginAdmin *bool `json:"can_login_admin"`
}

// UpdateRoleRequest represents update role request DTO
type UpdateRoleRequest struct {
	Name         string `json:"name" binding:"omitempty,min=3,max=255"`
	Description  string `json:"description"`
	IsAdmin      *bool  `json:"is_admin"`
	CanLoginAdmin *bool `json:"can_login_admin"`
}

// ListRolesRequest represents list roles query parameters
type ListRolesRequest struct {
	Page    int    `form:"page" binding:"omitempty,min=1"`
	PerPage int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search  string `form:"search" binding:"omitempty"`
}

// AssignPermissionsRequest represents assign permissions to role request
type AssignPermissionsRequest struct {
	PermissionIDs []string `json:"permission_ids" binding:"required,min=1"`
}

