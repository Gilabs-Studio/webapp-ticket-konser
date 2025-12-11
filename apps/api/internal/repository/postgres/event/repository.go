package event

import (
	"errors"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	eventrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/event"
	"gorm.io/gorm"
)

var (
	ErrEventNotFound = errors.New("event not found")
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new event repository
func NewRepository(db *gorm.DB) eventrepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds an event by ID
func (r *Repository) FindByID(id string) (*event.Event, error) {
	var e event.Event
	if err := r.db.Where("id = ?", id).First(&e).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}
	return &e, nil
}

// FindByName finds an event by name
func (r *Repository) FindByName(name string) (*event.Event, error) {
	var e event.Event
	if err := r.db.Where("event_name = ?", name).First(&e).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}
	return &e, nil
}

// Create creates a new event
func (r *Repository) Create(e *event.Event) error {
	return r.db.Create(e).Error
}

// Update updates an event
func (r *Repository) Update(e *event.Event) error {
	return r.db.Save(e).Error
}

// Delete soft deletes an event
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&event.Event{}).Error
}

// List lists all events with pagination and filters
func (r *Repository) List(page, perPage int, filters map[string]interface{}) ([]*event.Event, int64, error) {
	var events []*event.Event
	var total int64

	query := r.db.Model(&event.Event{})

	// Apply filters
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("event_name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}

	if startDate, ok := filters["start_date"].(time.Time); ok {
		query = query.Where("start_date >= ?", startDate)
	}

	if endDate, ok := filters["end_date"].(time.Time); ok {
		query = query.Where("end_date <= ?", endDate)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * perPage
	query = query.Offset(offset).Limit(perPage)

	// Apply sorting
	sortBy := "created_at"
	if sortByField, ok := filters["sort_by"].(string); ok && sortByField != "" {
		sortBy = sortByField
	}

	sortOrder := "desc"
	if sortOrderField, ok := filters["sort_order"].(string); ok && sortOrderField != "" {
		sortOrder = sortOrderField
	}

	query = query.Order(sortBy + " " + sortOrder)

	// Execute query
	if err := query.Find(&events).Error; err != nil {
		return nil, 0, err
	}

	return events, total, nil
}

// Count counts events with filters
func (r *Repository) Count(filters map[string]interface{}) (int64, error) {
	var total int64

	query := r.db.Model(&event.Event{})

	// Apply filters
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("event_name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}

	if startDate, ok := filters["start_date"].(time.Time); ok {
		query = query.Where("start_date >= ?", startDate)
	}

	if endDate, ok := filters["end_date"].(time.Time); ok {
		query = query.Where("end_date <= ?", endDate)
	}

	if err := query.Count(&total).Error; err != nil {
		return 0, err
	}

	return total, nil
}

