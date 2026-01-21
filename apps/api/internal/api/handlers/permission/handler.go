package permission

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	permissionservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/permission"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
)

type Handler struct {
	permissionService *permissionservice.Service
}

func NewHandler(permissionService *permissionservice.Service) *Handler {
	return &Handler{
		permissionService: permissionService,
	}
}

// List returns a list of permissions with pagination
// GET /api/v1/admin/permissions
func (h *Handler) List(c *gin.Context) {
	var req permission.ListPermissionsRequest

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

	permissions, pagination, err := h.permissionService.List(&req)
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
	if req.Resource != "" {
		meta.Filters["resource"] = req.Resource
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

	response.SuccessResponse(c, permissions, meta)
}

// GetByID returns a permission by ID
// GET /api/v1/admin/permissions/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	permissionResponse, err := h.permissionService.GetByID(id)
	if err != nil {
		if err == permissionservice.ErrPermissionNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "permission",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, permissionResponse, meta)
}

// Create creates a new permission
// POST /api/v1/admin/permissions
func (h *Handler) Create(c *gin.Context) {
	var req permission.CreatePermissionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	permissionResponse, err := h.permissionService.Create(&req)
	if err != nil {
		if err == permissionservice.ErrPermissionAlreadyExists {
			errors.ErrorResponse(c, "CONFLICT", map[string]interface{}{
				"reason":           "Permission already exists",
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

	response.SuccessResponseCreated(c, permissionResponse, meta)
}

// Update updates a permission
// PUT /api/v1/admin/permissions/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req permission.UpdatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	permissionResponse, err := h.permissionService.Update(id, &req)
	if err != nil {
		if err == permissionservice.ErrPermissionNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "permission",
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

	response.SuccessResponse(c, permissionResponse, meta)
}

// Delete deletes a permission
// DELETE /api/v1/admin/permissions/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.permissionService.Delete(id)
	if err != nil {
		if err == permissionservice.ErrPermissionNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "permission",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}




