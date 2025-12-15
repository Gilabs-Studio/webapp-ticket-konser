package attendee

import (
	"time"
)

// AttendeeStatus represents attendee status enum
type AttendeeStatus string

const (
	AttendeeStatusRegistered AttendeeStatus = "registered"
	AttendeeStatusCheckedIn  AttendeeStatus = "checked_in"
	AttendeeStatusCancelled  AttendeeStatus = "cancelled"
)

// TicketTier represents ticket tier enum
type TicketTier string

const (
	TicketTierVIP      TicketTier = "VIP"
	TicketTierGeneral TicketTier = "General"
	TicketTierPremium TicketTier = "Premium"
	TicketTierStandard TicketTier = "Standard"
)

// Attendee represents an attendee (view from order_items)
// This is not a database entity, but a view/aggregation of order_items
type Attendee struct {
	ID                string         `json:"id"`                 // order_item.id
	UserID            string         `json:"user_id"`          // order.user_id
	Name              string         `json:"name"`              // user.name
	Email             string         `json:"email"`             // user.email
	TicketType        string         `json:"ticket_type"`       // category.category_name
	TicketTier        TicketTier     `json:"ticket_tier"`      // mapped from category.category_name
	RegistrationDate  time.Time      `json:"registration_date"` // order.created_at
	Status            AttendeeStatus `json:"status"`            // derived from order_item.status and check_ins
	CheckedInAt       *time.Time     `json:"checked_in_at"`     // from check_ins.checked_in_at or order_item.check_in_time
	AvatarURL         string         `json:"avatar_url"`        // user.avatar_url
	OrderID           string         `json:"order_id"`          // order.id
	OrderItemID       string         `json:"order_item_id"`     // order_item.id
	QRCode            string         `json:"qr_code"`           // order_item.qr_code
	CategoryID        string         `json:"category_id"`       // category.id
}

// AttendeeResponse represents attendee response DTO
type AttendeeResponse struct {
	ID               string         `json:"id"`
	UserID           string         `json:"user_id"`
	Name             string         `json:"name"`
	Email            string         `json:"email"`
	TicketType       string         `json:"ticket_type"`
	TicketTier       TicketTier     `json:"ticket_tier"`
	RegistrationDate time.Time      `json:"registration_date"`
	Status           AttendeeStatus `json:"status"`
	CheckedInAt      *time.Time     `json:"checked_in_at,omitempty"`
	AvatarURL        string         `json:"avatar_url,omitempty"`
}

// ToAttendeeResponse converts Attendee to AttendeeResponse
func (a *Attendee) ToAttendeeResponse() *AttendeeResponse {
	return &AttendeeResponse{
		ID:               a.ID,
		UserID:           a.UserID,
		Name:             a.Name,
		Email:            a.Email,
		TicketType:       a.TicketType,
		TicketTier:       a.TicketTier,
		RegistrationDate: a.RegistrationDate,
		Status:           a.Status,
		CheckedInAt:      a.CheckedInAt,
		AvatarURL:        a.AvatarURL,
	}
}

// ListAttendeesRequest represents list attendees query parameters
type ListAttendeesRequest struct {
	Page       int           `form:"page" binding:"omitempty,min=1"`
	PerPage    int           `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search     string        `form:"search" binding:"omitempty"`
	TicketTier TicketTier    `form:"ticket_tier" binding:"omitempty,oneof=VIP General Premium Standard"`
	Status     AttendeeStatus `form:"status" binding:"omitempty,oneof=registered checked_in cancelled"`
	StartDate  *time.Time    `form:"start_date" binding:"omitempty"`
	EndDate    *time.Time    `form:"end_date" binding:"omitempty"`
}

// AttendeeStatistics represents attendee statistics
type AttendeeStatistics struct {
	TotalAttendees      int64 `json:"total_attendees"`
	CheckedInCount      int64 `json:"checked_in_count"`
	RegisteredCount     int64 `json:"registered_count"`
	CancelledCount      int64 `json:"cancelled_count"`
	ByTicketTier        map[string]int64 `json:"by_ticket_tier"`
}

// AttendeeStatisticsResponse represents attendee statistics response
type AttendeeStatisticsResponse struct {
	Statistics AttendeeStatistics `json:"statistics"`
}
