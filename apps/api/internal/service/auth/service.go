package auth

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/auth"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/menu"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	authrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/auth"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	menuservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/menu"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserInactive       = errors.New("user is inactive")
)

type Service struct {
	repo        authrepo.Repository
	roleRepo    role.Repository
	menuService *menuservice.Service
	jwtManager  *jwt.JWTManager
}

func NewService(repo authrepo.Repository, roleRepo role.Repository, menuService *menuservice.Service, jwtManager *jwt.JWTManager) *Service {
	return &Service{
		repo:        repo,
		roleRepo:    roleRepo,
		menuService: menuService,
		jwtManager:  jwtManager,
	}
}

// Login authenticates a user and returns tokens
func (s *Service) Login(req *auth.LoginRequest) (*auth.LoginResponse, error) {
	// Find user by email
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	// Check if user is active
	if user.Status != "active" {
		return nil, ErrUserInactive
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Check if user role can login admin
	if user.RoleID != "" {
		role, err := s.roleRepo.FindByID(user.RoleID)
		if err == nil && !role.CanLoginAdmin {
			return nil, errors.New("this role cannot login to admin dashboard")
		}
	}

	// Get role code and role ID
	roleCode := "user"
	roleID := ""
	if user.Role != nil {
		roleCode = user.Role.Code
		roleID = user.Role.ID
	}

	// Get permissions for the role
	var permissions []string
	if roleID != "" {
		perms, err := s.roleRepo.GetPermissions(roleID)
		if err == nil {
			permissions = make([]string, len(perms))
			for i, p := range perms {
				permissions[i] = p.Code
			}
		}
	}

	// Generate tokens
	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, user.Email, roleCode, roleID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.jwtManager.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	// Calculate expires in (seconds)
	expiresIn := int(s.jwtManager.AccessTokenTTL().Seconds())

	// Convert to auth response format
	userResp := user.ToUserResponse()
	authUserResp := &auth.UserResponse{
		ID:         userResp.ID,
		Email:      userResp.Email,
		Name:       userResp.Name,
		AvatarURL:  userResp.AvatarURL,
		Role:       roleCode,
		Status:     userResp.Status,
		Permissions: permissions,
		CreatedAt:  userResp.CreatedAt,
		UpdatedAt:  userResp.UpdatedAt,
	}

	return &auth.LoginResponse{
		User:         authUserResp,
		Token:        accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

// RefreshToken refreshes an access token using refresh token
func (s *Service) RefreshToken(refreshToken string) (*auth.LoginResponse, error) {
	// Validate refresh token
	userID, err := s.jwtManager.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// Find user
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	// Check if user is active
	if user.Status != "active" {
		return nil, ErrUserInactive
	}

	// Get role code and role ID
	roleCode := "user"
	roleID := ""
	if user.Role != nil {
		roleCode = user.Role.Code
		roleID = user.Role.ID
	}

	// Get permissions for the role
	var permissions []string
	if roleID != "" {
		perms, err := s.roleRepo.GetPermissions(roleID)
		if err == nil {
			permissions = make([]string, len(perms))
			for i, p := range perms {
				permissions[i] = p.Code
			}
		}
	}

	// Generate new tokens
	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, user.Email, roleCode, roleID)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := s.jwtManager.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	expiresIn := int(s.jwtManager.AccessTokenTTL().Seconds())

	// Convert to auth response format
	userResp := user.ToUserResponse()
	authUserResp := &auth.UserResponse{
		ID:         userResp.ID,
		Email:      userResp.Email,
		Name:       userResp.Name,
		AvatarURL:  userResp.AvatarURL,
		Role:       roleCode,
		Status:     userResp.Status,
		Permissions: permissions,
		CreatedAt:  userResp.CreatedAt,
		UpdatedAt:  userResp.UpdatedAt,
	}

	return &auth.LoginResponse{
		User:         authUserResp,
		Token:        accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

// MenusAndPermissionsResponse represents response for user menus and permissions
type MenusAndPermissionsResponse struct {
	Menus       []*menu.MenuResponse       `json:"menus"`
	Permissions []*permission.PermissionResponse `json:"permissions"`
}

// GetUserMenusAndPermissions returns menus and permissions for a user based on their role
func (s *Service) GetUserMenusAndPermissions(roleID string) (*MenusAndPermissionsResponse, error) {
	// Get menus by role
	menus, err := s.menuService.GetMenusByRole(roleID)
	if err != nil {
		return nil, err
	}

	// Get permissions by role
	permissions, err := s.roleRepo.GetPermissions(roleID)
	if err != nil {
		return nil, err
	}

	// Convert menus to response format
	menuResponses := make([]*menu.MenuResponse, len(menus))
	for i, m := range menus {
		menuResponses[i] = m.ToMenuResponse()
	}

	// Convert permissions to response format
	permissionResponses := make([]*permission.PermissionResponse, len(permissions))
	for i, p := range permissions {
		permissionResponses[i] = p.ToPermissionResponse()
	}

	return &MenusAndPermissionsResponse{
		Menus:       menuResponses,
		Permissions: permissionResponses,
	}, nil
}
