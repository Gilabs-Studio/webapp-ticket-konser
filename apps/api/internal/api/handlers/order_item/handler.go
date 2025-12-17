package orderitem

import (
	"errors"

	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	orderitemservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order_item"
	orderrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order"
	apierrors "github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type Handler struct {
	orderItemService *orderitemservice.Service
	orderRepo        orderrepo.Repository
}

func NewHandler(orderItemService *orderitemservice.Service, orderRepo orderrepo.Repository) *Handler {
	return &Handler{
		orderItemService: orderItemService,
		orderRepo:        orderRepo,
	}
}

// GetByID gets an order item (ticket) by ID
// GET /api/v1/admin/tickets/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		apierrors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	ticket, err := h.orderItemService.GetByID(id)
	if err != nil {
		if err == orderitemservice.ErrOrderItemNotFound {
			apierrors.NotFoundResponse(c, "ticket", id)
			return
		}
		apierrors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, ticket, meta)
}

// GetByQRCode gets an order item (ticket) by QR code
// GET /api/v1/admin/tickets/qr/:qr_code
func (h *Handler) GetByQRCode(c *gin.Context) {
	qrCode := c.Param("qr_code")
	if qrCode == "" {
		apierrors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "qr_code",
		}, nil)
		return
	}

	ticket, err := h.orderItemService.GetByQRCode(qrCode)
	if err != nil {
		if err == orderitemservice.ErrOrderItemNotFound {
			apierrors.NotFoundResponse(c, "ticket", qrCode)
			return
		}
		apierrors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, ticket, meta)
}

// GetByOrderID gets all tickets (order items) for an order
// GET /api/v1/admin/order-tickets/order/:order_id
func (h *Handler) GetByOrderID(c *gin.Context) {
	orderID := c.Param("order_id")
	if orderID == "" {
		apierrors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "order_id",
		}, nil)
		return
	}

	tickets, err := h.orderItemService.GetByOrderID(orderID)
	if err != nil {
		apierrors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, tickets, meta)
}

// GenerateTickets generates tickets (order items) for an order
// POST /api/v1/admin/order-tickets/order/:order_id/generate
func (h *Handler) GenerateTickets(c *gin.Context) {
	orderID := c.Param("order_id")
	if orderID == "" {
		apierrors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "order_id",
		}, nil)
		return
	}

	var req orderitem.GenerateTicketsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleValidationError(c, validationErrors)
		} else {
			apierrors.InvalidRequestBodyResponse(c)
		}
		return
	}

	tickets, err := h.orderItemService.GenerateTickets(orderID, req.Categories, req.Quantities)
	if err != nil {
		if err == orderitemservice.ErrOrderNotFound {
			apierrors.NotFoundResponse(c, "order", orderID)
			return
		}
		if err == orderitemservice.ErrOrderNotPaid {
			apierrors.ErrorResponse(c, "ORDER_NOT_PAID", map[string]interface{}{
				"message": "Order must be paid before generating tickets",
			}, nil)
			return
		}
		if err == orderitemservice.ErrTicketsAlreadyGenerated {
			apierrors.ErrorResponse(c, "TICKETS_ALREADY_GENERATED", map[string]interface{}{
				"message": "Tickets have already been generated for this order",
			}, nil)
			return
		}
		apierrors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponseCreated(c, tickets, meta)
}

// Update updates an order item (ticket)
// PUT /api/v1/admin/tickets/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		apierrors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req orderitem.UpdateOrderItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleValidationError(c, validationErrors)
		} else {
			apierrors.InvalidRequestBodyResponse(c)
		}
		return
	}

	ticket, err := h.orderItemService.Update(id, &req)
	if err != nil {
		if err == orderitemservice.ErrOrderItemNotFound {
			apierrors.NotFoundResponse(c, "ticket", id)
			return
		}
		apierrors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, ticket, meta)
}

// Delete deletes an order item (ticket)
// DELETE /api/v1/admin/tickets/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		apierrors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.orderItemService.Delete(id)
	if err != nil {
		if err == orderitemservice.ErrOrderItemNotFound {
			apierrors.NotFoundResponse(c, "ticket", id)
			return
		}
		apierrors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// GetMyOrderTickets gets all tickets (order items) for an order with ownership verification (Guest API)
// GET /api/v1/orders/:id/tickets
func (h *Handler) GetMyOrderTickets(c *gin.Context) {
	orderID := c.Param("id")
	if orderID == "" {
		apierrors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		apierrors.UnauthorizedResponse(c, "user not authenticated")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		apierrors.UnauthorizedResponse(c, "invalid user id")
		return
	}

	// Verify order ownership
	order, err := h.orderRepo.FindByID(orderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			apierrors.NotFoundResponse(c, "order", orderID)
			return
		}
		apierrors.InternalServerErrorResponse(c, "")
		return
	}

	// Verify ownership
	if order.UserID != userIDStr {
		apierrors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
			"message": "You do not have permission to access this order",
		}, nil)
		return
	}

	// Get tickets for the order
	tickets, err := h.orderItemService.GetByOrderID(orderID)
	if err != nil {
		apierrors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, tickets, meta)
}

