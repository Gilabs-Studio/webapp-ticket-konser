package orderitem

import (
	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	orderitemservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order_item"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	orderItemService *orderitemservice.Service
}

func NewHandler(orderItemService *orderitemservice.Service) *Handler {
	return &Handler{
		orderItemService: orderItemService,
	}
}

// GetByID gets an order item (ticket) by ID
// GET /api/v1/admin/tickets/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	ticket, err := h.orderItemService.GetByID(id)
	if err != nil {
		if err == orderitemservice.ErrOrderItemNotFound {
			errors.NotFoundResponse(c, "ticket", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
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
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "qr_code",
		}, nil)
		return
	}

	ticket, err := h.orderItemService.GetByQRCode(qrCode)
	if err != nil {
		if err == orderitemservice.ErrOrderItemNotFound {
			errors.NotFoundResponse(c, "ticket", qrCode)
			return
		}
		errors.InternalServerErrorResponse(c, "")
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
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "order_id",
		}, nil)
		return
	}

	tickets, err := h.orderItemService.GetByOrderID(orderID)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
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
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "order_id",
		}, nil)
		return
	}

	var req orderitem.GenerateTicketsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	tickets, err := h.orderItemService.GenerateTickets(orderID, req.Categories, req.Quantities)
	if err != nil {
		if err == orderitemservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", orderID)
			return
		}
		if err == orderitemservice.ErrOrderNotPaid {
			errors.ErrorResponse(c, "ORDER_NOT_PAID", map[string]interface{}{
				"message": "Order must be paid before generating tickets",
			}, nil)
			return
		}
		if err == orderitemservice.ErrTicketsAlreadyGenerated {
			errors.ErrorResponse(c, "TICKETS_ALREADY_GENERATED", map[string]interface{}{
				"message": "Tickets have already been generated for this order",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
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
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req orderitem.UpdateOrderItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	ticket, err := h.orderItemService.Update(id, &req)
	if err != nil {
		if err == orderitemservice.ErrOrderItemNotFound {
			errors.NotFoundResponse(c, "ticket", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
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
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.orderItemService.Delete(id)
	if err != nil {
		if err == orderitemservice.ErrOrderItemNotFound {
			errors.NotFoundResponse(c, "ticket", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

