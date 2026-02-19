package checkin

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/checkin"
	checkinrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/checkin"
	"gorm.io/gorm"
)

var (
	ErrCheckInNotFound = errors.New("check-in not found")
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new check-in repository
func NewRepository(db *gorm.DB) checkinrepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds a check-in by ID
func (r *Repository) FindByID(id string) (*checkin.CheckIn, error) {
	var c checkin.CheckIn
	if err := r.db.Where("id = ?", id).
		Preload("OrderItem.Order.User").
		Preload("OrderItem.Order.Schedule.Event").
		Preload("OrderItem.Category").
		Preload("Staff").
		First(&c).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Join(gorm.ErrRecordNotFound, ErrCheckInNotFound)
		}
		return nil, err
	}
	return &c, nil
}

// FindByQRCode finds check-ins by QR code
func (r *Repository) FindByQRCode(qrCode string) ([]*checkin.CheckIn, error) {
	var checkIns []*checkin.CheckIn
	if err := r.db.Where("qr_code = ?", qrCode).
		Preload("OrderItem.Order.User").
		Preload("OrderItem.Order.Schedule.Event").
		Preload("OrderItem.Category").
		Preload("Staff").
		Order("checked_in_at DESC").
		Find(&checkIns).Error; err != nil {
		return nil, err
	}
	return checkIns, nil
}

// FindByOrderItemID finds check-ins by order item ID
func (r *Repository) FindByOrderItemID(orderItemID string) ([]*checkin.CheckIn, error) {
	var checkIns []*checkin.CheckIn
	if err := r.db.Where("order_item_id = ?", orderItemID).
		Preload("OrderItem.Order.User").
		Preload("OrderItem.Order.Schedule.Event").
		Preload("OrderItem.Category").
		Preload("Staff").
		Order("checked_in_at DESC").
		Find(&checkIns).Error; err != nil {
		return nil, err
	}
	return checkIns, nil
}

// FindByGateID finds check-ins by gate ID
func (r *Repository) FindByGateID(gateID string) ([]*checkin.CheckIn, error) {
	var checkIns []*checkin.CheckIn
	if err := r.db.Where("gate_id = ?", gateID).
		Preload("OrderItem.Order.User").
		Preload("OrderItem.Order.Schedule.Event").
		Preload("OrderItem.Category").
		Preload("Staff").
		Order("checked_in_at DESC").
		Find(&checkIns).Error; err != nil {
		return nil, err
	}
	return checkIns, nil
}

// FindByStaffID finds check-ins by staff ID
func (r *Repository) FindByStaffID(staffID string) ([]*checkin.CheckIn, error) {
	var checkIns []*checkin.CheckIn
	if err := r.db.Where("staff_id = ?", staffID).
		Preload("OrderItem.Order.User").
		Preload("OrderItem.Order.Schedule.Event").
		Preload("OrderItem.Category").
		Preload("Staff").
		Order("checked_in_at DESC").
		Find(&checkIns).Error; err != nil {
		return nil, err
	}
	return checkIns, nil
}

// Create creates a new check-in
func (r *Repository) Create(c *checkin.CheckIn) error {
	return r.db.Create(c).Error
}

// Update updates a check-in
func (r *Repository) Update(c *checkin.CheckIn) error {
	return r.db.Save(c).Error
}

// Delete soft deletes a check-in
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&checkin.CheckIn{}).Error
}

// List lists check-ins with filters
func (r *Repository) List(page, perPage int, filters map[string]interface{}) ([]*checkin.CheckIn, int64, error) {
	var checkIns []*checkin.CheckIn
	var total int64

	query := r.db.Model(&checkin.CheckIn{})

	// Apply filters
	if orderItemID, ok := filters["order_item_id"]; ok && orderItemID != nil {
		query = query.Where("order_item_id = ?", orderItemID)
	}
	if gateID, ok := filters["gate_id"]; ok && gateID != nil {
		query = query.Where("gate_id = ?", gateID)
	}
	if staffID, ok := filters["staff_id"]; ok && staffID != nil {
		query = query.Where("staff_id = ?", staffID)
	}
	if status, ok := filters["status"]; ok && status != nil {
		query = query.Where("status = ?", status)
	}
	if startDate, ok := filters["start_date"]; ok && startDate != nil {
		query = query.Where("checked_in_at >= ?", startDate)
	}
	if endDate, ok := filters["end_date"]; ok && endDate != nil {
		query = query.Where("checked_in_at <= ?", endDate)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination and preloads
	offset := (page - 1) * perPage
	if err := query.
		Preload("OrderItem.Order.User").
		Preload("OrderItem.Order.Schedule.Event").
		Preload("OrderItem.Category").
		Preload("Staff").
		Offset(offset).
		Limit(perPage).
		Order("checked_in_at DESC").
		Find(&checkIns).Error; err != nil {
		return nil, 0, err
	}

	return checkIns, total, nil
}

// CountByQRCode counts check-ins by QR code
func (r *Repository) CountByQRCode(qrCode string) (int64, error) {
	var count int64
	if err := r.db.Model(&checkin.CheckIn{}).
		Where("qr_code = ?", qrCode).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// CountByOrderItemID counts check-ins by order item ID
func (r *Repository) CountByOrderItemID(orderItemID string) (int64, error) {
	var count int64
	if err := r.db.Model(&checkin.CheckIn{}).
		Where("order_item_id = ?", orderItemID).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

