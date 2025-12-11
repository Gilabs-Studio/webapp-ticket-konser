package role

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
	permissionrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/permission"
	rolerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"gorm.io/gorm"
)

var (
	ErrRoleNotFound      = errors.New("role not found")
	ErrRoleAlreadyExists = errors.New("role already exists")
	ErrPermissionNotFound = errors.New("permission not found")
)

type Service struct {
	roleRepo       rolerepo.Repository
	permissionRepo permissionrepo.Repository
}

func NewService(roleRepo rolerepo.Repository, permissionRepo permissionrepo.Repository) *Service {
	return &Service{
		roleRepo:       roleRepo,
		permissionRepo: permissionRepo,
	}
}

// List returns a list of roles with pagination
func (s *Service) List(req *role.ListRolesRequest) ([]role.RoleResponse, *PaginationResult, error) {
	roles, total, err := s.roleRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]role.RoleResponse, len(roles))
	for i, r := range roles {
		responses[i] = *r.ToRoleResponse()
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

// GetByID returns a role by ID
func (s *Service) GetByID(id string) (*role.RoleResponse, error) {
	r, err := s.roleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}
	return r.ToRoleResponse(), nil
}

// GetByIDWithPermissions returns a role by ID with permissions
func (s *Service) GetByIDWithPermissions(id string) (*role.RoleWithPermissionsResponse, error) {
	r, err := s.roleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}

	// Get permissions for the role
	permissions, err := s.roleRepo.GetPermissions(id)
	if err != nil {
		return nil, err
	}

	permissionResponses := make([]role.PermissionResponse, len(permissions))
	for i, p := range permissions {
		permissionResponses[i] = role.PermissionResponse{
			ID:       p.ID,
			Code:     p.Code,
			Name:     p.Name,
			Resource: p.Resource,
			Action:   p.Action,
		}
	}

	return &role.RoleWithPermissionsResponse{
		ID:           r.ID,
		Code:         r.Code,
		Name:         r.Name,
		Description:  r.Description,
		IsAdmin:      r.IsAdmin,
		CanLoginAdmin: r.CanLoginAdmin,
		Permissions:  permissionResponses,
		CreatedAt:    r.CreatedAt,
		UpdatedAt:    r.UpdatedAt,
	}, nil
}

// Create creates a new role
func (s *Service) Create(req *role.CreateRoleRequest) (*role.RoleResponse, error) {
	// Check if code already exists
	_, err := s.roleRepo.FindByCode(req.Code)
	if err == nil {
		return nil, ErrRoleAlreadyExists
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Set defaults
	isAdmin := false
	if req.IsAdmin != nil {
		isAdmin = *req.IsAdmin
	}

	canLoginAdmin := true
	if req.CanLoginAdmin != nil {
		canLoginAdmin = *req.CanLoginAdmin
	}

	// Create role
	r := &role.Role{
		Code:         req.Code,
		Name:         req.Name,
		Description:  req.Description,
		IsAdmin:      isAdmin,
		CanLoginAdmin: canLoginAdmin,
	}

	if err := s.roleRepo.Create(r); err != nil {
		return nil, err
	}

	// Reload
	createdRole, err := s.roleRepo.FindByID(r.ID)
	if err != nil {
		return nil, err
	}

	return createdRole.ToRoleResponse(), nil
}

// Update updates a role
func (s *Service) Update(id string, req *role.UpdateRoleRequest) (*role.RoleResponse, error) {
	// Find role
	r, err := s.roleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Name != "" {
		r.Name = req.Name
	}
	if req.Description != "" {
		r.Description = req.Description
	}
	if req.IsAdmin != nil {
		r.IsAdmin = *req.IsAdmin
	}
	if req.CanLoginAdmin != nil {
		r.CanLoginAdmin = *req.CanLoginAdmin
	}

	if err := s.roleRepo.Update(r); err != nil {
		return nil, err
	}

	// Reload
	updatedRole, err := s.roleRepo.FindByID(r.ID)
	if err != nil {
		return nil, err
	}

	return updatedRole.ToRoleResponse(), nil
}

// Delete deletes a role
func (s *Service) Delete(id string) error {
	// Check if role exists
	_, err := s.roleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrRoleNotFound
		}
		return err
	}

	return s.roleRepo.Delete(id)
}

// AssignPermissions assigns permissions to a role
func (s *Service) AssignPermissions(roleID string, permissionIDs []string) error {
	// Check if role exists
	_, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrRoleNotFound
		}
		return err
	}

	// Validate all permissions exist
	for _, permissionID := range permissionIDs {
		_, err := s.permissionRepo.FindByID(permissionID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrPermissionNotFound
			}
			return err
		}
	}

	// Remove all existing permissions
	existingPermissions, err := s.roleRepo.GetPermissions(roleID)
	if err != nil {
		return err
	}

	for _, p := range existingPermissions {
		if err := s.roleRepo.RemovePermission(roleID, p.ID); err != nil {
			return err
		}
	}

	// Add new permissions
	for _, permissionID := range permissionIDs {
		if err := s.roleRepo.AddPermission(roleID, permissionID); err != nil {
			return err
		}
	}

	return nil
}

// PaginationResult represents pagination result
type PaginationResult struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

