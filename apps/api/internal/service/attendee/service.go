package attendee

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/attendee"
	attendeeRepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/attendee"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
)

type Service struct {
	repo attendeeRepo.Repository
}

func NewService(repo attendeeRepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// List lists attendees with pagination and filters
func (s *Service) List(req *attendee.ListAttendeesRequest) ([]*attendee.AttendeeResponse, *response.PaginationMeta, error) {
	page := 1
	perPage := 20

	if req.Page > 0 {
		page = req.Page
	}
	if req.PerPage > 0 {
		perPage = req.PerPage
	}

	// Build filters map
	filters := make(map[string]interface{})
	if req.Search != "" {
		filters["search"] = req.Search
	}
	if req.TicketTier != "" {
		filters["ticket_tier"] = req.TicketTier
	}
	if req.Status != "" {
		filters["status"] = req.Status
	}
	if req.StartDate != nil {
		filters["start_date"] = req.StartDate
	}
	if req.EndDate != nil {
		filters["end_date"] = req.EndDate
	}

	// Get attendees from repository
	attendees, total, err := s.repo.List(page, perPage, filters)
	if err != nil {
		return nil, nil, err
	}

	// Convert to response DTOs
	responses := make([]*attendee.AttendeeResponse, len(attendees))
	for i, a := range attendees {
		responses[i] = a.ToAttendeeResponse()
	}

	// Create pagination meta
	paginationMeta := response.NewPaginationMeta(page, perPage, int(total))

	return responses, paginationMeta, nil
}

// GetStatistics gets attendee statistics
func (s *Service) GetStatistics(req *attendee.ListAttendeesRequest) (*attendee.AttendeeStatistics, error) {
	// Build filters map
	filters := make(map[string]interface{})
	if req.StartDate != nil {
		filters["start_date"] = req.StartDate
	}
	if req.EndDate != nil {
		filters["end_date"] = req.EndDate
	}

	return s.repo.GetStatistics(filters)
}

// Export exports attendees to CSV format
func (s *Service) Export(req *attendee.ListAttendeesRequest) ([][]string, error) {
	// Build filters map
	filters := make(map[string]interface{})
	if req.Search != "" {
		filters["search"] = req.Search
	}
	if req.TicketTier != "" {
		filters["ticket_tier"] = req.TicketTier
	}
	if req.Status != "" {
		filters["status"] = req.Status
	}
	if req.StartDate != nil {
		filters["start_date"] = req.StartDate
	}
	if req.EndDate != nil {
		filters["end_date"] = req.EndDate
	}

	return s.repo.Export(filters)
}
