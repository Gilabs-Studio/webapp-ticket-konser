package permission

import (
	"errors"
	"strings"

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

// List lists all permissions with pagination
func (r *Repository) List(req *permission.ListPermissionsRequest) ([]permission.Permission, int64, error) {
	var permissions []permission.Permission
	var total int64

	query := r.db.Model(&permission.Permission{})

	// Apply search filter
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where("LOWER(code) LIKE ? OR LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(resource) LIKE ?", search, search, search, search)
	}

	// Apply resource filter
	if req.Resource != "" {
		query = query.Where("resource = ?", req.Resource)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	offset := (page - 1) * perPage

	// Fetch data
	err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&permissions).Error
	if err != nil {
		return nil, 0, err
	}

	return permissions, total, nil
}




