package auth

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/auth"
	authservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/auth"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	authService *authservice.Service
}

func NewHandler(authService *authservice.Service) *Handler {
	return &Handler{
		authService: authService,
	}
}

// Login handles login request
// @Summary Login user
// @Description Authenticate user and return JWT tokens
// @Tags auth
// @Accept json
// @Produce json
// @Param request body auth.LoginRequest true "Login credentials"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Router /api/v1/auth/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req auth.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	loginResponse, err := h.authService.Login(&req)
	if err != nil {
		if err == authservice.ErrInvalidCredentials {
			errors.ErrorResponse(c, "INVALID_CREDENTIALS", nil, nil)
			return
		}
		if err == authservice.ErrUserInactive {
			errors.ErrorResponse(c, "ACCOUNT_DISABLED", map[string]interface{}{
				"reason": "User account is inactive",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.CreatedBy = id
		}
	}

	response.SuccessResponse(c, loginResponse, meta)
}

// Register handles buyer self-registration
// @Summary Register new buyer account
// @Description Create a new buyer (guest) account and return JWT tokens for immediate login
// @Tags auth
// @Accept json
// @Produce json
// @Param request body auth.RegisterRequest true "Registration details"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Router /api/v1/auth/register [post]
func (h *Handler) Register(c *gin.Context) {
	var req auth.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	registerResponse, err := h.authService.Register(&req)
	if err != nil {
		switch err {
		case authservice.ErrPasswordMismatch:
			errors.ErrorResponse(c, "VALIDATION_ERROR", map[string]interface{}{
				"confirm_password": "Passwords do not match",
			}, nil)
		case authservice.ErrUserAlreadyExists:
			errors.ErrorResponse(c, "EMAIL_ALREADY_EXISTS", map[string]interface{}{
				"email": "Email is already registered",
			}, nil)
		case authservice.ErrGuestRoleNotFound:
			errors.InternalServerErrorResponse(c, "Registration configuration error")
		default:
			errors.InternalServerErrorResponse(c, "")
		}
		return
	}

	response.SuccessResponseCreated(c, registerResponse, nil)
}

// RefreshToken handles refresh token request
// @Summary Refresh access token
// @Description Refresh access token using refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body map[string]string true "Refresh token"
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Router /api/v1/auth/refresh [post]
func (h *Handler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	loginResponse, err := h.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		if err == authservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", nil, nil)
			return
		}
		errors.ErrorResponse(c, "REFRESH_TOKEN_INVALID", nil, nil)
		return
	}

	response.SuccessResponse(c, loginResponse, nil)
}

// Logout handles logout request
// @Summary Logout user
// @Description Logout user (invalidate token on client side)
// @Tags auth
// @Security BearerAuth
// @Produce json
// @Success 204
// @Router /api/v1/auth/logout [post]
func (h *Handler) Logout(c *gin.Context) {
	// In a stateless JWT system, logout is handled client-side
	// Server can maintain a blacklist if needed
	response.SuccessResponseNoContent(c)
}

// GetUserMenusAndPermissions returns menus and permissions for the current user
// @Summary Get user menus and permissions
// @Description Get menus and permissions based on the logged-in user's role
// @Tags auth
// @Security BearerAuth
// @Produce json
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Router /api/v1/auth/me/menus-permissions [get]
func (h *Handler) GetUserMenusAndPermissions(c *gin.Context) {
	// Get role_id from context (set by auth middleware)
	roleID, exists := c.Get("role_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Role ID not found in context",
		}, nil)
		c.Abort()
		return
	}

	roleIDStr, ok := roleID.(string)
	if !ok || roleIDStr == "" {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid role ID",
		}, nil)
		c.Abort()
		return
	}

	result, err := h.authService.GetUserMenusAndPermissions(roleIDStr)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, result, meta)
}



