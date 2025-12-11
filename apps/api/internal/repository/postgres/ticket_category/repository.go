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

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new ticket category repository
func NewRepository(db *gorm.DB) ticketcategoryrepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds a ticket category by ID
func (r *Repository) FindByID(id string) (*ticketcategory.TicketCategory, error) {
	var tc ticketcategory.TicketCategory
	if err := r.db.Where("id = ?", id).Preload("Event").First(&tc).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTicketCategoryNotFound
		}
		return nil, err
	}
	return &tc, nil
}

// FindByEventID finds ticket categories by event ID
func (r *Repository) FindByEventID(eventID string) ([]*ticketcategory.TicketCategory, error) {
	var categories []*ticketcategory.TicketCategory
	if err := r.db.Where("event_id = ?", eventID).Preload("Event").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

// Create creates a new ticket category
func (r *Repository) Create(tc *ticketcategory.TicketCategory) error {
	return r.db.Create(tc).Error
}

// Update updates a ticket category
func (r *Repository) Update(tc *ticketcategory.TicketCategory) error {
	return r.db.Save(tc).Error
}

// Delete soft deletes a ticket category
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&ticketcategory.TicketCategory{}).Error
}

// List lists all ticket categories
func (r *Repository) List() ([]*ticketcategory.TicketCategory, error) {
	var categories []*ticketcategory.TicketCategory
	if err := r.db.Preload("Event").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}


