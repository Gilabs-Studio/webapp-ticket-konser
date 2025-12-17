package orderitem

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
)

// Repository defines the interface for order item repository operations
type Repository interface {
	// FindByID finds an order item by ID
	FindByID(id string) (*orderitem.OrderItem, error)
	
	// FindByQRCode finds an order item by QR code
	FindByQRCode(qrCode string) (*orderitem.OrderItem, error)
	
	// FindByOrderID finds order items by order ID
	FindByOrderID(orderID string) ([]*orderitem.OrderItem, error)
	
	// Create creates a new order item
	Create(oi *orderitem.OrderItem) error
	
	// Update updates an order item
	Update(oi *orderitem.OrderItem) error
	
	// Delete soft deletes an order item
	Delete(id string) error
}



