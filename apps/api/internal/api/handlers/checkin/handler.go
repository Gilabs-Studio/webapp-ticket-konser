package checkin

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/checkin"
	checkinservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/checkin"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	checkInService *checkinservice.Service
}

func NewHandler(checkInService *checkinservice.Service) *Handler {
	return &Handler{
		checkInService: checkInService,
	}
}

// ValidateQRCode validates a QR code
// POST /api/v1/check-in/validate
func (h *Handler) ValidateQRCode(c *gin.Context) {
	var req checkin.ValidateQRCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	result, err := h.checkInService.ValidateQRCode(req.QRCode)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, result, meta)
}

// CheckIn performs check-in operation
// POST /api/v1/check-in
func (h *Handler) CheckIn(c *gin.Context) {
	// Only admin should use generic check-in endpoint.
	// Staff members must use the gate-specific endpoint: POST /api/v1/gates/:id/check-in
	userRole, _ := c.Get("user_role")
	userRoleStr, _ := userRole.(string)
	isAdmin := userRoleStr == "admin" || userRoleStr == "super_admin"
	if !isAdmin {
		errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
			"reason":  "Gate check-in required",
			"message": "Gunakan endpoint gate check-in: /api/v1/gates/:id/check-in",
		}, nil)
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "User ID not found in context",
		}, nil)
		return
	}

	userIDStr, ok := userID.(string)
	if !ok || userIDStr == "" {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid user ID",
		}, nil)
		return
	}

	var req checkin.CheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	// Get IP address and user agent
	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	result, err := h.checkInService.CheckIn(&req, userIDStr, ipAddress, userAgent)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	if !result.Success {
		// Return error response based on error code
		switch result.ErrorCode {
		case "INVALID_QR_CODE":
			errors.ErrorResponse(c, "INVALID_QR_CODE", map[string]interface{}{
				"message": result.Message,
			}, nil)
		case "QR_CODE_ALREADY_USED":
			errors.ErrorResponse(c, "QR_CODE_ALREADY_USED", map[string]interface{}{
				"message": result.Message,
			}, nil)
		case "TICKET_NOT_PAID":
			errors.ErrorResponse(c, "TICKET_NOT_PAID", map[string]interface{}{
				"message": result.Message,
			}, nil)
		case "DUPLICATE_CHECK_IN":
			errors.ErrorResponse(c, "DUPLICATE_CHECK_IN", map[string]interface{}{
				"message":  result.Message,
				"check_in": result.CheckIn,
			}, nil)
		default:
			errors.ErrorResponse(c, "CHECK_IN_ERROR", map[string]interface{}{
				"message": result.Message,
			}, nil)
		}
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, result, meta)
}

// GetByID gets a check-in by ID
// GET /api/v1/check-ins/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	checkIn, err := h.checkInService.GetByID(id)
	if err != nil {
		if err == checkinservice.ErrCheckInNotFound {
			errors.NotFoundResponse(c, "check-in", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, checkIn, meta)
}

// List lists check-ins with pagination and filters
// GET /api/v1/check-ins
// For staff users: automatically filters by staff_id (only shows their own check-ins)
// For admin users: shows all check-ins (unless staff_id is explicitly provided)
func (h *Handler) List(c *gin.Context) {
	// Get user info from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "User ID not found in context",
		}, nil)
		return
	}

	userIDStr, ok := userID.(string)
	if !ok || userIDStr == "" {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid user ID",
		}, nil)
		return
	}

	// Get user role from context
	userRole, _ := c.Get("user_role")
	userRoleStr, _ := userRole.(string)

	// Check if user is admin (admin or super_admin)
	isAdmin := userRoleStr == "admin" || userRoleStr == "super_admin"

	var req checkin.ListCheckInsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	// For staff users: automatically filter by their staff_id
	// Admin can see all check-ins unless staff_id is explicitly provided
	if !isAdmin && req.StaffID == "" {
		// Staff user: only show their own check-ins
		req.StaffID = userIDStr
	}

	checkIns, pagination, err := h.checkInService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: pagination,
	}
	response.SuccessResponse(c, checkIns, meta)
}

