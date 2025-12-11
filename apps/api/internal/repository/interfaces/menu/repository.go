package menu

import "github.com/gilabs/webapp-ticket-konser/api/internal/domain/menu"

// Repository defines the interface for menu repository operations
type Repository interface {
	FindByID(id string) (*menu.Menu, error)
	FindByCode(code string) (*menu.Menu, error)
	FindByRole(roleID string) ([]*menu.Menu, error) // Get menus accessible by role
	FindByPermission(permissionCode string) ([]*menu.Menu, error)
	Create(m *menu.Menu) error
	Update(m *menu.Menu) error
	Delete(id string) error
	List() ([]*menu.Menu, error)
	ListTree() ([]menu.Menu, error) // Get menu tree with parent-child
}



