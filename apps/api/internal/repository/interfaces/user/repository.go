package user

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
)

// Repository defines the interface for user repository
type Repository interface {
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




