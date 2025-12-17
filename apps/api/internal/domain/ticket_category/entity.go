package ticketcategory

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TicketCategory represents a ticket category entity
type TicketCategory struct {
	ID           string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	EventID      string         `gorm:"type:uuid;not null;index" json:"event_id"`
	Event        *event.Event   `gorm:"foreignKey:EventID" json:"event,omitempty"`
	CategoryName string         `gorm:"type:varchar(255);not null" json:"category_name"`
	Price        float64        `gorm:"type:decimal(15,2);not null" json:"price"`
	Quota        int            `gorm:"not null;default:0" json:"quota"`
	LimitPerUser int            `gorm:"not null;default:1" json:"limit_per_user"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for TicketCategory
func (TicketCategory) TableName() string {
	return "ticket_categories"
}

// BeforeCreate hook to generate UUID
func (tc *TicketCategory) BeforeCreate(tx *gorm.DB) error {
	if tc.ID == "" {
		tc.ID = uuid.New().String()
	}
	return nil
}

// TicketCategoryResponse represents ticket category response DTO
type TicketCategoryResponse struct {
	ID           string              `json:"id"`
	EventID      string              `json:"event_id"`
	Event        *event.EventResponse `json:"event,omitempty"`
	CategoryName string              `json:"category_name"`
	Price        float64             `json:"price"`
	Quota        int                 `json:"quota"`
	LimitPerUser int                 `json:"limit_per_user"`
	CreatedAt    time.Time           `json:"created_at"`
	UpdatedAt    time.Time           `json:"updated_at"`
}

// ToTicketCategoryResponse converts TicketCategory to TicketCategoryResponse
func (tc *TicketCategory) ToTicketCategoryResponse() *TicketCategoryResponse {
	resp := &TicketCategoryResponse{
		ID:           tc.ID,
		EventID:      tc.EventID,
		CategoryName: tc.CategoryName,
		Price:        tc.Price,
		Quota:        tc.Quota,
		LimitPerUser: tc.LimitPerUser,
		CreatedAt:    tc.CreatedAt,
		UpdatedAt:    tc.UpdatedAt,
	}
	if tc.Event != nil {
		resp.Event = tc.Event.ToEventResponse()
	}
	return resp
}

// CreateTicketCategoryRequest represents create ticket category request DTO
type CreateTicketCategoryRequest struct {
	EventID      string  `json:"event_id" binding:"required,uuid"`
	CategoryName string  `json:"category_name" binding:"required,min=1,max=255"`
	Price        float64 `json:"price" binding:"required,min=0"`
	Quota        int     `json:"quota" binding:"required,min=0"`
	LimitPerUser int     `json:"limit_per_user" binding:"required,min=1"`
}

// UpdateTicketCategoryRequest represents update ticket category request DTO
type UpdateTicketCategoryRequest struct {
	CategoryName *string  `json:"category_name" binding:"omitempty,min=1,max=255"`
	Price        *float64 `json:"price" binding:"omitempty,min=0"`
	Quota        *int     `json:"quota" binding:"omitempty,min=0"`
	LimitPerUser *int     `json:"limit_per_user" binding:"omitempty,min=1"`
}



