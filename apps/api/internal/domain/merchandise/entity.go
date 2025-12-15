package merchandise

import (
	"fmt"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Merchandise represents a merchandise entity
type Merchandise struct {
	ID          string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	EventID     string         `gorm:"type:uuid;not null;index" json:"event_id"`
	Event       *event.Event    `gorm:"foreignKey:EventID" json:"event,omitempty"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Price       float64        `gorm:"type:decimal(15,2);not null" json:"price"`
	Stock       int            `gorm:"not null;default:0" json:"stock"`
	Variant     string         `gorm:"type:varchar(255)" json:"variant"`
	ImageURL    string         `gorm:"type:varchar(500)" json:"image_url"`
	IconName    string         `gorm:"type:varchar(100)" json:"icon_name"`
	Status      string         `gorm:"type:varchar(50);default:'active'" json:"status"` // active, inactive
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Merchandise
func (Merchandise) TableName() string {
	return "merchandises"
}

// BeforeCreate hook to generate UUID
func (m *Merchandise) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}

// MerchandiseResponse represents merchandise response DTO
type MerchandiseResponse struct {
	ID            string              `json:"id"`
	EventID       string              `json:"event_id"`
	Event         *event.EventResponse `json:"event,omitempty"`
	Name          string              `json:"name"`
	Description   string              `json:"description"`
	Price         float64             `json:"price"`
	PriceFormatted string             `json:"price_formatted"`
	Stock         int                 `json:"stock"`
	StockStatus   string              `json:"stock_status"` // healthy, low, out
	StockPercentage float64           `json:"stock_percentage"`
	Variant       string              `json:"variant"`
	ImageURL      string              `json:"image_url"`
	IconName      string              `json:"icon_name"`
	Status        string              `json:"status"`
	CreatedAt     time.Time           `json:"created_at"`
	UpdatedAt     time.Time           `json:"updated_at"`
}

// ToMerchandiseResponse converts Merchandise to MerchandiseResponse
func (m *Merchandise) ToMerchandiseResponse() *MerchandiseResponse {
	// Calculate stock status and percentage
	stockStatus := "healthy"
	stockPercentage := 100.0
	if m.Stock <= 0 {
		stockStatus = "out"
		stockPercentage = 0.0
	} else if m.Stock < 20 {
		stockStatus = "low"
		stockPercentage = float64(m.Stock) / 20.0 * 100.0
	}

	// Format price
	priceFormatted := ""
	if m.Price > 0 {
		priceFormatted = "Rp " + formatNumber(m.Price)
	} else {
		priceFormatted = "Rp 0"
	}

	resp := &MerchandiseResponse{
		ID:            m.ID,
		EventID:       m.EventID,
		Name:          m.Name,
		Description:   m.Description,
		Price:         m.Price,
		PriceFormatted: priceFormatted,
		Stock:         m.Stock,
		StockStatus:   stockStatus,
		StockPercentage: stockPercentage,
		Variant:       m.Variant,
		ImageURL:      m.ImageURL,
		IconName:      m.IconName,
		Status:        m.Status,
		CreatedAt:     m.CreatedAt,
		UpdatedAt:     m.UpdatedAt,
	}
	if m.Event != nil {
		resp.Event = m.Event.ToEventResponse()
	}
	return resp
}

// formatNumber formats number with thousand separator
func formatNumber(n float64) string {
	// Simple implementation - format with thousand separator
	// Example: 50000 -> "50.000"
	formatted := fmt.Sprintf("%.0f", n)
	// Add thousand separator (simple implementation)
	if len(formatted) > 3 {
		result := ""
		for i, char := range formatted {
			if i > 0 && (len(formatted)-i)%3 == 0 {
				result += "."
			}
			result += string(char)
		}
		return result
	}
	return formatted
}

// CreateMerchandiseRequest represents create merchandise request DTO
type CreateMerchandiseRequest struct {
	EventID     string  `json:"event_id" binding:"required,uuid"`
	Name        string  `json:"name" binding:"required,min=1,max=255"`
	Description string  `json:"description" binding:"omitempty"`
	Price       float64 `json:"price" binding:"required,min=0"`
	Stock       int     `json:"stock" binding:"required,min=0"`
	Variant     string  `json:"variant" binding:"omitempty,max=255"`
	ImageURL    string  `json:"image_url" binding:"omitempty,max=500"`
	IconName    string  `json:"icon_name" binding:"omitempty,max=100"`
}

// UpdateMerchandiseRequest represents update merchandise request DTO
type UpdateMerchandiseRequest struct {
	Name        *string  `json:"name" binding:"omitempty,min=1,max=255"`
	Description *string  `json:"description" binding:"omitempty"`
	Price       *float64 `json:"price" binding:"omitempty,min=0"`
	Stock       *int     `json:"stock" binding:"omitempty,min=0"`
	Variant     *string  `json:"variant" binding:"omitempty,max=255"`
	ImageURL    *string  `json:"image_url" binding:"omitempty,max=500"`
	IconName    *string  `json:"icon_name" binding:"omitempty,max=100"`
	Status      *string  `json:"status" binding:"omitempty,oneof=active inactive"`
}

// ListMerchandiseRequest represents list merchandise query parameters
type ListMerchandiseRequest struct {
	Page    int    `form:"page" binding:"omitempty,min=1"`
	PerPage int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	EventID string `form:"event_id" binding:"omitempty,uuid"`
	Status  string `form:"status" binding:"omitempty,oneof=active inactive"`
	Search  string `form:"search" binding:"omitempty"`
}

// InventoryResponse represents merchandise inventory summary
type InventoryResponse struct {
	TotalProducts  int                        `json:"total_products"`
	TotalStock     int                        `json:"total_stock"`
	LowStockCount  int                        `json:"low_stock_count"`
	OutOfStockCount int                       `json:"out_of_stock_count"`
	Products       []*MerchandiseResponse     `json:"products"`
}
