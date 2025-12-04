package user

import (
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new user repository
func NewRepository(db *gorm.DB) interfaces.UserRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*user.User, error) {
	var u user.User
	err := r.db.Preload("Role").Preload("Role.Permissions").Where("id = ?", id).First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repository) FindByEmail(email string) (*user.User, error) {
	var u user.User
	err := r.db.Preload("Role").Preload("Role.Permissions").Where("email = ?", email).First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repository) List(req *user.ListUsersRequest) ([]user.User, int64, error) {
	var users []user.User
	var total int64

	query := r.db.Model(&user.User{}).Preload("Role").Preload("Role.Permissions")

	// Apply filters
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		// Search across all columns: name, email, role name, and status
		query = query.Where(
			"LOWER(users.name) LIKE ? OR LOWER(users.email) LIKE ? OR LOWER(users.status) LIKE ? OR EXISTS (SELECT 1 FROM roles WHERE roles.id = users.role_id AND LOWER(roles.name) LIKE ?)",
			search, search, search, search,
		)
	}

	if req.Status != "" {
		query = query.Where("users.status = ?", req.Status)
	}

	if req.RoleID != "" {
		query = query.Where("users.role_id = ?", req.RoleID)
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
	err := query.Order("users.created_at DESC").Offset(offset).Limit(perPage).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *repository) Create(u *user.User) error {
	return r.db.Create(u).Error
}

func (r *repository) Update(u *user.User) error {
	return r.db.Save(u).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&user.User{}).Error
}

