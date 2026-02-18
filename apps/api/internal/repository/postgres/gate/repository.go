package gate

import (
	"errors"
	"fmt"
	"strings"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/gate"
	gaterepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/gate"
	"gorm.io/gorm"
)

var (
	ErrGateNotFound = errors.New("gate not found")
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new gate repository
func NewRepository(db *gorm.DB) gaterepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds a gate by ID
func (r *Repository) FindByID(id string) (*gate.Gate, error) {
	var g gate.Gate
	if err := r.db.Where("id = ?", id).First(&g).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Join(gorm.ErrRecordNotFound, ErrGateNotFound)
		}
		return nil, err
	}
	return &g, nil
}

// FindByCode finds a gate by code
func (r *Repository) FindByCode(code string) (*gate.Gate, error) {
	var g gate.Gate
	if err := r.db.Where("code = ?", code).First(&g).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Join(gorm.ErrRecordNotFound, ErrGateNotFound)
		}
		return nil, err
	}
	return &g, nil
}

// Create creates a new gate
func (r *Repository) Create(g *gate.Gate) error {
	return r.db.Create(g).Error
}

// Update updates a gate
func (r *Repository) Update(g *gate.Gate) error {
	return r.db.Save(g).Error
}

// Delete soft deletes a gate
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&gate.Gate{}).Error
}

// List lists gates with filters and pagination
func (r *Repository) List(page, perPage int, filters map[string]interface{}) ([]*gate.Gate, int64, error) {
	var gates []*gate.Gate
	var total int64

	query := r.db.Model(&gate.Gate{})

	// Apply filters
	if status, ok := filters["status"]; ok && status != nil {
		query = query.Where("status = ?", status)
	}
	if isVIP, ok := filters["is_vip"]; ok && isVIP != nil {
		query = query.Where("is_vip = ?", isVIP)
	}
	if search, ok := filters["search"]; ok && search != nil {
		searchStr := fmt.Sprintf("%%%s%%", strings.TrimSpace(search.(string)))
		query = query.Where("name ILIKE ? OR code ILIKE ? OR location ILIKE ?", searchStr, searchStr, searchStr)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&gates).Error; err != nil {
		return nil, 0, err
	}

	return gates, total, nil
}

// CountByStatus counts gates by status
func (r *Repository) CountByStatus(status gate.GateStatus) (int64, error) {
	var count int64
	if err := r.db.Model(&gate.Gate{}).Where("status = ?", status).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// CountByVIP counts gates by VIP status
func (r *Repository) CountByVIP(isVIP bool) (int64, error) {
	var count int64
	if err := r.db.Model(&gate.Gate{}).Where("is_vip = ?", isVIP).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
