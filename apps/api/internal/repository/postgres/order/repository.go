package order

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
	orderrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order"
	"gorm.io/gorm"
)

var (
	ErrOrderNotFound = errors.New("order not found")
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new order repository
func NewRepository(db *gorm.DB) orderrepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds an order by ID
func (r *Repository) FindByID(id string) (*order.Order, error) {
	var o order.Order
	if err := r.db.Where("id = ?", id).Preload("User").Preload("Schedule.Event").First(&o).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	return &o, nil
}

// FindByOrderCode finds an order by order code
func (r *Repository) FindByOrderCode(orderCode string) (*order.Order, error) {
	var o order.Order
	if err := r.db.Where("order_code = ?", orderCode).Preload("User").Preload("Schedule.Event").First(&o).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	return &o, nil
}

// FindByUserID finds orders by user ID
func (r *Repository) FindByUserID(userID string) ([]*order.Order, error) {
	var orders []*order.Order
	if err := r.db.Where("user_id = ?", userID).Preload("User").Preload("Schedule.Event").Order("created_at DESC").Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

// FindByScheduleID finds orders by schedule ID
func (r *Repository) FindByScheduleID(scheduleID string) ([]*order.Order, error) {
	var orders []*order.Order
	if err := r.db.Where("schedule_id = ?", scheduleID).Preload("User").Preload("Schedule.Event").Order("created_at DESC").Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

// Create creates a new order
func (r *Repository) Create(o *order.Order) error {
	return r.db.Create(o).Error
}

// Update updates an order
func (r *Repository) Update(o *order.Order) error {
	return r.db.Save(o).Error
}

// Delete soft deletes an order
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&order.Order{}).Error
}

// List lists orders with filters
func (r *Repository) List(page, perPage int, filters map[string]interface{}) ([]*order.Order, int64, error) {
	var orders []*order.Order
	var total int64

	query := r.db.Model(&order.Order{})

	// Apply filters
	if paymentStatus, ok := filters["payment_status"]; ok && paymentStatus != nil {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if userID, ok := filters["user_id"]; ok && userID != nil {
		query = query.Where("user_id = ?", userID)
	}
	if scheduleID, ok := filters["schedule_id"]; ok && scheduleID != nil {
		query = query.Where("schedule_id = ?", scheduleID)
	}
	if startDate, ok := filters["start_date"]; ok && startDate != nil {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate, ok := filters["end_date"]; ok && endDate != nil {
		query = query.Where("created_at <= ?", endDate)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination and preloads
	offset := (page - 1) * perPage
	if err := query.Preload("User").Preload("Schedule.Event").
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}


