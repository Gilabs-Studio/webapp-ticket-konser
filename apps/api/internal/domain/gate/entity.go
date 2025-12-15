package gate

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GateStatus represents gate status enum
type GateStatus string

const (
	GateStatusActive   GateStatus = "ACTIVE"
	GateStatusInactive GateStatus = "INACTIVE"
)

// Gate represents a gate entity
type Gate struct {
	ID          string     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code        string     `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"`
	Name        string     `gorm:"type:varchar(255);not null" json:"name"`
	Location    string     `gorm:"type:varchar(255)" json:"location"`
	Description string     `gorm:"type:text" json:"description"`
	IsVIP       bool       `gorm:"default:false" json:"is_vip"`
	Status      GateStatus `gorm:"type:varchar(20);not null;default:'ACTIVE'" json:"status"`
	Capacity    int        `gorm:"default:0" json:"capacity"` // Maximum capacity per gate (0 = unlimited)
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Gate
func (Gate) TableName() string {
	return "gates"
}

// BeforeCreate hook to generate UUID
func (g *Gate) BeforeCreate(tx *gorm.DB) error {
	if g.ID == "" {
		g.ID = uuid.New().String()
	}
	if g.Status == "" {
		g.Status = GateStatusActive
	}
	return nil
}

// GateResponse represents gate response DTO
type GateResponse struct {
	ID          string     `json:"id"`
	Code        string     `json:"code"`
	Name        string     `json:"name"`
	Location    string     `json:"location"`
	Description string     `json:"description"`
	IsVIP       bool       `json:"is_vip"`
	Status      GateStatus `json:"status"`
	Capacity    int        `json:"capacity"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// ToGateResponse converts Gate to GateResponse
func (g *Gate) ToGateResponse() *GateResponse {
	return &GateResponse{
		ID:          g.ID,
		Code:        g.Code,
		Name:        g.Name,
		Location:    g.Location,
		Description: g.Description,
		IsVIP:       g.IsVIP,
		Status:      g.Status,
		Capacity:    g.Capacity,
		CreatedAt:   g.CreatedAt,
		UpdatedAt:   g.UpdatedAt,
	}
}

// CreateGateRequest represents create gate request DTO
type CreateGateRequest struct {
	Code        string     `json:"code" binding:"required,min=1,max=50"`
	Name        string     `json:"name" binding:"required,min=1,max=255"`
	Location    string     `json:"location" binding:"omitempty,max=255"`
	Description string     `json:"description" binding:"omitempty"`
	IsVIP       bool       `json:"is_vip" binding:"omitempty"`
	Status      GateStatus `json:"status" binding:"omitempty,oneof=ACTIVE INACTIVE"`
	Capacity    int        `json:"capacity" binding:"omitempty,min=0"`
}

// UpdateGateRequest represents update gate request DTO
type UpdateGateRequest struct {
	Code        *string     `json:"code" binding:"omitempty,min=1,max=50"`
	Name        *string     `json:"name" binding:"omitempty,min=1,max=255"`
	Location    *string     `json:"location" binding:"omitempty,max=255"`
	Description *string     `json:"description" binding:"omitempty"`
	IsVIP       *bool       `json:"is_vip" binding:"omitempty"`
	Status      *GateStatus `json:"status" binding:"omitempty,oneof=ACTIVE INACTIVE"`
	Capacity    *int        `json:"capacity" binding:"omitempty,min=0"`
}

// ListGatesRequest represents list gates query parameters
type ListGatesRequest struct {
	Page     int        `form:"page" binding:"omitempty,min=1"`
	PerPage  int        `form:"per_page" binding:"omitempty,min=1,max=100"`
	Status   GateStatus `form:"status" binding:"omitempty,oneof=ACTIVE INACTIVE"`
	IsVIP    *bool      `form:"is_vip" binding:"omitempty"`
	Search   string     `form:"search" binding:"omitempty"`
}

// AssignTicketToGateRequest represents assign ticket to gate request DTO
type AssignTicketToGateRequest struct {
	OrderItemID string `json:"order_item_id" binding:"required,uuid"`
	GateID      string `json:"gate_id" binding:"required,uuid"`
}

// GateCheckInRequest represents gate check-in request DTO
type GateCheckInRequest struct {
	QRCode   string  `json:"qr_code" binding:"required"`
	GateID   string  `json:"gate_id" binding:"required,uuid"`
	Location string  `json:"location" binding:"omitempty"`
}

// GateStatisticsResponse represents gate statistics response
type GateStatisticsResponse struct {
	GateID         string `json:"gate_id"`
	GateCode       string `json:"gate_code"`
	GateName       string `json:"gate_name"`
	TotalCheckIns  int64  `json:"total_check_ins"`
	TodayCheckIns  int64  `json:"today_check_ins"`
	VIPCheckIns    int64  `json:"vip_check_ins"`
	RegularCheckIns int64 `json:"regular_check_ins"`
}
