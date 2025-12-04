package user

import (
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/role"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a user entity
type User struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email     string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"` // Hidden from JSON
	Name      string    `gorm:"type:varchar(255);not null" json:"name"`
	AvatarURL string    `gorm:"type:text" json:"avatar_url"`
	RoleID    string    `gorm:"type:uuid;not null;index" json:"role_id"`
	Role      *role.Role     `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Status    string    `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to generate UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

// UserResponse represents user response DTO (without sensitive data)
type UserResponse struct {
	ID        string         `json:"id"`
	Email     string         `json:"email"`
	Name      string         `json:"name"`
	AvatarURL string         `json:"avatar_url"`
	RoleID    string         `json:"role_id"`
	Role      *role.RoleResponse  `json:"role,omitempty"`
	Status    string         `json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

// ToUserResponse converts User to UserResponse
func (u *User) ToUserResponse() *UserResponse {
	resp := &UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		AvatarURL: u.AvatarURL,
		RoleID:    u.RoleID,
		Status:    u.Status,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
	if u.Role != nil {
		resp.Role = u.Role.ToRoleResponse()
	}
	return resp
}

// CreateUserRequest represents create user request DTO
type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required,min=3"`
	RoleID   string `json:"role_id" binding:"required,uuid"`
	Status   string `json:"status" binding:"omitempty,oneof=active inactive"`
}

// UpdateUserRequest represents update user request DTO
type UpdateUserRequest struct {
	Email  string `json:"email" binding:"omitempty,email"`
	Name   string `json:"name" binding:"omitempty,min=3"`
	RoleID string `json:"role_id" binding:"omitempty,uuid"`
	Status string `json:"status" binding:"omitempty,oneof=active inactive"`
}

// ListUsersRequest represents list users query parameters
type ListUsersRequest struct {
	Page    int    `form:"page" binding:"omitempty,min=1"`
	PerPage int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search  string `form:"search" binding:"omitempty"`
	Status  string `form:"status" binding:"omitempty,oneof=active inactive"`
	RoleID  string `form:"role_id" binding:"omitempty,uuid"`
}

