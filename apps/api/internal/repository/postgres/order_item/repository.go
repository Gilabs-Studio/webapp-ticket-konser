package orderitem

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	orderitemrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order_item"
	"gorm.io/gorm"
)

var (
	ErrOrderItemNotFound = errors.New("order item not found")
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new order item repository
func NewRepository(db *gorm.DB) orderitemrepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds an order item by ID
func (r *Repository) FindByID(id string) (*orderitem.OrderItem, error) {
	var oi orderitem.OrderItem
	if err := r.db.Where("id = ?", id).Preload("Order").Preload("Category").First(&oi).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderItemNotFound
		}
		return nil, err
	}
	return &oi, nil
}

// FindByQRCode finds an order item by QR code
func (r *Repository) FindByQRCode(qrCode string) (*orderitem.OrderItem, error) {
	var oi orderitem.OrderItem
	if err := r.db.Where("qr_code = ?", qrCode).Preload("Order.Schedule.Event").Preload("Order.User").Preload("Category").First(&oi).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderItemNotFound
		}
		return nil, err
	}
	return &oi, nil
}

// FindByOrderID finds order items by order ID
func (r *Repository) FindByOrderID(orderID string) ([]*orderitem.OrderItem, error) {
	var items []*orderitem.OrderItem
	if err := r.db.Where("order_id = ?", orderID).Preload("Order").Preload("Category").Order("created_at ASC").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

// Create creates a new order item
func (r *Repository) Create(oi *orderitem.OrderItem) error {
	return r.db.Create(oi).Error
}

// Update updates an order item
func (r *Repository) Update(oi *orderitem.OrderItem) error {
	return r.db.Save(oi).Error
}

// Delete soft deletes an order item
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&orderitem.OrderItem{}).Error
}



