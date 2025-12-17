package role

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
	roleservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
)

type Handler struct {
	roleService *roleservice.Service
}

func NewHandler(roleService *roleservice.Service) *Handler {
	return &Handler{
		roleService: roleService,
	}
}

// List returns a list of roles with pagination
// GET /api/v1/admin/roles
func (h *Handler) List(c *gin.Context) {
	var req role.ListRolesRequest

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

	roles, pagination, err := h.roleService.List(&req)
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

	// Add next/prev page
	if meta.Pagination.HasNext {
		nextPage := pagination.Page + 1
		meta.Pagination.NextPage = &nextPage
	}
	if meta.Pagination.HasPrev {
		prevPage := pagination.Page - 1
		meta.Pagination.PrevPage = &prevPage
	}

	response.SuccessResponse(c, roles, meta)
}

// GetByID returns a role by ID
// GET /api/v1/admin/roles/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	// Check if include permissions query param exists
	includePermissions := c.Query("include") == "permissions"

	var roleResponse interface{}
	var err error

	if includePermissions {
		roleResponse, err = h.roleService.GetByIDWithPermissions(id)
	} else {
		roleResponse, err = h.roleService.GetByID(id)
	}

	if err != nil {
		if err == roleservice.ErrRoleNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "role",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, roleResponse, meta)
}

// Create creates a new role
// POST /api/v1/admin/roles
func (h *Handler) Create(c *gin.Context) {
	var req role.CreateRoleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	roleResponse, err := h.roleService.Create(&req)
	if err != nil {
		if err == roleservice.ErrRoleAlreadyExists {
			errors.ErrorResponse(c, "CONFLICT", map[string]interface{}{
				"reason":           "Role already exists",
				"conflicting_field": "code",
				"conflicting_value": req.Code,
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

	response.SuccessResponseCreated(c, roleResponse, meta)
}

// Update updates a role
// PUT /api/v1/admin/roles/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req role.UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	roleResponse, err := h.roleService.Update(id, &req)
	if err != nil {
		if err == roleservice.ErrRoleNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "role",
				"resource_id": id,
			}, nil)
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

	response.SuccessResponse(c, roleResponse, meta)
}

// Delete deletes a role
// DELETE /api/v1/admin/roles/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.roleService.Delete(id)
	if err != nil {
		if err == roleservice.ErrRoleNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "role",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// AssignPermissions assigns permissions to a role
// PUT /api/v1/admin/roles/:id/permissions
func (h *Handler) AssignPermissions(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req role.AssignPermissionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	err := h.roleService.AssignPermissions(id, req.PermissionIDs)
	if err != nil {
		if err == roleservice.ErrRoleNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "role",
				"resource_id": id,
			}, nil)
			return
		}
		if err == roleservice.ErrPermissionNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "permission",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Return updated role with permissions
	roleResponse, err := h.roleService.GetByIDWithPermissions(id)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.UpdatedBy = id
		}
	}

	response.SuccessResponse(c, roleResponse, meta)
}


