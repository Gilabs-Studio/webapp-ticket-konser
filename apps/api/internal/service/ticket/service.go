package ticket

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket"
	ticketrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/ticket"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"gorm.io/gorm"
)

var (
	ErrTicketNotFound = errors.New("ticket not found")
)

type Service struct {
	repo ticketrepo.Repository
}

func NewService(repo ticketrepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// List lists tickets with pagination and filters
func (s *Service) List(req *ticket.ListTicketsRequest) ([]*ticket.TicketResponse, *response.PaginationMeta, error) {
	page := 1
	perPage := 20

	if req.Page > 0 {
		page = req.Page
	}
	if req.PerPage > 0 && req.PerPage <= 100 {
		perPage = req.PerPage
	}

	// Build filters
	filters := make(map[string]interface{})
	if req.Status != "" {
		filters["status"] = req.Status
	}
	if req.EventID != "" {
		filters["event_id"] = req.EventID
	}

	tickets, total, err := s.repo.List(page, perPage, filters)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]*ticket.TicketResponse, len(tickets))
	for i, t := range tickets {
		responses[i] = t.ToTicketResponse()
	}

	pagination := response.NewPaginationMeta(page, perPage, int(total))

	return responses, pagination, nil
}

// GetByID returns a ticket by ID
func (s *Service) GetByID(id string) (*ticket.TicketResponse, error) {
	t, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTicketNotFound
		}
		return nil, err
	}
	return t.ToTicketResponse(), nil
}
