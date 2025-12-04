package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
)

// UserRepository defines the interface for user repository
type UserRepository interface {
	// FindByID finds a user by ID
	FindByID(id string) (*user.User, error)
	
	// FindByEmail finds a user by email
	FindByEmail(email string) (*user.User, error)
	
	// List returns a list of users with pagination
	List(req *user.ListUsersRequest) ([]user.User, int64, error)
	
	// Create creates a new user
	Create(user *user.User) error
	
	// Update updates a user
	Update(user *user.User) error
	
	// Delete soft deletes a user
	Delete(id string) error
}

