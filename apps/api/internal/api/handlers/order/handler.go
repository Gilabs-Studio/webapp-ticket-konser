package order

import (
	"strconv"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
	orderservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	orderService *orderservice.Service
}

func NewHandler(orderService *orderservice.Service) *Handler {
	return &Handler{
		orderService: orderService,
	}
}

// GetByID gets an order by ID
// GET /api/v1/admin/orders/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	order, err := h.orderService.GetByID(id)
	if err != nil {
		if err == orderservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, order, meta)
}

// GetByOrderCode gets an order by order code
// GET /api/v1/admin/orders/code/:order_code
func (h *Handler) GetByOrderCode(c *gin.Context) {
	orderCode := c.Param("order_code")
	if orderCode == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "order_code",
		}, nil)
		return
	}

	order, err := h.orderService.GetByOrderCode(orderCode)
	if err != nil {
		if err == orderservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", orderCode)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, order, meta)
}

// List lists orders with pagination and filters
// GET /api/v1/admin/orders
func (h *Handler) List(c *gin.Context) {
	var req order.ListOrdersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	orders, pagination, err := h.orderService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: pagination,
	}
	response.SuccessResponse(c, orders, meta)
}

// Update updates an order
// PUT /api/v1/admin/orders/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req order.UpdateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	order, err := h.orderService.Update(id, &req)
	if err != nil {
		if err == orderservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, order, meta)
}

// Delete deletes an order
// DELETE /api/v1/admin/orders/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.orderService.Delete(id)
	if err != nil {
		if err == orderservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// GetRecentOrders gets recent orders
// GET /api/v1/admin/orders/recent
func (h *Handler) GetRecentOrders(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit := 10
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
		limit = l
	}

	orders, err := h.orderService.GetRecentOrders(limit)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, orders, meta)
}

// CreateOrder creates a new order (Guest API)
// POST /api/v1/orders
// Supports X-Idempotency-Key header for deduplication (prevents double orders on network retries)
func (h *Handler) CreateOrder(c *gin.Context) {
	// Get user ID from context (set by AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		errors.UnauthorizedResponse(c, "user not authenticated")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.UnauthorizedResponse(c, "invalid user id")
		return
	}

	// Extract idempotency key from header for deduplication
	idempotencyKey := c.GetHeader("X-Idempotency-Key")

	var req order.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	createdOrder, err := h.orderService.CreateOrder(&req, userIDStr, idempotencyKey)
	if err != nil {
		if err == orderservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"message": "User account not found. Please login again.",
			}, nil)
			return
		}
		if err == orderservice.ErrScheduleNotFound {
			errors.ErrorResponse(c, "SCHEDULE_NOT_FOUND", map[string]interface{}{
				"schedule_id": req.ScheduleID,
			}, nil)
			return
		}
		if err == orderservice.ErrTicketCategoryNotFound {
			errors.ErrorResponse(c, "TICKET_CATEGORY_NOT_FOUND", map[string]interface{}{
				"ticket_category_id": req.TicketCategoryID,
			}, nil)
			return
		}
		if err == orderservice.ErrInsufficientQuota {
			errors.ErrorResponse(c, "INSUFFICIENT_QUOTA", map[string]interface{}{
				"requested": req.Quantity,
			}, nil)
			return
		}
		if err == orderservice.ErrInsufficientSeats {
			errors.ErrorResponse(c, "INSUFFICIENT_SEATS", map[string]interface{}{
				"requested": req.Quantity,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponseCreated(c, createdOrder, meta)
}

// GetMyOrder gets an order by ID with ownership verification (Guest API)
// GET /api/v1/orders/:id
func (h *Handler) GetMyOrder(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.UnauthorizedResponse(c, "user not authenticated")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.UnauthorizedResponse(c, "invalid user id")
		return
	}

	order, err := h.orderService.GetByID(id)
	if err != nil {
		if err == orderservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Verify ownership
	if order.UserID != userIDStr {
		errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
			"message": "You do not have permission to access this order",
		}, nil)
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, order, meta)
}

// GetMyOrders lists orders for current user (Guest API)
// GET /api/v1/orders
func (h *Handler) GetMyOrders(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.UnauthorizedResponse(c, "user not authenticated")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.UnauthorizedResponse(c, "invalid user id")
		return
	}

	var req order.ListOrdersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidQueryParamResponse(c)
		}
		return
	}

	// Force filter by current user ID
	req.UserID = userIDStr

	orders, pagination, err := h.orderService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: pagination,
	}
	response.SuccessResponse(c, orders, meta)
}
