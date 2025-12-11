package event

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
)

// Repository defines the interface for event repository operations
type Repository interface {
	// FindByID finds an event by ID
	FindByID(id string) (*event.Event, error)

	// FindByName finds an event by name
	FindByName(name string) (*event.Event, error)

	// Create creates a new event
	Create(e *event.Event) error

	// Update updates an event
	Update(e *event.Event) error

	// Delete soft deletes an event
	Delete(id string) error

	// List lists all events with pagination and filters
	List(page, perPage int, filters map[string]interface{}) ([]*event.Event, int64, error)

	// Count counts events with filters
	Count(filters map[string]interface{}) (int64, error)
}

