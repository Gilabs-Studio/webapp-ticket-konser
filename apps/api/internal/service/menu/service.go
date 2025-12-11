package menu

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/menu"
	menurepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/menu"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
)

type Service struct {
	menuRepo menurepo.Repository
	roleRepo role.Repository
}

func NewService(menuRepo menurepo.Repository, roleRepo role.Repository) *Service {
	return &Service{
		menuRepo: menuRepo,
		roleRepo: roleRepo,
	}
}

// GetMenusByRole returns menus accessible by role
func (s *Service) GetMenusByRole(roleID string) ([]*menu.Menu, error) {
	// Get all permissions for role
	permissions, err := s.roleRepo.GetPermissions(roleID)
	if err != nil {
		return nil, err
	}

	// Get all menus
	allMenus, err := s.menuRepo.ListTree()
	if err != nil {
		return nil, err
	}

	// Build permission map
	permissionMap := make(map[string]bool)
	for _, p := range permissions {
		permissionMap[p.Code] = true
	}

	// Filter menus based on permissions
	var accessibleMenus []*menu.Menu
	for i := range allMenus {
		m := allMenus[i]

		// Menu tanpa permission_code bisa diakses semua yang bisa login admin
		if m.PermissionCode == "" {
			// Filter children recursively
			filteredMenu := m
			filteredMenu.Children = s.filterMenuChildren(m.Children, permissionMap)
			accessibleMenus = append(accessibleMenus, &filteredMenu)
			continue
		}

		// Menu dengan permission_code hanya bisa diakses jika role memiliki permission
		if permissionMap[m.PermissionCode] {
			// Filter children recursively
			filteredMenu := m
			filteredMenu.Children = s.filterMenuChildren(m.Children, permissionMap)
			accessibleMenus = append(accessibleMenus, &filteredMenu)
		}
	}

	return accessibleMenus, nil
}

// filterMenuChildren filters menu children based on permissions
func (s *Service) filterMenuChildren(children []menu.Menu, permissionMap map[string]bool) []menu.Menu {
	var filtered []menu.Menu
	for i := range children {
		child := &children[i]
		if child.PermissionCode == "" || permissionMap[child.PermissionCode] {
			filteredChild := *child
			// Recursively filter nested children
			if len(child.Children) > 0 {
				filteredChild.Children = s.filterMenuChildren(child.Children, permissionMap)
			}
			filtered = append(filtered, filteredChild)
		}
	}
	return filtered
}

// GetByID gets a menu by ID
func (s *Service) GetByID(id string) (*menu.Menu, error) {
	return s.menuRepo.FindByID(id)
}

// GetByCode gets a menu by code
func (s *Service) GetByCode(code string) (*menu.Menu, error) {
	return s.menuRepo.FindByCode(code)
}

// Create creates a new menu
func (s *Service) Create(m *menu.Menu) error {
	return s.menuRepo.Create(m)
}

// Update updates a menu
func (s *Service) Update(m *menu.Menu) error {
	return s.menuRepo.Update(m)
}

// Delete deletes a menu
func (s *Service) Delete(id string) error {
	return s.menuRepo.Delete(id)
}

// List lists all menus
func (s *Service) List() ([]*menu.Menu, error) {
	return s.menuRepo.List()
}

// ListTree lists all menus with tree structure
func (s *Service) ListTree() ([]menu.Menu, error) {
	return s.menuRepo.ListTree()
}
