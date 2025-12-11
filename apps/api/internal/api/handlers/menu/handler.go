package menu

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/menu"
	menuservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/menu"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
)

type Handler struct {
	menuService *menuservice.Service
}

func NewHandler(menuService *menuservice.Service) *Handler {
	return &Handler{
		menuService: menuService,
	}
}

// GetMenusByRole returns menus accessible by current user's role
// GET /api/v1/menus
func (h *Handler) GetMenusByRole(c *gin.Context) {
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

	menus, err := h.menuService.GetMenusByRole(roleIDStr)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Convert to response format
	menuResponses := make([]*menu.MenuResponse, len(menus))
	for i, m := range menus {
		menuResponses[i] = m.ToMenuResponse()
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, menuResponses, meta)
}

// List returns all menus (admin only)
// GET /api/v1/admin/menus
func (h *Handler) List(c *gin.Context) {
	menus, err := h.menuService.ListTree()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Convert to response format
	menuResponses := make([]*menu.MenuResponse, len(menus))
	for i := range menus {
		menuResponses[i] = menus[i].ToMenuResponse()
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, menuResponses, meta)
}

// Create creates a new menu (admin only)
// POST /api/v1/admin/menus
func (h *Handler) Create(c *gin.Context) {
	var req menu.CreateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	menuEntity := &menu.Menu{
		ParentID:       req.ParentID,
		Code:           req.Code,
		Label:          req.Label,
		Icon:           req.Icon,
		Path:           req.Path,
		OrderIndex:     req.OrderIndex,
		PermissionCode: req.PermissionCode,
		IsActive:       req.IsActive,
	}

	if err := h.menuService.Create(menuEntity); err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponseCreated(c, menuEntity.ToMenuResponse(), meta)
}

// Update updates a menu (admin only)
// PUT /api/v1/admin/menus/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	menuEntity, err := h.menuService.GetByID(id)
	if err != nil {
		errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
			"resource":    "menu",
			"resource_id": id,
		}, nil)
		return
	}

	var req menu.UpdateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	// Update fields
	if req.ParentID != nil {
		menuEntity.ParentID = req.ParentID
	}
	if req.Code != "" {
		menuEntity.Code = req.Code
	}
	if req.Label != "" {
		menuEntity.Label = req.Label
	}
	if req.Icon != "" {
		menuEntity.Icon = req.Icon
	}
	if req.Path != "" {
		menuEntity.Path = req.Path
	}
	if req.OrderIndex != nil {
		menuEntity.OrderIndex = *req.OrderIndex
	}
	if req.PermissionCode != nil {
		menuEntity.PermissionCode = *req.PermissionCode
	}
	if req.IsActive != nil {
		menuEntity.IsActive = *req.IsActive
	}

	if err := h.menuService.Update(menuEntity); err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, menuEntity.ToMenuResponse(), meta)
}

// Delete deletes a menu (admin only)
// DELETE /api/v1/admin/menus/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	if err := h.menuService.Delete(id); err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}



