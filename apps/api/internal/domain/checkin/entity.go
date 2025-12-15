package checkin

import (
	"time"

	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CheckInStatus represents check-in status enum
type CheckInStatus string

const (
	CheckInStatusSuccess CheckInStatus = "SUCCESS"
	CheckInStatusFailed  CheckInStatus = "FAILED"
	CheckInStatusDuplicate CheckInStatus = "DUPLICATE"
)

// CheckIn represents a check-in entity
type CheckIn struct {
	ID           string            `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderItemID  string            `gorm:"type:uuid;not null;index" json:"order_item_id"`
	OrderItem    *orderitem.OrderItem `gorm:"foreignKey:OrderItemID" json:"order_item,omitempty"`
	QRCode       string            `gorm:"type:varchar(255);not null;index" json:"qr_code"`
	GateID       *string           `gorm:"type:uuid;index" json:"gate_id,omitempty"`
	StaffID      string            `gorm:"type:uuid;not null;index" json:"staff_id"`
	Staff        *user.User        `gorm:"foreignKey:StaffID" json:"staff,omitempty"`
	Status       CheckInStatus     `gorm:"type:varchar(20);not null;default:'SUCCESS'" json:"status"`
	Location     string            `gorm:"type:varchar(255)" json:"location"`
	IPAddress    string            `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent    string            `gorm:"type:text" json:"user_agent"`
	CheckedInAt  time.Time         `gorm:"type:timestamp;not null" json:"checked_in_at"`
	CreatedAt    time.Time         `json:"created_at"`
	UpdatedAt    time.Time         `json:"updated_at"`
	DeletedAt    gorm.DeletedAt    `gorm:"index" json:"-"`
}

// TableName specifies the table name for CheckIn
func (CheckIn) TableName() string {
	return "check_ins"
}

// BeforeCreate hook to generate UUID
func (c *CheckIn) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	if c.CheckedInAt.IsZero() {
		c.CheckedInAt = time.Now()
	}
	return nil
}

// CheckInResponse represents check-in response DTO
type CheckInResponse struct {
	ID           string                      `json:"id"`
	OrderItemID  string                      `json:"order_item_id"`
	OrderItem    *orderitem.OrderItemResponse `json:"order_item,omitempty"`
	QRCode       string                      `json:"qr_code"`
	GateID       *string                     `json:"gate_id,omitempty"`
	StaffID      string                      `json:"staff_id"`
	Staff        *user.UserResponse          `json:"staff,omitempty"`
	Status       CheckInStatus               `json:"status"`
	Location     string                      `json:"location"`
	IPAddress    string                      `json:"ip_address"`
	UserAgent    string                      `json:"user_agent"`
	CheckedInAt  time.Time                   `json:"checked_in_at"`
	CreatedAt    time.Time                   `json:"created_at"`
	UpdatedAt    time.Time                   `json:"updated_at"`
}

// ToCheckInResponse converts CheckIn to CheckInResponse
func (c *CheckIn) ToCheckInResponse() *CheckInResponse {
	resp := &CheckInResponse{
		ID:          c.ID,
		OrderItemID: c.OrderItemID,
		QRCode:      c.QRCode,
		GateID:      c.GateID,
		StaffID:     c.StaffID,
		Status:      c.Status,
		Location:    c.Location,
		IPAddress:   c.IPAddress,
		UserAgent:   c.UserAgent,
		CheckedInAt: c.CheckedInAt,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
	if c.OrderItem != nil {
		resp.OrderItem = c.OrderItem.ToOrderItemResponse()
	}
	if c.Staff != nil {
		resp.Staff = c.Staff.ToUserResponse()
	}
	return resp
}

// ValidateQRCodeRequest represents QR code validation request
type ValidateQRCodeRequest struct {
	QRCode string `json:"qr_code" binding:"required"`
}

// ValidateQRCodeResponse represents QR code validation response
type ValidateQRCodeResponse struct {
	Valid       bool   `json:"valid"`
	OrderItemID string `json:"order_item_id,omitempty"`
	Status      string `json:"status,omitempty"`
	Message     string `json:"message,omitempty"`
	AlreadyUsed bool   `json:"already_used,omitempty"`
}

// CheckInRequest represents check-in request
type CheckInRequest struct {
	QRCode   string  `json:"qr_code" binding:"required"`
	GateID   *string `json:"gate_id,omitempty"`
	Location string  `json:"location,omitempty"`
}

// CheckInResponse represents check-in result response
type CheckInResultResponse struct {
	Success   bool              `json:"success"`
	CheckIn   *CheckInResponse  `json:"check_in,omitempty"`
	Message   string            `json:"message"`
	ErrorCode string            `json:"error_code,omitempty"`
}

// ListCheckInsRequest represents list check-ins query parameters
type ListCheckInsRequest struct {
	Page          int        `form:"page" binding:"omitempty,min=1"`
	PerPage       int        `form:"per_page" binding:"omitempty,min=1,max=100"`
	OrderItemID   string     `form:"order_item_id" binding:"omitempty,uuid"`
	GateID        string     `form:"gate_id" binding:"omitempty,uuid"`
	StaffID       string     `form:"staff_id" binding:"omitempty,uuid"`
	Status        CheckInStatus `form:"status" binding:"omitempty,oneof=SUCCESS FAILED DUPLICATE"`
	StartDate     *time.Time `form:"start_date" binding:"omitempty"`
	EndDate       *time.Time `form:"end_date" binding:"omitempty"`
}

