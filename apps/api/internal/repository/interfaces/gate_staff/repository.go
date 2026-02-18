package gate_staff

import "github.com/gilabs/webapp-ticket-konser/api/internal/domain/gate"

// Repository defines the interface for gate staff assignment operations.
type Repository interface {
	Assign(gateID, staffID string) error
	Unassign(gateID, staffID string) error
	IsStaffAssignedToGate(gateID, staffID string) (bool, error)
	ListGatesByStaffID(staffID string) ([]*gate.Gate, error)
}
