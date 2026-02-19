package order

import (
	// "time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
)

// Repository defines the interface for order repository operations
type Repository interface {
	// FindByID finds an order by ID
	FindByID(id string) (*order.Order, error)

	// FindByOrderCode finds an order by order code
	FindByOrderCode(orderCode string) (*order.Order, error)

	// FindByUserID finds orders by user ID
	FindByUserID(userID string) ([]*order.Order, error)

	// FindByScheduleID finds orders by schedule ID
	FindByScheduleID(scheduleID string) ([]*order.Order, error)

	// Create creates a new order
	Create(o *order.Order) error

	// Update updates an order
	Update(o *order.Order) error

	// Delete soft deletes an order
	Delete(id string) error

	// List lists orders with filters
	List(page, perPage int, filters map[string]interface{}) ([]*order.Order, int64, error)

	// FindExpiredUnpaidOrders finds expired unpaid orders
	FindExpiredUnpaidOrders() ([]*order.Order, error)

	// FindByIdempotencyKey finds an order by idempotency key (for deduplication)
	FindByIdempotencyKey(key string) (*order.Order, error)

	// FindUnrestoredCanceledOrders finds canceled/failed orders where quota has not been restored
	FindUnrestoredCanceledOrders() ([]*order.Order, error)
}
