package user

import (
	"errors"
	"net/url"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	userrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/user"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrRoleNotFound      = errors.New("role not found")
)

type Service struct {
	userRepo userrepo.Repository
	roleRepo role.Repository
}

func NewService(userRepo userrepo.Repository, roleRepo role.Repository) *Service {
	return &Service{
		userRepo: userRepo,
		roleRepo: roleRepo,
	}
}

// List returns a list of users with pagination
func (s *Service) List(req *user.ListUsersRequest) ([]user.UserResponse, *PaginationResult, error) {
	users, total, err := s.userRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]user.UserResponse, len(users))
	for i, u := range users {
		responses[i] = *u.ToUserResponse()
	}

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

	pagination := &PaginationResult{
		Page:       page,
		PerPage:    perPage,
		Total:      int(total),
		TotalPages: int((total + int64(perPage) - 1) / int64(perPage)),
	}

	return responses, pagination, nil
}

// GetByID returns a user by ID
func (s *Service) GetByID(id string) (*user.UserResponse, error) {
	u, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return u.ToUserResponse(), nil
}

// Create creates a new user
func (s *Service) Create(req *user.CreateUserRequest) (*user.UserResponse, error) {
	// Check if role exists
	_, err := s.roleRepo.FindByID(req.RoleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}

	// Check if email already exists
	_, err = s.userRepo.FindByEmail(req.Email)
	if err == nil {
		return nil, ErrUserAlreadyExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Set default status
	status := req.Status
	if status == "" {
		status = "active"
	}

	// Generate avatar URL using dicebear lorelei
	avatarURL := "https://api.dicebear.com/7.x/lorelei/svg?seed=" + url.QueryEscape(req.Email)

	// Create user
	u := &user.User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		Name:      req.Name,
		AvatarURL: avatarURL,
		RoleID:    req.RoleID,
		Status:    status,
	}

	if err := s.userRepo.Create(u); err != nil {
		return nil, err
	}

	// Reload with role
	createdUser, err := s.userRepo.FindByID(u.ID)
	if err != nil {
		return nil, err
	}

	return createdUser.ToUserResponse(), nil
}

// Update updates a user
func (s *Service) Update(id string, req *user.UpdateUserRequest) (*user.UserResponse, error) {
	// Find user
	u, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Email != "" {
		// Check if email already exists (excluding current user)
		existingUser, err := s.userRepo.FindByEmail(req.Email)
		if err == nil && existingUser.ID != id {
			return nil, ErrUserAlreadyExists
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		u.Email = req.Email
	}

	if req.Name != "" {
		u.Name = req.Name
	}

	if req.RoleID != "" {
		// Check if role exists
		_, err := s.roleRepo.FindByID(req.RoleID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrRoleNotFound
			}
			return nil, err
		}
		u.RoleID = req.RoleID
	}

	if req.Status != "" {
		u.Status = req.Status
	}

	if err := s.userRepo.Update(u); err != nil {
		return nil, err
	}

	// Reload with role
	updatedUser, err := s.userRepo.FindByID(u.ID)
	if err != nil {
		return nil, err
	}

	return updatedUser.ToUserResponse(), nil
}

// Delete deletes a user
func (s *Service) Delete(id string) error {
	// Check if user exists
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return err
	}

	return s.userRepo.Delete(id)
}

// PaginationResult represents pagination result
type PaginationResult struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}
