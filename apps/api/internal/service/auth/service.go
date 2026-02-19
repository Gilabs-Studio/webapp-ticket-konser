package auth

import (
	"errors"
	"net/url"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/auth"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/menu"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
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
	ErrUserAlreadyExists  = errors.New("email already registered")
	ErrPasswordMismatch   = errors.New("passwords do not match")
	ErrGuestRoleNotFound  = errors.New("guest role configuration not found")
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

	// Note: CanLoginAdmin is enforced at the admin dashboard routes level,
	// not at login. All active users (including guests) can authenticate.

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

// Register creates a new buyer (guest) account and returns tokens for immediate login
func (s *Service) Register(req *auth.RegisterRequest) (*auth.LoginResponse, error) {
	// Validate passwords match
	if req.Password != req.ConfirmPassword {
		return nil, ErrPasswordMismatch
	}

	// Ensure email is not already registered
	_, err := s.repo.FindByEmail(req.Email)
	if err == nil {
		return nil, ErrUserAlreadyExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Resolve the guest (buyer) role
	guestRole, err := s.roleRepo.FindByCode("guest")
	if err != nil {
		return nil, ErrGuestRoleNotFound
	}

	// Hash the password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Generate a deterministic avatar from the email via DiceBear
	avatarURL := "https://api.dicebear.com/7.x/lorelei/svg?seed=" + url.QueryEscape(req.Email)

	// Persist the new user
	newUser := &user.User{
		Email:     req.Email,
		Password:  string(hashed),
		Name:      req.Name,
		AvatarURL: avatarURL,
		RoleID:    guestRole.ID,
		Status:    "active",
	}
	if err := s.repo.Create(newUser); err != nil {
		return nil, err
	}

	// Reload to hydrate the Role association
	created, err := s.repo.FindByID(newUser.ID)
	if err != nil {
		return nil, err
	}

	// Build token response (same shape as Login)
	roleCode := guestRole.Code
	roleID := guestRole.ID

	var permissions []string
	perms, err := s.roleRepo.GetPermissions(roleID)
	if err == nil {
		permissions = make([]string, len(perms))
		for i, p := range perms {
			permissions[i] = p.Code
		}
	}

	accessToken, err := s.jwtManager.GenerateAccessToken(created.ID, created.Email, roleCode, roleID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.jwtManager.GenerateRefreshToken(created.ID)
	if err != nil {
		return nil, err
	}

	expiresIn := int(s.jwtManager.AccessTokenTTL().Seconds())

	userResp := created.ToUserResponse()
	authUserResp := &auth.UserResponse{
		ID:          userResp.ID,
		Email:       userResp.Email,
		Name:        userResp.Name,
		AvatarURL:   userResp.AvatarURL,
		Role:        roleCode,
		Status:      userResp.Status,
		Permissions: permissions,
		CreatedAt:   userResp.CreatedAt,
		UpdatedAt:   userResp.UpdatedAt,
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
