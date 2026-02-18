package gate

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GateStaffAssignment represents which staff (gatekeepers) can operate a gate.
// This enables multi-gate deployments where different staff are assigned to different gates.
// Rows are hard-deleted on unassign.
type GateStaffAssignment struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	GateID    string    `gorm:"type:uuid;not null;index;uniqueIndex:ux_gate_staff" json:"gate_id"`
	Gate      *Gate     `gorm:"foreignKey:GateID" json:"gate,omitempty"`
	StaffID   string    `gorm:"type:uuid;not null;index;uniqueIndex:ux_gate_staff" json:"staff_id"`
	Staff     *user.User `gorm:"foreignKey:StaffID" json:"staff,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (GateStaffAssignment) TableName() string {
	return "gate_staff_assignments"
}

func (a *GateStaffAssignment) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}

type AssignStaffToGateRequest struct {
	StaffID string `json:"staff_id" binding:"required,uuid"`
}
