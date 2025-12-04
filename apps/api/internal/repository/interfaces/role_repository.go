package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/role"
)

// RoleRepository defines the interface for role repository operations
type RoleRepository interface {
	FindByID(id string) (*role.Role, error)
}

