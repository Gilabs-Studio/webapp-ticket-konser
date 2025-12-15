package ticket

import (
	"time"

	ticketcategory "github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
)

// Ticket represents a ticket with sales information (aggregated from ticket category and order items)
type Ticket struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Price        float64   `json:"price"`
	PriceFormatted string  `json:"price_formatted"`
	TotalQuota   int       `json:"total_quota"`
	Sold         int       `json:"sold"`
	Status       string    `json:"status"` // active, low_stock, sold_out, inactive
	CategoryID   string    `json:"category_id"`
	Category     *ticketcategory.TicketCategoryResponse `json:"category,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// TicketResponse represents ticket response DTO
type TicketResponse struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Price         float64   `json:"price"`
	PriceFormatted string   `json:"price_formatted"`
	TotalQuota    int       `json:"total_quota"`
	Sold          int       `json:"sold"`
	Status        string    `json:"status"`
	CategoryID    string    `json:"category_id"`
	Category      *ticketcategory.TicketCategoryResponse `json:"category,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ToTicketResponse converts Ticket to TicketResponse
func (t *Ticket) ToTicketResponse() *TicketResponse {
	return &TicketResponse{
		ID:            t.ID,
		Name:          t.Name,
		Description:   t.Description,
		Price:         t.Price,
		PriceFormatted: t.PriceFormatted,
		TotalQuota:    t.TotalQuota,
		Sold:          t.Sold,
		Status:        t.Status,
		CategoryID:    t.CategoryID,
		Category:      t.Category,
		CreatedAt:     t.CreatedAt,
		UpdatedAt:     t.UpdatedAt,
	}
}

// UpdateTicketStatusRequest represents update ticket status request
type UpdateTicketStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=active inactive"`
}

// ListTicketsRequest represents list tickets query parameters
type ListTicketsRequest struct {
	Page    int    `form:"page" binding:"omitempty,min=1"`
	PerPage int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Status  string `form:"status" binding:"omitempty,oneof=active low_stock sold_out inactive"`
	EventID string `form:"event_id" binding:"omitempty,uuid"`
}
