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


