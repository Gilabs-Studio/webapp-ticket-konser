package gate_staff

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/gate"
	gatestaffrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/gate_staff"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) gatestaffrepo.Repository {
	return &Repository{db: db}
}

func (r *Repository) Assign(gateID, staffID string) error {
	assignment := &gate.GateStaffAssignment{GateID: gateID, StaffID: staffID}
	// Upsert-style: if already exists, do nothing.
	// This avoids 500s on repeated assignment calls.
	return r.db.FirstOrCreate(assignment, "gate_id = ? AND staff_id = ?", gateID, staffID).Error
}

func (r *Repository) Unassign(gateID, staffID string) error {
	return r.db.Where("gate_id = ? AND staff_id = ?", gateID, staffID).
		Delete(&gate.GateStaffAssignment{}).Error
}

func (r *Repository) IsStaffAssignedToGate(gateID, staffID string) (bool, error) {
	var count int64
	if err := r.db.Model(&gate.GateStaffAssignment{}).
		Where("gate_id = ? AND staff_id = ?", gateID, staffID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *Repository) ListGatesByStaffID(staffID string) ([]*gate.Gate, error) {
	var assignments []*gate.GateStaffAssignment
	if err := r.db.Where("staff_id = ?", staffID).
		Preload("Gate").
		Find(&assignments).Error; err != nil {
		return nil, err
	}

	gates := make([]*gate.Gate, 0, len(assignments))
	for _, a := range assignments {
		if a != nil && a.Gate != nil {
			gates = append(gates, a.Gate)
		}
	}
	return gates, nil
}

var _ gatestaffrepo.Repository = (*Repository)(nil)

var ErrNotFound = errors.New("gate staff assignment not found")
