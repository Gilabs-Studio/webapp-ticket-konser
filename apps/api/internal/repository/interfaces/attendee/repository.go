package attendee

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/attendee"
)

// Repository defines the interface for attendee repository operations
type Repository interface {
	// List lists attendees with pagination and filters
	List(page, perPage int, filters map[string]interface{}) ([]*attendee.Attendee, int64, error)

	// GetStatistics gets attendee statistics
	GetStatistics(filters map[string]interface{}) (*attendee.AttendeeStatistics, error)

	// Export exports attendees to CSV format
	Export(filters map[string]interface{}) ([][]string, error)
}
