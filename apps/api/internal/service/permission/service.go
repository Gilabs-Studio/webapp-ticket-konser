package permission

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	permissionrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/permission"
)

type Service struct {
	repo permissionrepo.Repository
}

func NewService(repo permissionrepo.Repository) *Service {
	return &Service{repo: repo}
}

// GetByID gets a permission by ID
func (s *Service) GetByID(id string) (*permission.Permission, error) {
	return s.repo.FindByID(id)
}

// GetByCode gets a permission by code
func (s *Service) GetByCode(code string) (*permission.Permission, error) {
	return s.repo.FindByCode(code)
}

// GetByResource gets permissions by resource
func (s *Service) GetByResource(resource string) ([]*permission.Permission, error) {
	return s.repo.FindByResource(resource)
}

// Create creates a new permission
func (s *Service) Create(p *permission.Permission) error {
	return s.repo.Create(p)
}

// Update updates a permission
func (s *Service) Update(p *permission.Permission) error {
	return s.repo.Update(p)
}

// Delete deletes a permission
func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}

// List lists all permissions
func (s *Service) List() ([]*permission.Permission, error) {
	return s.repo.List()
}




