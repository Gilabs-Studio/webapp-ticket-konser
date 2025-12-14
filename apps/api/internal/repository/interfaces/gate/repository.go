package gate

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/gate"
)

// Repository defines the interface for gate repository operations
type Repository interface {
	// FindByID finds a gate by ID
	FindByID(id string) (*gate.Gate, error)

	// FindByCode finds a gate by code
	FindByCode(code string) (*gate.Gate, error)

	// Create creates a new gate
	Create(g *gate.Gate) error

	// Update updates a gate
	Update(g *gate.Gate) error

	// Delete soft deletes a gate
	Delete(id string) error

	// List lists gates with filters and pagination
	List(page, perPage int, filters map[string]interface{}) ([]*gate.Gate, int64, error)

	// CountByStatus counts gates by status
	CountByStatus(status gate.GateStatus) (int64, error)

	// CountByVIP counts gates by VIP status
	CountByVIP(isVIP bool) (int64, error)
}
