package merchandise

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// StockLogType represents the type of stock change
type StockLogType string

const (
	StockLogTypeRestock    StockLogType = "restock"
	StockLogTypeSold       StockLogType = "sold"
	StockLogTypeAdjustment StockLogType = "adjustment"
	StockLogTypeReturn     StockLogType = "return"
)

// StockLog represents a log of stock changes for a merchandise
type StockLog struct {
	ID            string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	MerchandiseID string         `gorm:"type:uuid;not null;index" json:"merchandise_id"`
	PreviousStock int            `gorm:"not null" json:"previous_stock"`
	NewStock      int            `gorm:"not null" json:"new_stock"`
	ChangeAmount  int            `gorm:"not null" json:"change_amount"`
	Type          StockLogType   `gorm:"type:varchar(50);not null" json:"type"`
	Notes         string         `gorm:"type:text" json:"notes"`
	PerformedBy   string         `gorm:"type:varchar(100)" json:"performed_by,omitempty"` // User ID or "System"
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for StockLog
func (StockLog) TableName() string {
	return "stock_logs"
}

// BeforeCreate hook to generate UUID
func (sl *StockLog) BeforeCreate(tx *gorm.DB) error {
	if sl.ID == "" {
		sl.ID = uuid.New().String()
	}
	return nil
}

// StockLogResponse represents stock log response DTO
type StockLogResponse struct {
	ID            string       `json:"id"`
	MerchandiseID string       `json:"merchandise_id"`
	PreviousStock int          `json:"previous_stock"`
	NewStock      int          `json:"new_stock"`
	ChangeAmount  int          `json:"change_amount"`
	Type          StockLogType `json:"type"`
	Notes         string       `json:"notes"`
	PerformedBy   string       `json:"performed_by"`
	CreatedAt     time.Time    `json:"created_at"`
}

// ToStockLogResponse converts StockLog to StockLogResponse
func (sl *StockLog) ToStockLogResponse() *StockLogResponse {
	return &StockLogResponse{
		ID:            sl.ID,
		MerchandiseID: sl.MerchandiseID,
		PreviousStock: sl.PreviousStock,
		NewStock:      sl.NewStock,
		ChangeAmount:  sl.ChangeAmount,
		Type:          sl.Type,
		Notes:         sl.Notes,
		PerformedBy:   sl.PerformedBy,
		CreatedAt:     sl.CreatedAt,
	}
}
