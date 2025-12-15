package merchandise

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/merchandise"
)

// Repository defines the interface for merchandise repository operations
type Repository interface {
	// FindByID finds a merchandise by ID
	FindByID(id string) (*merchandise.Merchandise, error)
	
	// Create creates a new merchandise
	Create(m *merchandise.Merchandise) error
	
	// Update updates a merchandise
	Update(m *merchandise.Merchandise) error
	
	// Delete soft deletes a merchandise
	Delete(id string) error
	
	// List lists all merchandises with pagination and filters
	List(page, perPage int, filters map[string]interface{}) ([]*merchandise.Merchandise, int64, error)
}
