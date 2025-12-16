package ticket

import (
	"errors"
	"fmt"

	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket"
	ticketcategory "github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
	ticketrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/ticket"
	"gorm.io/gorm"
)

var (
	ErrTicketNotFound = errors.New("ticket not found")
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new ticket repository
func NewRepository(db *gorm.DB) ticketrepo.Repository {
	return &Repository{
		db: db,
	}
}

// List lists all tickets with sales information
func (r *Repository) List(page, perPage int, filters map[string]interface{}) ([]*ticket.Ticket, int64, error) {
	// Build query for ticket categories
	query := r.db.Model(&ticketcategory.TicketCategory{}).
		Where("deleted_at IS NULL")

	// Apply filters
	if eventID, ok := filters["event_id"].(string); ok && eventID != "" {
		query = query.Where("event_id = ?", eventID)
	}

	// Count total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get ticket categories with pagination and preload event
	var categories []ticketcategory.TicketCategory
	offset := (page - 1) * perPage
	if err := query.
		Preload("Event").
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&categories).Error; err != nil {
		return nil, 0, err
	}

	// Convert to tickets with sold count
	tickets := make([]*ticket.Ticket, 0, len(categories))
	for _, cat := range categories {
		// Get sold count from order items
		soldCount, err := r.GetSoldCount(cat.ID)
		if err != nil {
			return nil, 0, err
		}

		// Determine status
		status := "active"
		if soldCount >= cat.Quota {
			status = "sold_out"
		} else if float64(soldCount)/float64(cat.Quota) >= 0.8 {
			status = "low_stock"
		}

		// Apply status filter if provided
		if statusFilter, ok := filters["status"].(string); ok && statusFilter != "" {
			if status != statusFilter {
				continue
			}
		}

		// Format price
		priceFormatted := fmt.Sprintf("Rp %.0f", cat.Price)

		t := &ticket.Ticket{
			ID:            cat.ID,
			Name:          cat.CategoryName,
			Description:   "",
			Price:         cat.Price,
			PriceFormatted: priceFormatted,
			TotalQuota:    cat.Quota,
			Sold:          soldCount,
			Status:        status,
			CategoryID:    cat.ID,
			CreatedAt:     cat.CreatedAt,
			UpdatedAt:     cat.UpdatedAt,
		}

		// Load category details if needed
		if cat.EventID != "" {
			catResp := cat.ToTicketCategoryResponse()
			t.Category = catResp
		}

		tickets = append(tickets, t)
	}

	return tickets, total, nil
}

// GetByID gets a ticket by ID
func (r *Repository) GetByID(id string) (*ticket.Ticket, error) {
	var cat ticketcategory.TicketCategory
	if err := r.db.Preload("Event").Where("id = ?", id).First(&cat).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTicketNotFound
		}
		return nil, err
	}

	// Get sold count
	soldCount, err := r.GetSoldCount(cat.ID)
	if err != nil {
		return nil, err
	}

	// Determine status
	status := "active"
	if soldCount >= cat.Quota {
		status = "sold_out"
	} else if float64(soldCount)/float64(cat.Quota) >= 0.8 {
		status = "low_stock"
	}

	// Format price
	priceFormatted := fmt.Sprintf("Rp %.0f", cat.Price)

	t := &ticket.Ticket{
		ID:            cat.ID,
		Name:          cat.CategoryName,
		Description:   "",
		Price:         cat.Price,
		PriceFormatted: priceFormatted,
		TotalQuota:    cat.Quota,
		Sold:          soldCount,
		Status:        status,
		CategoryID:    cat.ID,
		CreatedAt:     cat.CreatedAt,
		UpdatedAt:     cat.UpdatedAt,
	}

	// Load category details
	catResp := cat.ToTicketCategoryResponse()
	t.Category = catResp

	return t, nil
}

// GetSoldCount gets the sold count for a ticket category
func (r *Repository) GetSoldCount(categoryID string) (int, error) {
	var count int64
	if err := r.db.Model(&orderitem.OrderItem{}).
		Where("category_id = ?", categoryID).
		Where("status IN ?", []orderitem.TicketStatus{
			orderitem.TicketStatusPaid,
			orderitem.TicketStatusCheckedIn,
		}).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
