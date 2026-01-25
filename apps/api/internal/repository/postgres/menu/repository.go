package menu

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/menu"
	menurepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/menu"
	"gorm.io/gorm"
)

var (
	ErrMenuNotFound = errors.New("menu not found")
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) menurepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds a menu by ID
func (r *Repository) FindByID(id string) (*menu.Menu, error) {
	var m menu.Menu
	if err := r.db.Where("id = ?", id).Preload("Children").First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Join(gorm.ErrRecordNotFound, ErrMenuNotFound)
		}
		return nil, err
	}
	return &m, nil
}

// FindByCode finds a menu by code
func (r *Repository) FindByCode(code string) (*menu.Menu, error) {
	var m menu.Menu
	if err := r.db.Where("code = ?", code).Preload("Children").First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Join(gorm.ErrRecordNotFound, ErrMenuNotFound)
		}
		return nil, err
	}
	return &m, nil
}

// FindByRole finds menus accessible by role (via permissions)
func (r *Repository) FindByRole(roleID string) ([]*menu.Menu, error) {
	// This will be handled in service layer with permission checking
	// Here we just return all active menus, filtering will be done in service
	var menus []*menu.Menu
	if err := r.db.Where("is_active = ?", true).
		Order("order_index ASC").
		Preload("Children", "is_active = ?", true).
		Find(&menus).Error; err != nil {
		return nil, err
	}
	return menus, nil
}

// FindByPermission finds menus by permission code
func (r *Repository) FindByPermission(permissionCode string) ([]*menu.Menu, error) {
	var menus []*menu.Menu
	if err := r.db.Where("permission_code = ? AND is_active = ?", permissionCode, true).
		Order("order_index ASC").
		Find(&menus).Error; err != nil {
		return nil, err
	}
	return menus, nil
}

// Create creates a new menu
func (r *Repository) Create(m *menu.Menu) error {
	return r.db.Create(m).Error
}

// Update updates a menu
func (r *Repository) Update(m *menu.Menu) error {
	return r.db.Save(m).Error
}

// Delete soft deletes a menu
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&menu.Menu{}).Error
}

// List lists all menus
func (r *Repository) List() ([]*menu.Menu, error) {
	var menus []*menu.Menu
	if err := r.db.Order("order_index ASC").Find(&menus).Error; err != nil {
		return nil, err
	}
	return menus, nil
}

// ListTree lists all menus with parent-child relationships
func (r *Repository) ListTree() ([]menu.Menu, error) {
	var menus []menu.Menu
	if err := r.db.Where("parent_id IS NULL").
		Where("is_active = ?", true).
		Order("order_index ASC").
		Preload("Children", "is_active = ?", true).
		Find(&menus).Error; err != nil {
		return nil, err
	}

	// Also get menus with parent_id (children)
	var childMenus []menu.Menu
	if err := r.db.Where("parent_id IS NOT NULL").
		Where("is_active = ?", true).
		Order("order_index ASC").
		Find(&childMenus).Error; err != nil {
		return nil, err
	}

	// Build tree structure
	menuMap := make(map[string]*menu.Menu)
	for i := range menus {
		menuMap[menus[i].ID] = &menus[i]
	}

	for i := range childMenus {
		if childMenus[i].ParentID != nil {
			if parent, exists := menuMap[*childMenus[i].ParentID]; exists {
				parent.Children = append(parent.Children, childMenus[i])
			} else {
				// If parent not found in root menus, add as root
				menus = append(menus, childMenus[i])
			}
		}
	}

	return menus, nil
}

