package role

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/role"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrRoleNotFound = errors.New("role not found")
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) interfaces.RoleRepository {
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

