package settings

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Settings represents system/event settings entity
type Settings struct {
	ID          string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Type        string         `gorm:"type:varchar(50);not null;uniqueIndex" json:"type"` // event, system
	Key         string         `gorm:"type:varchar(255);not null;uniqueIndex" json:"key"`
	Value       string         `gorm:"type:text" json:"value"`
	Description string         `gorm:"type:text" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Settings
func (Settings) TableName() string {
	return "settings"
}

// BeforeCreate hook to generate UUID
func (s *Settings) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return nil
}

// SettingsResponse represents settings response DTO
type SettingsResponse struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Key         string    `json:"key"`
	Value       string    `json:"value"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToSettingsResponse converts Settings to SettingsResponse
func (s *Settings) ToSettingsResponse() *SettingsResponse {
	return &SettingsResponse{
		ID:          s.ID,
		Type:        s.Type,
		Key:         s.Key,
		Value:       s.Value,
		Description: s.Description,
		CreatedAt:   s.CreatedAt,
		UpdatedAt:   s.UpdatedAt,
	}
}

// EventSettings represents event settings structure
type EventSettings struct {
	EventName    string `json:"event_name"`
	EventDate    string `json:"event_date"`
	Location     string `json:"location"`
	Description  string `json:"description"`
	BannerImage  string `json:"banner_image"`
	ContactEmail string `json:"contact_email"`
	ContactPhone string `json:"contact_phone"`
	IsSalesPaused bool   `json:"is_sales_paused"`
}

// SystemSettings represents system settings structure
type SystemSettings struct {
	SiteName        string `json:"site_name"`
	SiteDescription string `json:"site_description"`
	MaintenanceMode bool   `json:"maintenance_mode"`
	MaxUploadSize   int    `json:"max_upload_size"`
}

// GetEventSettingsRequest represents get event settings request
type GetEventSettingsRequest struct {
	Type string `form:"type" binding:"omitempty,oneof=event system"`
}

// UpdateEventSettingsRequest represents update event settings request
type UpdateEventSettingsRequest struct {
	EventName    *string `json:"event_name" binding:"omitempty,min=1,max=255"`
	EventDate    *string `json:"event_date" binding:"omitempty"`
	Location     *string `json:"location" binding:"omitempty,max=255"`
	Description  *string `json:"description" binding:"omitempty"`
	BannerImage  *string `json:"banner_image" binding:"omitempty,max=500"`
	ContactEmail *string `json:"contact_email" binding:"omitempty,email"`
	ContactPhone *string `json:"contact_phone" binding:"omitempty"`
	IsSalesPaused *bool   `json:"is_sales_paused" binding:"omitempty"`
}

// UpdateSystemSettingsRequest represents update system settings request
type UpdateSystemSettingsRequest struct {
	SiteName        *string `json:"site_name" binding:"omitempty,min=1,max=255"`
	SiteDescription *string `json:"site_description" binding:"omitempty"`
	MaintenanceMode *bool   `json:"maintenance_mode" binding:"omitempty"`
	MaxUploadSize   *int    `json:"max_upload_size" binding:"omitempty,min=1"`
}
