package permission

import "github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"

// Repository defines the interface for permission repository operations
type Repository interface {
	FindByID(id string) (*permission.Permission, error)
	FindByCode(code string) (*permission.Permission, error)
	FindByResource(resource string) ([]*permission.Permission, error)
	Create(p *permission.Permission) error
	Update(p *permission.Permission) error
	Delete(id string) error
	List() ([]*permission.Permission, error)
}


