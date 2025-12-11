package ticketcategory

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
)

// Repository defines the interface for ticket category repository operations
type Repository interface {
	// FindByID finds a ticket category by ID
	FindByID(id string) (*ticketcategory.TicketCategory, error)
	
	// FindByEventID finds ticket categories by event ID
	FindByEventID(eventID string) ([]*ticketcategory.TicketCategory, error)
	
	// Create creates a new ticket category
	Create(tc *ticketcategory.TicketCategory) error
	
	// Update updates a ticket category
	Update(tc *ticketcategory.TicketCategory) error
	
	// Delete soft deletes a ticket category
	Delete(id string) error
	
	// List lists all ticket categories
	List() ([]*ticketcategory.TicketCategory, error)
}


