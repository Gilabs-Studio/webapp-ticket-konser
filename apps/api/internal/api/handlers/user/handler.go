package user

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	userservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/user"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
)

type Handler struct {
	userService *userservice.Service
}

func NewHandler(userService *userservice.Service) *Handler {
	return &Handler{
		userService: userService,
	}
}

// List returns a list of users with pagination
// GET /api/v1/admin/users
func (h *Handler) List(c *gin.Context) {
	var req user.ListUsersRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	// Set defaults
	if req.Page < 1 {
		req.Page = 1
	}
	if req.PerPage < 1 {
		req.PerPage = 20
	}
	if req.PerPage > 100 {
		req.PerPage = 100
	}

	users, pagination, err := h.userService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: &response.PaginationMeta{
			Page:       pagination.Page,
			PerPage:    pagination.PerPage,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.Page < pagination.TotalPages,
			HasPrev:    pagination.Page > 1,
		},
		Filters: map[string]interface{}{},
	}

	// Add filters to meta if provided
	if req.Search != "" {
		meta.Filters["search"] = req.Search
	}
	if req.Status != "" {
		meta.Filters["status"] = req.Status
	}
	if req.RoleID != "" {
		meta.Filters["role_id"] = req.RoleID
	}

	// Add next/prev page
	if meta.Pagination.HasNext {
		nextPage := pagination.Page + 1
		meta.Pagination.NextPage = &nextPage
	}
	if meta.Pagination.HasPrev {
		prevPage := pagination.Page - 1
		meta.Pagination.PrevPage = &prevPage
	}

	response.SuccessResponse(c, users, meta)
}

// GetByID returns a user by ID
// GET /api/v1/admin/users/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	userResponse, err := h.userService.GetByID(id)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.NotFoundResponse(c, "user", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, userResponse, meta)
}

// Create creates a new user
// POST /api/v1/admin/users
func (h *Handler) Create(c *gin.Context) {
	var req user.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	userResponse, err := h.userService.Create(&req)
	if err != nil {
		if err == userservice.ErrUserAlreadyExists {
			errors.ErrorResponse(c, "CONFLICT", map[string]interface{}{
				"reason":         "User already exists",
				"conflicting_field": "email",
				"conflicting_value": req.Email,
			}, nil)
			return
		}
		if err == userservice.ErrRoleNotFound {
			errors.NotFoundResponse(c, "role", req.RoleID)
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

	response.SuccessResponseCreated(c, userResponse, meta)
}

// Update updates a user
// PUT /api/v1/admin/users/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req user.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	userResponse, err := h.userService.Update(id, &req)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.NotFoundResponse(c, "user", id)
			return
		}
		if err == userservice.ErrUserAlreadyExists {
			errors.ErrorResponse(c, "CONFLICT", map[string]interface{}{
				"reason":           "User already exists",
				"conflicting_field": "email",
				"conflicting_value": req.Email,
			}, nil)
			return
		}
		if err == userservice.ErrRoleNotFound {
			errors.NotFoundResponse(c, "role", req.RoleID)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.UpdatedBy = id
		}
	}

	response.SuccessResponse(c, userResponse, meta)
}

// Delete deletes a user
// DELETE /api/v1/admin/users/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.userService.Delete(id)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.NotFoundResponse(c, "user", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

