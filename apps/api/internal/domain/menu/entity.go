package menu

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Menu represents a menu entity
type Menu struct {
	ID            string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ParentID      *string   `gorm:"type:uuid;index" json:"parent_id"`
	Parent        *Menu      `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children      []Menu    `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Code          string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"`
	Label         string    `gorm:"type:varchar(255);not null" json:"label"`
	Icon          string    `gorm:"type:varchar(100)" json:"icon"`
	Path          string    `gorm:"type:varchar(255)" json:"path"`
	OrderIndex    int       `gorm:"default:0" json:"order_index"`
	PermissionCode string   `gorm:"type:varchar(100)" json:"permission_code"`
	IsActive      bool      `gorm:"default:true" json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Menu
func (Menu) TableName() string {
	return "menus"
}

// BeforeCreate hook to generate UUID
func (m *Menu) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}

// MenuResponse represents menu response DTO
type MenuResponse struct {
	ID            string         `json:"id"`
	ParentID      *string        `json:"parent_id"`
	Code          string         `json:"code"`
	Label         string         `json:"label"`
	Icon          string         `json:"icon"`
	Path          string         `json:"path"`
	OrderIndex    int            `json:"order_index"`
	PermissionCode string        `json:"permission_code"`
	IsActive      bool           `json:"is_active"`
	Children      []MenuResponse `json:"children,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

// ToMenuResponse converts Menu to MenuResponse (recursive for children)
func (m *Menu) ToMenuResponse() *MenuResponse {
	resp := &MenuResponse{
		ID:            m.ID,
		ParentID:      m.ParentID,
		Code:          m.Code,
		Label:         m.Label,
		Icon:          m.Icon,
		Path:          m.Path,
		OrderIndex:    m.OrderIndex,
		PermissionCode: m.PermissionCode,
		IsActive:      m.IsActive,
		CreatedAt:     m.CreatedAt,
		UpdatedAt:     m.UpdatedAt,
	}

	// Convert children recursively
	if len(m.Children) > 0 {
		resp.Children = make([]MenuResponse, len(m.Children))
		for i, child := range m.Children {
			resp.Children[i] = *child.ToMenuResponse()
		}
	}

	return resp
}

// CreateMenuRequest represents create menu request DTO
type CreateMenuRequest struct {
	ParentID       *string `json:"parent_id" binding:"omitempty,uuid"`
	Code           string  `json:"code" binding:"required,min=1,max=100"`
	Label          string  `json:"label" binding:"required,min=1,max=255"`
	Icon           string  `json:"icon" binding:"omitempty,max=100"`
	Path           string  `json:"path" binding:"omitempty,max=255"`
	OrderIndex     int     `json:"order_index" binding:"omitempty"`
	PermissionCode string  `json:"permission_code" binding:"omitempty,max=100"`
	IsActive       bool    `json:"is_active"`
}

// UpdateMenuRequest represents update menu request DTO
type UpdateMenuRequest struct {
	ParentID       *string `json:"parent_id" binding:"omitempty,uuid"`
	Code           string  `json:"code" binding:"omitempty,min=1,max=100"`
	Label          string  `json:"label" binding:"omitempty,min=1,max=255"`
	Icon           string  `json:"icon" binding:"omitempty,max=100"`
	Path           string  `json:"path" binding:"omitempty,max=255"`
	OrderIndex     *int    `json:"order_index"`
	PermissionCode *string `json:"permission_code" binding:"omitempty,max=100"`
	IsActive       *bool   `json:"is_active"`
}