// GetByQRCode gets check-ins by QR code
// GET /api/v1/check-ins/qr/:qr_code
// For staff users: automatically filters by staff_id (only shows their own check-ins)
// For admin users: shows all check-ins for the QR code
func (h *Handler) GetByQRCode(c *gin.Context) {
	// Get user info from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "User ID not found in context",
		}, nil)
		return
	}

	userIDStr, ok := userID.(string)
	if !ok || userIDStr == "" {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid user ID",
		}, nil)
		return
	}

	// Get user role from context
	userRole, _ := c.Get("user_role")
	userRoleStr, _ := userRole.(string)
	isAdmin := userRoleStr == "admin" || userRoleStr == "super_admin"

	qrCode := c.Param("qr_code")
	if qrCode == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "qr_code",
		}, nil)
		return
	}

	checkIns, err := h.checkInService.GetByQRCode(qrCode)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// For staff users: filter to only show their own check-ins
	if !isAdmin {
		filteredCheckIns := make([]*checkin.CheckInResponse, 0)
		for _, ci := range checkIns {
			if ci.StaffID == userIDStr {
				filteredCheckIns = append(filteredCheckIns, ci)
			}
		}
		checkIns = filteredCheckIns
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, checkIns, meta)
}

// GetByOrderItemID gets check-ins by order item ID
// GET /api/v1/check-ins/order-item/:order_item_id
// For staff users: automatically filters by staff_id (only shows their own check-ins)
// For admin users: shows all check-ins for the order item
func (h *Handler) GetByOrderItemID(c *gin.Context) {
	// Get user info from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "User ID not found in context",
		}, nil)
		return
	}

	userIDStr, ok := userID.(string)
	if !ok || userIDStr == "" {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid user ID",
		}, nil)
		return
	}

	// Get user role from context
	userRole, _ := c.Get("user_role")
	userRoleStr, _ := userRole.(string)
	isAdmin := userRoleStr == "admin" || userRoleStr == "super_admin"

	orderItemID := c.Param("order_item_id")
	if orderItemID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "order_item_id",
		}, nil)
		return
	}

	checkIns, err := h.checkInService.GetByOrderItemID(orderItemID)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// For staff users: filter to only show their own check-ins
	if !isAdmin {
		filteredCheckIns := make([]*checkin.CheckInResponse, 0)
		for _, ci := range checkIns {
			if ci.StaffID == userIDStr {
				filteredCheckIns = append(filteredCheckIns, ci)
			}
		}
		checkIns = filteredCheckIns
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, checkIns, meta)
}

// GetByGateID gets check-ins by gate ID
// GET /api/v1/check-ins/gate/:gate_id
// For staff users: automatically filters by staff_id (only shows their own check-ins)
// For admin users: shows all check-ins for the gate
func (h *Handler) GetByGateID(c *gin.Context) {
	// Get user info from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "User ID not found in context",
		}, nil)
		return
	}

	userIDStr, ok := userID.(string)
	if !ok || userIDStr == "" {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid user ID",
		}, nil)
		return
	}

	// Get user role from context
	userRole, _ := c.Get("user_role")
	userRoleStr, _ := userRole.(string)
	isAdmin := userRoleStr == "admin" || userRoleStr == "super_admin"

	gateID := c.Param("gate_id")
	if gateID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "gate_id",
		}, nil)
		return
	}

	checkIns, err := h.checkInService.GetByGateID(gateID)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// For staff users: filter to only show their own check-ins
	if !isAdmin {
		filteredCheckIns := make([]*checkin.CheckInResponse, 0)
		for _, ci := range checkIns {
			if ci.StaffID == userIDStr {
				filteredCheckIns = append(filteredCheckIns, ci)
			}
		}
		checkIns = filteredCheckIns
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, checkIns, meta)
}
