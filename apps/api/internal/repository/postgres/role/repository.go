package role

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
	rolerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"gorm.io/gorm"
)

var (
	ErrRoleNotFound = errors.New("role not found")
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) rolerepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds a role by ID
func (r *Repository) FindByID(id string) (*role.Role, error) {
	var roleEntity role.Role
	if err := r.db.Where("id = ?", id).First(&roleEntity).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}
	return &roleEntity, nil
}

// FindByCode finds a role by code
func (r *Repository) FindByCode(code string) (*role.Role, error) {
	var roleEntity role.Role
	if err := r.db.Where("code = ?", code).First(&roleEntity).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}
	return &roleEntity, nil
}

// AddPermission adds a permission to a role
func (r *Repository) AddPermission(roleID string, permissionID string) error {
	rolePermission := role.RolePermission{
		RoleID:       roleID,
		PermissionID: permissionID,
	}
	return r.db.Create(&rolePermission).Error
}

// RemovePermission removes a permission from a role
func (r *Repository) RemovePermission(roleID string, permissionID string) error {
	return r.db.Where("role_id = ? AND permission_id = ?", roleID, permissionID).
		Delete(&role.RolePermission{}).Error
}

// GetPermissions gets all permissions for a role
func (r *Repository) GetPermissions(roleID string) ([]*permission.Permission, error) {
	var permissions []*permission.Permission
	err := r.db.Table("permissions").
		Joins("INNER JOIN role_permissions ON permissions.id = role_permissions.permission_id").
		Where("role_permissions.role_id = ?", roleID).
		Find(&permissions).Error
	return permissions, err
}

// HasPermission checks if a role has a specific permission by code
func (r *Repository) HasPermission(roleID string, permissionCode string) (bool, error) {
	var count int64
	err := r.db.Table("permissions").
		Joins("INNER JOIN role_permissions ON permissions.id = role_permissions.permission_id").
		Where("role_permissions.role_id = ? AND permissions.code = ?", roleID, permissionCode).
		Count(&count).Error
	return count > 0, err
}

