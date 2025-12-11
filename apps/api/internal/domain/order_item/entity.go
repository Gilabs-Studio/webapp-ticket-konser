package orderitem

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TicketStatus represents ticket status enum
type TicketStatus string

const (
	TicketStatusUnpaid    TicketStatus = "UNPAID"
	TicketStatusPaid      TicketStatus = "PAID"
	TicketStatusCheckedIn TicketStatus = "CHECKED-IN"
	TicketStatusCanceled  TicketStatus = "CANCELED"
	TicketStatusRefunded  TicketStatus = "REFUNDED"
)

// OrderItem represents an order item entity
type OrderItem struct {
	ID           string                `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID      string                `gorm:"type:uuid;not null;index" json:"order_id"`
	Order        *order.Order          `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	CategoryID   string                `gorm:"type:uuid;not null;index" json:"category_id"`
	Category     *ticketcategory.TicketCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	QRCode       string                `gorm:"type:varchar(255);uniqueIndex;not null" json:"qr_code"`
	Status       TicketStatus          `gorm:"type:varchar(20);not null;default:'UNPAID'" json:"status"`
	CheckInTime  *time.Time            `gorm:"type:timestamp" json:"check_in_time"`
	CreatedAt    time.Time             `json:"created_at"`
	UpdatedAt    time.Time             `json:"updated_at"`
	DeletedAt    gorm.DeletedAt       `gorm:"index" json:"-"`
}

// TableName specifies the table name for OrderItem
func (OrderItem) TableName() string {
	return "order_items"
}

// BeforeCreate hook to generate UUID and QR code
func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == "" {
		oi.ID = uuid.New().String()
	}
	if oi.QRCode == "" {
		oi.QRCode = generateQRCode()
	}
	return nil
}

// generateQRCode generates a unique QR code
func generateQRCode() string {
	return "QR-" + uuid.New().String()
}

// OrderItemResponse represents order item response DTO
type OrderItemResponse struct {
	ID           string                          `json:"id"`
	OrderID      string                          `json:"order_id"`
	Order        *order.OrderResponse            `json:"order,omitempty"`
	CategoryID   string                          `json:"category_id"`
	Category     *ticketcategory.TicketCategoryResponse `json:"category,omitempty"`
	QRCode       string                          `json:"qr_code"`
	Status       TicketStatus                    `json:"status"`
	CheckInTime  *time.Time                      `json:"check_in_time"`
	CreatedAt    time.Time                       `json:"created_at"`
	UpdatedAt    time.Time                       `json:"updated_at"`
}

// ToOrderItemResponse converts OrderItem to OrderItemResponse
func (oi *OrderItem) ToOrderItemResponse() *OrderItemResponse {
	resp := &OrderItemResponse{
		ID:          oi.ID,
		OrderID:     oi.OrderID,
		CategoryID:  oi.CategoryID,
		QRCode:      oi.QRCode,
		Status:      oi.Status,
		CheckInTime: oi.CheckInTime,
		CreatedAt:   oi.CreatedAt,
		UpdatedAt:   oi.UpdatedAt,
	}
	if oi.Order != nil {
		resp.Order = oi.Order.ToOrderResponse()
	}
	if oi.Category != nil {
		resp.Category = oi.Category.ToTicketCategoryResponse()
	}
	return resp
}

// CreateOrderItemRequest represents create order item request DTO
type CreateOrderItemRequest struct {
	OrderID    string `json:"order_id" binding:"required,uuid"`
	CategoryID string `json:"category_id" binding:"required,uuid"`
	QRCode     string `json:"qr_code" binding:"omitempty"`
}

// UpdateOrderItemRequest represents update order item request DTO
type UpdateOrderItemRequest struct {
	Status      *TicketStatus `json:"status" binding:"omitempty,oneof=UNPAID PAID CHECKED-IN CANCELED REFUNDED"`
	CheckInTime *time.Time    `json:"check_in_time" binding:"omitempty"`
}


