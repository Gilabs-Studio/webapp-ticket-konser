package auth

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/auth"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserInactive       = errors.New("user is inactive")
)

type Service struct {
	repo      interfaces.AuthRepository
	jwtManager *jwt.JWTManager
}

func NewService(repo interfaces.AuthRepository, jwtManager *jwt.JWTManager) *Service {
	return &Service{
		repo:       repo,
		jwtManager: jwtManager,
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

	// Get role code
	roleCode := "user"
	if user.Role != nil {
		roleCode = user.Role.Code
	}

	// Generate tokens
	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, user.Email, roleCode)
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
		ID:        userResp.ID,
		Email:     userResp.Email,
		Name:      userResp.Name,
		AvatarURL: userResp.AvatarURL,
		Role:      roleCode,
		Status:    userResp.Status,
		CreatedAt: userResp.CreatedAt,
		UpdatedAt: userResp.UpdatedAt,
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

	// Get role code
	roleCode := "user"
	if user.Role != nil {
		roleCode = user.Role.Code
	}

	// Generate new tokens
	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, user.Email, roleCode)
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
		ID:        userResp.ID,
		Email:     userResp.Email,
		Name:      userResp.Name,
		AvatarURL: userResp.AvatarURL,
		Role:      roleCode,
		Status:    userResp.Status,
		CreatedAt: userResp.CreatedAt,
		UpdatedAt: userResp.UpdatedAt,
	}

	return &auth.LoginResponse{
		User:         authUserResp,
		Token:        accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

