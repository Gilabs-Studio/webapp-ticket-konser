package order

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/schedule"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PaymentStatus represents payment status enum
type PaymentStatus string

const (
	PaymentStatusUnpaid   PaymentStatus = "UNPAID"
	PaymentStatusPaid     PaymentStatus = "PAID"
	PaymentStatusFailed   PaymentStatus = "FAILED"
	PaymentStatusCanceled PaymentStatus = "CANCELED"
	PaymentStatusRefunded PaymentStatus = "REFUNDED"
)

// Order represents an order entity
type Order struct {
	ID                   string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID               string         `gorm:"type:uuid;not null;index" json:"user_id"`
	User                 *user.User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	OrderCode            string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"order_code"`
	ScheduleID           string         `gorm:"type:uuid;not null;index" json:"schedule_id"`
	Schedule             *schedule.Schedule `gorm:"foreignKey:ScheduleID" json:"schedule,omitempty"`
	TotalAmount          float64        `gorm:"type:decimal(15,2);not null" json:"total_amount"`
	PaymentStatus        PaymentStatus  `gorm:"type:varchar(20);not null;default:'UNPAID'" json:"payment_status"`
	PaymentMethod        string         `gorm:"type:varchar(50)" json:"payment_method"`
	MidtransTransactionID string        `gorm:"type:varchar(255)" json:"midtrans_transaction_id"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Order
func (Order) TableName() string {
	return "orders"
}

// BeforeCreate hook to generate UUID and order code
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == "" {
		o.ID = uuid.New().String()
	}
	if o.OrderCode == "" {
		o.OrderCode = generateOrderCode()
	}
	return nil
}

// generateOrderCode generates a unique order code
func generateOrderCode() string {
	return "ORD-" + time.Now().Format("20060102") + "-" + uuid.New().String()[:8]
}

// OrderResponse represents order response DTO
type OrderResponse struct {
	ID                   string                  `json:"id"`
	UserID               string                  `json:"user_id"`
	User                 *user.UserResponse      `json:"user,omitempty"`
	OrderCode            string                  `json:"order_code"`
	ScheduleID           string                  `json:"schedule_id"`
	Schedule             *schedule.ScheduleResponse `json:"schedule,omitempty"`
	TotalAmount          float64                 `json:"total_amount"`
	PaymentStatus        PaymentStatus           `json:"payment_status"`
	PaymentMethod        string                  `json:"payment_method"`
	MidtransTransactionID string                 `json:"midtrans_transaction_id"`
	CreatedAt            time.Time               `json:"created_at"`
	UpdatedAt            time.Time               `json:"updated_at"`
}

// ToOrderResponse converts Order to OrderResponse
func (o *Order) ToOrderResponse() *OrderResponse {
	resp := &OrderResponse{
		ID:                   o.ID,
		UserID:               o.UserID,
		OrderCode:            o.OrderCode,
		ScheduleID:           o.ScheduleID,
		TotalAmount:          o.TotalAmount,
		PaymentStatus:        o.PaymentStatus,
		PaymentMethod:        o.PaymentMethod,
		MidtransTransactionID: o.MidtransTransactionID,
		CreatedAt:            o.CreatedAt,
		UpdatedAt:            o.UpdatedAt,
	}
	if o.User != nil {
		resp.User = o.User.ToUserResponse()
	}
	if o.Schedule != nil {
		resp.Schedule = o.Schedule.ToScheduleResponse()
	}
	return resp
}

// CreateOrderRequest represents create order request DTO
type CreateOrderRequest struct {
	ScheduleID  string  `json:"schedule_id" binding:"required,uuid"`
	TotalAmount float64 `json:"total_amount" binding:"required,min=0"`
}

// UpdateOrderRequest represents update order request DTO
type UpdateOrderRequest struct {
	PaymentStatus        *PaymentStatus `json:"payment_status" binding:"omitempty,oneof=UNPAID PAID FAILED CANCELED REFUNDED"`
	PaymentMethod        *string        `json:"payment_method" binding:"omitempty"`
	MidtransTransactionID *string       `json:"midtrans_transaction_id" binding:"omitempty"`
}

// ListOrdersRequest represents list orders query parameters
type ListOrdersRequest struct {
	Page           int           `form:"page" binding:"omitempty,min=1"`
	PerPage        int           `form:"per_page" binding:"omitempty,min=1,max=100"`
	PaymentStatus  PaymentStatus `form:"payment_status" binding:"omitempty,oneof=UNPAID PAID FAILED CANCELED REFUNDED"`
	UserID         string        `form:"user_id" binding:"omitempty,uuid"`
	ScheduleID     string        `form:"schedule_id" binding:"omitempty,uuid"`
	StartDate      *time.Time    `form:"start_date" binding:"omitempty"`
	EndDate        *time.Time    `form:"end_date" binding:"omitempty"`
}


