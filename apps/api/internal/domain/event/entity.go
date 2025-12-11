package event

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// EventStatus represents event status enum
type EventStatus string

const (
	EventStatusDraft     EventStatus = "draft"
	EventStatusPublished EventStatus = "published"
	EventStatusClosed    EventStatus = "closed"
)

// Event represents an event entity
type Event struct {
	ID          string      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	EventName   string      `gorm:"type:varchar(255);not null" json:"event_name"`
	Description string      `gorm:"type:text" json:"description"`
	BannerImage string      `gorm:"type:text" json:"banner_image"`
	Status      EventStatus `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`
	StartDate   time.Time   `gorm:"type:date;not null" json:"start_date"`
	EndDate     time.Time   `gorm:"type:date;not null" json:"end_date"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Event
func (Event) TableName() string {
	return "events"
}

// BeforeCreate hook to generate UUID
func (e *Event) BeforeCreate(tx *gorm.DB) error {
	if e.ID == "" {
		e.ID = uuid.New().String()
	}
	return nil
}

// EventResponse represents event response DTO
type EventResponse struct {
	ID          string      `json:"id"`
	EventName   string      `json:"event_name"`
	Description string      `json:"description"`
	BannerImage string      `json:"banner_image"`
	Status      EventStatus `json:"status"`
	StartDate   time.Time   `json:"start_date"`
	EndDate     time.Time   `json:"end_date"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// ToEventResponse converts Event to EventResponse
func (e *Event) ToEventResponse() *EventResponse {
	// Ensure status has a default value if empty
	status := e.Status
	if status == "" {
		status = EventStatusDraft
	}
	
	return &EventResponse{
		ID:          e.ID,
		EventName:   e.EventName,
		Description: e.Description,
		BannerImage: e.BannerImage,
		Status:      status,
		StartDate:   e.StartDate,
		EndDate:     e.EndDate,
		CreatedAt:   e.CreatedAt,
		UpdatedAt:   e.UpdatedAt,
	}
}

// CreateEventRequest represents create event request DTO
type CreateEventRequest struct {
	EventName   string      `json:"event_name" binding:"required,min=1,max=255"`
	Description string      `json:"description" binding:"omitempty"`
	BannerImage string      `json:"banner_image" binding:"omitempty"`
	Status      EventStatus `json:"status" binding:"omitempty,oneof=draft published closed"`
	StartDate   time.Time   `json:"start_date" binding:"required"`
	EndDate     time.Time   `json:"end_date" binding:"required"`
}

// UpdateEventRequest represents update event request DTO
type UpdateEventRequest struct {
	EventName   *string      `json:"event_name" binding:"omitempty,min=1,max=255"`
	Description *string      `json:"description"`
	BannerImage *string      `json:"banner_image"`
	Status      *EventStatus `json:"status" binding:"omitempty,oneof=draft published closed"`
	StartDate   *time.Time   `json:"start_date"`
	EndDate     *time.Time   `json:"end_date"`
}

// UpdateEventStatusRequest represents update event status request DTO
type UpdateEventStatusRequest struct {
	Status EventStatus `json:"status" binding:"required,oneof=draft published closed"`
}

// ListEventRequest represents list event request with filters
type ListEventRequest struct {
	Page      int         `form:"page" binding:"omitempty,min=1"`
	PerPage   int         `form:"per_page" binding:"omitempty,min=1,max=100"`
	Status    EventStatus `form:"status" binding:"omitempty,oneof=draft published closed"`
	Search    string      `form:"search" binding:"omitempty"`
	SortBy    string      `form:"sort_by" binding:"omitempty"`
	SortOrder string      `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}

