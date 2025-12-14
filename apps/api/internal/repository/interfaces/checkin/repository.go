package checkin

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/checkin"
)

// Repository defines the interface for check-in repository operations
type Repository interface {
	// FindByID finds a check-in by ID
	FindByID(id string) (*checkin.CheckIn, error)

	// FindByQRCode finds check-ins by QR code
	FindByQRCode(qrCode string) ([]*checkin.CheckIn, error)

	// FindByOrderItemID finds check-ins by order item ID
	FindByOrderItemID(orderItemID string) ([]*checkin.CheckIn, error)

	// FindByGateID finds check-ins by gate ID
	FindByGateID(gateID string) ([]*checkin.CheckIn, error)

	// FindByStaffID finds check-ins by staff ID
	FindByStaffID(staffID string) ([]*checkin.CheckIn, error)

	// Create creates a new check-in
	Create(c *checkin.CheckIn) error

	// Update updates a check-in
	Update(c *checkin.CheckIn) error

	// Delete soft deletes a check-in
	Delete(id string) error

	// List lists check-ins with filters
	List(page, perPage int, filters map[string]interface{}) ([]*checkin.CheckIn, int64, error)

	// CountByQRCode counts check-ins by QR code
	CountByQRCode(qrCode string) (int64, error)

	// CountByOrderItemID counts check-ins by order item ID
	CountByOrderItemID(orderItemID string) (int64, error)
}

