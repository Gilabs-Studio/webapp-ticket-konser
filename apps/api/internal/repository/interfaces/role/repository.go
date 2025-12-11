package role

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
)

// Repository defines the interface for role repository operations
type Repository interface {
	FindByID(id string) (*role.Role, error)
	FindByCode(code string) (*role.Role, error)
	AddPermission(roleID string, permissionID string) error
	RemovePermission(roleID string, permissionID string) error
	GetPermissions(roleID string) ([]*permission.Permission, error)
	HasPermission(roleID string, permissionCode string) (bool, error)
}


