package event

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	eventrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/event"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"gorm.io/gorm"
)

var (
	ErrEventNotFound      = errors.New("event not found")
	ErrEventAlreadyExists = errors.New("event already exists")
	ErrInvalidDateRange   = errors.New("end date must be after start date")
	ErrInvalidStatus      = errors.New("invalid event status")
)

type Service struct {
	repo eventrepo.Repository
}

func NewService(repo eventrepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetByID returns an event by ID
func (s *Service) GetByID(id string) (*event.EventResponse, error) {
	e, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || (err != nil && err.Error() == "event not found") {
			return nil, ErrEventNotFound
		}
		return nil, err
	}
	return e.ToEventResponse(), nil
}

// Create creates a new event
func (s *Service) Create(req *event.CreateEventRequest) (*event.EventResponse, error) {
	// Validate date range
	if req.EndDate.Before(req.StartDate) {
		return nil, ErrInvalidDateRange
	}

	// Check if event name already exists
	_, err := s.repo.FindByName(req.EventName)
	if err == nil {
		return nil, ErrEventAlreadyExists
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		// Check if it's a "not found" error from repository
		if err.Error() != "event not found" {
			return nil, err
		}
	}

	// Set default status if not provided
	status := req.Status
	if status == "" {
		status = event.EventStatusDraft
	}

	// Create event
	e := &event.Event{
		EventName:   req.EventName,
		Description: req.Description,
		BannerImage: req.BannerImage,
		Status:      status,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
	}

	if err := s.repo.Create(e); err != nil {
		return nil, err
	}

	// Reload to get generated fields
	createdEvent, err := s.repo.FindByID(e.ID)
	if err != nil {
		return nil, err
	}

	return createdEvent.ToEventResponse(), nil
}

// Update updates an event
func (s *Service) Update(id string, req *event.UpdateEventRequest) (*event.EventResponse, error) {
	// Find event
	e, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || (err != nil && err.Error() == "event not found") {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	// Update fields
	if req.EventName != nil {
		// Check if new name conflicts with existing event
		existingEvent, err := s.repo.FindByName(*req.EventName)
		if err == nil && existingEvent != nil && existingEvent.ID != id {
			return nil, ErrEventAlreadyExists
		}
		// If error is "not found", that's fine - we can use this name
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			// Check if it's a "not found" error from repository (string comparison)
			errStr := err.Error()
			if errStr != "event not found" {
				return nil, err
			}
		}
		e.EventName = *req.EventName
	}

	if req.Description != nil {
		e.Description = *req.Description
	}

	if req.BannerImage != nil {
		e.BannerImage = *req.BannerImage
	}

	if req.Status != nil {
		e.Status = *req.Status
	}

	if req.StartDate != nil {
		e.StartDate = *req.StartDate
	}

	if req.EndDate != nil {
		e.EndDate = *req.EndDate
	}

	// Validate date range
	if e.EndDate.Before(e.StartDate) {
		return nil, ErrInvalidDateRange
	}

	if err := s.repo.Update(e); err != nil {
		return nil, err
	}

	// Reload
	updatedEvent, err := s.repo.FindByID(e.ID)
	if err != nil {
		return nil, err
	}

	return updatedEvent.ToEventResponse(), nil
}

// Delete deletes an event
func (s *Service) Delete(id string) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || (err != nil && err.Error() == "event not found") {
			return ErrEventNotFound
		}
		return err
	}

	return s.repo.Delete(id)
}

// List lists all events with pagination and filters
func (s *Service) List(req *event.ListEventRequest) ([]*event.EventResponse, int64, *response.PaginationMeta, error) {
	// Set defaults
	page := req.Page
	if page < 1 {
		page = 1
	}

	perPage := req.PerPage
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	// Build filters
	filters := make(map[string]interface{})
	if req.Search != "" {
		filters["search"] = req.Search
	}

	if req.Status != "" {
		filters["status"] = string(req.Status)
	}

	// Apply sorting
	if req.SortBy != "" {
		filters["sort_by"] = req.SortBy
	} else {
		filters["sort_by"] = "created_at"
	}

	if req.SortOrder != "" {
		filters["sort_order"] = req.SortOrder
	} else {
		filters["sort_order"] = "desc"
	}

	// Get events
	events, total, err := s.repo.List(page, perPage, filters)
	if err != nil {
		return nil, 0, nil, err
	}

	// Convert to response
	responses := make([]*event.EventResponse, len(events))
	for i, e := range events {
		responses[i] = e.ToEventResponse()
	}

	// Create pagination meta
	paginationMeta := response.NewPaginationMeta(page, perPage, int(total))

	return responses, total, paginationMeta, nil
}

// UpdateStatus updates event status
func (s *Service) UpdateStatus(id string, status event.EventStatus) (*event.EventResponse, error) {
	// Find event
	e, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || (err != nil && err.Error() == "event not found") {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	// Validate status
	if status != event.EventStatusDraft && status != event.EventStatusPublished && status != event.EventStatusClosed {
		return nil, ErrInvalidStatus
	}

	// Update status
	e.Status = status

	if err := s.repo.Update(e); err != nil {
		return nil, err
	}

	// Reload
	updatedEvent, err := s.repo.FindByID(e.ID)
	if err != nil {
		return nil, err
	}

	return updatedEvent.ToEventResponse(), nil
}

// UpdateBannerImage updates event banner image
func (s *Service) UpdateBannerImage(id string, bannerImageURL string) (*event.EventResponse, error) {
	// Find event
	e, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || (err != nil && err.Error() == "event not found") {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	// Update banner image
	e.BannerImage = bannerImageURL

	if err := s.repo.Update(e); err != nil {
		return nil, err
	}

	// Reload
	updatedEvent, err := s.repo.FindByID(e.ID)
	if err != nil {
		return nil, err
	}

	return updatedEvent.ToEventResponse(), nil
}

