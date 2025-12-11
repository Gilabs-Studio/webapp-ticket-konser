package schedule

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/schedule"
)

// Repository defines the interface for schedule repository operations
type Repository interface {
	// FindByID finds a schedule by ID
	FindByID(id string) (*schedule.Schedule, error)
	
	// FindByEventID finds schedules by event ID
	FindByEventID(eventID string) ([]*schedule.Schedule, error)
	
	// FindByDate finds schedules by date
	FindByDate(date time.Time) ([]*schedule.Schedule, error)
	
	// Create creates a new schedule
	Create(s *schedule.Schedule) error
	
	// Update updates a schedule
	Update(s *schedule.Schedule) error
	
	// Delete soft deletes a schedule
	Delete(id string) error
	
	// List lists all schedules
	List() ([]*schedule.Schedule, error)
}


