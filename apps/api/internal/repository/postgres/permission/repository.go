package permission

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	permissionrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/permission"
	"gorm.io/gorm"
)

var (
	ErrPermissionNotFound = errors.New("permission not found")
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) permissionrepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds a permission by ID
func (r *Repository) FindByID(id string) (*permission.Permission, error) {
	var perm permission.Permission
	if err := r.db.Where("id = ?", id).First(&perm).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, err
	}
	return &perm, nil
}

// FindByCode finds a permission by code
func (r *Repository) FindByCode(code string) (*permission.Permission, error) {
	var perm permission.Permission
	if err := r.db.Where("code = ?", code).First(&perm).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, err
	}
	return &perm, nil
}

// FindByResource finds permissions by resource
func (r *Repository) FindByResource(resource string) ([]*permission.Permission, error) {
	var permissions []*permission.Permission
	if err := r.db.Where("resource = ?", resource).Find(&permissions).Error; err != nil {
		return nil, err
	}
	return permissions, nil
}

// Create creates a new permission
func (r *Repository) Create(p *permission.Permission) error {
	return r.db.Create(p).Error
}

// Update updates a permission
func (r *Repository) Update(p *permission.Permission) error {
	return r.db.Save(p).Error
}

// Delete soft deletes a permission
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&permission.Permission{}).Error
}

// List lists all permissions
func (r *Repository) List() ([]*permission.Permission, error) {
	var permissions []*permission.Permission
	if err := r.db.Find(&permissions).Error; err != nil {
		return nil, err
	}
	return permissions, nil
}




