package merchandise

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/merchandise"
	merchandiserepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/merchandise"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new merchandise repository
func NewRepository(db *gorm.DB) merchandiserepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds a merchandise by ID
func (r *Repository) FindByID(id string) (*merchandise.Merchandise, error) {
	var m merchandise.Merchandise
	if err := r.db.Where("id = ?", id).Preload("Event").First(&m).Error; err != nil {
		// Return gorm.ErrRecordNotFound directly, let service layer handle conversion
		return nil, err
	}
	return &m, nil
}

// Create creates a new merchandise
func (r *Repository) Create(m *merchandise.Merchandise) error {
	return r.db.Create(m).Error
}

// Update updates a merchandise
func (r *Repository) Update(m *merchandise.Merchandise) error {
	return r.db.Save(m).Error
}

// Delete soft deletes a merchandise
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&merchandise.Merchandise{}).Error
}

// List lists all merchandises with pagination and filters
func (r *Repository) List(page, perPage int, filters map[string]interface{}) ([]*merchandise.Merchandise, int64, error) {
	query := r.db.Model(&merchandise.Merchandise{}).
		Where("deleted_at IS NULL")

	// Apply filters
	if eventID, ok := filters["event_id"].(string); ok && eventID != "" {
		query = query.Where("event_id = ?", eventID)
	}
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Count total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get merchandises with pagination
	var merchandises []*merchandise.Merchandise
	offset := (page - 1) * perPage
	if err := query.
		Preload("Event").
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&merchandises).Error; err != nil {
		return nil, 0, err
	}

	return merchandises, total, nil
}

// CreateStockLog creates a new stock log
func (r *Repository) CreateStockLog(log *merchandise.StockLog) error {
	return r.db.Create(log).Error
}

// GetStockLogs gets stock logs for a merchandise
func (r *Repository) GetStockLogs(merchandiseID string) ([]*merchandise.StockLog, error) {
	var logs []*merchandise.StockLog
	err := r.db.Where("merchandise_id = ?", merchandiseID).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}
