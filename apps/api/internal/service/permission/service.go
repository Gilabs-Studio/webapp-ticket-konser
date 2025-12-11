package permission

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	permissionrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/permission"
	"gorm.io/gorm"
)

var (
	ErrPermissionNotFound      = errors.New("permission not found")
	ErrPermissionAlreadyExists = errors.New("permission already exists")
)

type Service struct {
	repo permissionrepo.Repository
}

func NewService(repo permissionrepo.Repository) *Service {
	return &Service{repo: repo}
}

// List returns a list of permissions with pagination
func (s *Service) List(req *permission.ListPermissionsRequest) ([]permission.PermissionResponse, *PaginationResult, error) {
	permissions, total, err := s.repo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]permission.PermissionResponse, len(permissions))
	for i, p := range permissions {
		responses[i] = *p.ToPermissionResponse()
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

// GetByID gets a permission by ID
func (s *Service) GetByID(id string) (*permission.PermissionResponse, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, err
	}
	return p.ToPermissionResponse(), nil
}

// GetByCode gets a permission by code
func (s *Service) GetByCode(code string) (*permission.PermissionResponse, error) {
	p, err := s.repo.FindByCode(code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, err
	}
	return p.ToPermissionResponse(), nil
}

// GetByResource gets permissions by resource
func (s *Service) GetByResource(resource string) ([]*permission.PermissionResponse, error) {
	permissions, err := s.repo.FindByResource(resource)
	if err != nil {
		return nil, err
	}

	responses := make([]*permission.PermissionResponse, len(permissions))
	for i, p := range permissions {
		responses[i] = p.ToPermissionResponse()
	}

	return responses, nil
}

// Create creates a new permission
func (s *Service) Create(req *permission.CreatePermissionRequest) (*permission.PermissionResponse, error) {
	// Check if code already exists
	_, err := s.repo.FindByCode(req.Code)
	if err == nil {
		return nil, ErrPermissionAlreadyExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Create permission
	p := &permission.Permission{
		Code:        req.Code,
		Name:        req.Name,
		Description: req.Description,
		Resource:    req.Resource,
		Action:      req.Action,
	}

	if err := s.repo.Create(p); err != nil {
		return nil, err
	}

	// Reload
	createdPermission, err := s.repo.FindByID(p.ID)
	if err != nil {
		return nil, err
	}

	return createdPermission.ToPermissionResponse(), nil
}

// Update updates a permission
func (s *Service) Update(id string, req *permission.UpdatePermissionRequest) (*permission.PermissionResponse, error) {
	// Find permission
	p, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Name != "" {
		p.Name = req.Name
	}
	if req.Description != "" {
		p.Description = req.Description
	}
	if req.Resource != "" {
		p.Resource = req.Resource
	}
	if req.Action != "" {
		p.Action = req.Action
	}

	if err := s.repo.Update(p); err != nil {
		return nil, err
	}

	// Reload
	updatedPermission, err := s.repo.FindByID(p.ID)
	if err != nil {
		return nil, err
	}

	return updatedPermission.ToPermissionResponse(), nil
}

// Delete deletes a permission
func (s *Service) Delete(id string) error {
	// Check if permission exists
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPermissionNotFound
		}
		return err
	}

	return s.repo.Delete(id)
}

// PaginationResult represents pagination result
type PaginationResult struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}
