package gate

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/gate"
	gateservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/gate"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	gateService *gateservice.Service
}

func NewHandler(gateService *gateservice.Service) *Handler {
	return &Handler{
		gateService: gateService,
	}
}

// GetByID gets a gate by ID
// GET /api/v1/gates/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	gate, err := h.gateService.GetByID(id)
	if err != nil {
		if err == gateservice.ErrGateNotFound {
			errors.NotFoundResponse(c, "gate", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, gate, meta)
}

// Create creates a new gate
// POST /api/v1/gates
func (h *Handler) Create(c *gin.Context) {
	var req gate.CreateGateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	createdGate, err := h.gateService.Create(&req)
	if err != nil {
		if err == gateservice.ErrGateCodeExists {
			errors.ErrorResponse(c, "CONFLICT", map[string]interface{}{
				"message": "Gate code already exists",
				"code":    req.Code,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponseCreated(c, createdGate, meta)
}

// Update updates a gate
// PUT /api/v1/gates/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req gate.UpdateGateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	updatedGate, err := h.gateService.Update(id, &req)
	if err != nil {
		if err == gateservice.ErrGateNotFound {
			errors.NotFoundResponse(c, "gate", id)
			return
		}
		if err == gateservice.ErrGateCodeExists {
			errors.ErrorResponse(c, "CONFLICT", map[string]interface{}{
				"message": "Gate code already exists",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, updatedGate, meta)
}

// Delete deletes a gate
// DELETE /api/v1/gates/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.gateService.Delete(id)
	if err != nil {
		if err == gateservice.ErrGateNotFound {
			errors.NotFoundResponse(c, "gate", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// List lists gates with pagination and filters
// GET /api/v1/gates
func (h *Handler) List(c *gin.Context) {
	var req gate.ListGatesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	gates, pagination, err := h.gateService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: pagination,
	}
	response.SuccessResponse(c, gates, meta)
}

// AssignTicketToGate assigns a ticket to a gate
// POST /api/v1/gates/:id/assign-ticket
func (h *Handler) AssignTicketToGate(c *gin.Context) {
	gateID := c.Param("id")
	if gateID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req gate.AssignTicketToGateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	// Set gate ID from path parameter
	req.GateID = gateID

	err := h.gateService.AssignTicketToGate(&req)
	if err != nil {
		if err == gateservice.ErrGateNotFound {
			errors.NotFoundResponse(c, "gate", gateID)
			return
		}
		if err == gateservice.ErrGateInactive {
			errors.ErrorResponse(c, "GATE_INACTIVE", map[string]interface{}{
				"message": "Gate is inactive",
			}, nil)
			return
		}
		if err == gateservice.ErrVIPGateRequired {
			errors.ErrorResponse(c, "VIP_GATE_REQUIRED", map[string]interface{}{
				"message": "VIP gate required for this ticket",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, map[string]interface{}{
		"message": "Ticket assigned to gate successfully",
	}, meta)
}

// GateCheckIn performs check-in at a specific gate
// POST /api/v1/gates/:id/check-in
func (h *Handler) GateCheckIn(c *gin.Context) {
	gateID := c.Param("id")
	if gateID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
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

	var req gate.GateCheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	// Set gate ID from path parameter
	req.GateID = gateID

	// Get IP address and user agent
	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	result, err := h.gateService.GateCheckIn(&req, userIDStr, ipAddress, userAgent)
	if err != nil {
		// Handle specific errors
		if err == gateservice.ErrGateNotFound {
			errors.NotFoundResponse(c, "gate", gateID)
			return
		}
		if err == gateservice.ErrGateInactive {
			errors.ErrorResponse(c, "GATE_INACTIVE", map[string]interface{}{
				"message": "Gate is inactive",
			}, nil)
			return
		}
		if err == gateservice.ErrGateCapacityExceeded {
			errors.ErrorResponse(c, "GATE_CAPACITY_EXCEEDED", map[string]interface{}{
				"message": "Gate capacity exceeded",
			}, nil)
			return
		}
		if err == gateservice.ErrVIPGateRequired {
			errors.ErrorResponse(c, "VIP_GATE_REQUIRED", map[string]interface{}{
				"message": "VIP gate required for this ticket",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	if !result.Success {
		// Return error response based on error code
		switch result.ErrorCode {
		case "GATE_NOT_FOUND":
			errors.NotFoundResponse(c, "gate", gateID)
		case "GATE_INACTIVE":
			errors.ErrorResponse(c, "GATE_INACTIVE", map[string]interface{}{
				"message": result.Message,
			}, nil)
		case "GATE_CAPACITY_EXCEEDED":
			errors.ErrorResponse(c, "GATE_CAPACITY_EXCEEDED", map[string]interface{}{
				"message": result.Message,
			}, nil)
		case "VIP_GATE_REQUIRED":
			errors.ErrorResponse(c, "VIP_GATE_REQUIRED", map[string]interface{}{
				"message": result.Message,
			}, nil)
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
				"message": result.Message,
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

// GetStatistics gets gate statistics
// GET /api/v1/gates/:id/statistics
func (h *Handler) GetStatistics(c *gin.Context) {
	gateID := c.Param("id")
	if gateID == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	statistics, err := h.gateService.GetStatistics(gateID)
	if err != nil {
		if err == gateservice.ErrGateNotFound {
			errors.NotFoundResponse(c, "gate", gateID)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, statistics, meta)
}
