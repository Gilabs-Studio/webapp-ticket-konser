package ticketcategory

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
	ticketcategoryrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/ticket_category"
	"gorm.io/gorm"
)

var (
	ErrTicketCategoryNotFound = errors.New("ticket category not found")
)

type Service struct {
	repo ticketcategoryrepo.Repository
}

func NewService(repo ticketcategoryrepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetByID returns a ticket category by ID
func (s *Service) GetByID(id string) (*ticketcategory.TicketCategoryResponse, error) {
	tc, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTicketCategoryNotFound
		}
		return nil, err
	}
	return tc.ToTicketCategoryResponse(), nil
}

// GetByEventID returns ticket categories by event ID
func (s *Service) GetByEventID(eventID string) ([]*ticketcategory.TicketCategoryResponse, error) {
	categories, err := s.repo.FindByEventID(eventID)
	if err != nil {
		return nil, err
	}

	responses := make([]*ticketcategory.TicketCategoryResponse, len(categories))
	for i, tc := range categories {
		responses[i] = tc.ToTicketCategoryResponse()
	}
	return responses, nil
}

// Create creates a new ticket category
func (s *Service) Create(req *ticketcategory.CreateTicketCategoryRequest) (*ticketcategory.TicketCategoryResponse, error) {
	tc := &ticketcategory.TicketCategory{
		EventID:      req.EventID,
		CategoryName: req.CategoryName,
		Price:        req.Price,
		Quota:        req.Quota,
		LimitPerUser: req.LimitPerUser,
	}

	if err := s.repo.Create(tc); err != nil {
		return nil, err
	}

	// Reload to get generated fields
	createdCategory, err := s.repo.FindByID(tc.ID)
	if err != nil {
		return nil, err
	}

	return createdCategory.ToTicketCategoryResponse(), nil
}

// Update updates a ticket category
func (s *Service) Update(id string, req *ticketcategory.UpdateTicketCategoryRequest) (*ticketcategory.TicketCategoryResponse, error) {
	tc, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTicketCategoryNotFound
		}
		return nil, err
	}

	// Update fields
	if req.CategoryName != nil {
		tc.CategoryName = *req.CategoryName
	}
	if req.Price != nil {
		tc.Price = *req.Price
	}
	if req.Quota != nil {
		tc.Quota = *req.Quota
	}
	if req.LimitPerUser != nil {
		tc.LimitPerUser = *req.LimitPerUser
	}

	if err := s.repo.Update(tc); err != nil {
		return nil, err
	}

	// Reload
	updatedCategory, err := s.repo.FindByID(tc.ID)
	if err != nil {
		return nil, err
	}

	return updatedCategory.ToTicketCategoryResponse(), nil
}

// Delete deletes a ticket category
func (s *Service) Delete(id string) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrTicketCategoryNotFound
		}
		return err
	}

	return s.repo.Delete(id)
}

// List lists all ticket categories
func (s *Service) List() ([]*ticketcategory.TicketCategoryResponse, error) {
	categories, err := s.repo.List()
	if err != nil {
		return nil, err
	}

	responses := make([]*ticketcategory.TicketCategoryResponse, len(categories))
	for i, tc := range categories {
		responses[i] = tc.ToTicketCategoryResponse()
	}
	return responses, nil
}



