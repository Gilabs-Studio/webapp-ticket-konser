package ticket

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket"
)

// Repository defines the interface for ticket repository operations
type Repository interface {
	// List lists all tickets with sales information
	List(page, perPage int, filters map[string]interface{}) ([]*ticket.Ticket, int64, error)
	
	// GetByID gets a ticket by ID
	GetByID(id string) (*ticket.Ticket, error)
	
	// GetSoldCount gets the sold count for a ticket category
	GetSoldCount(categoryID string) (int, error)
}
