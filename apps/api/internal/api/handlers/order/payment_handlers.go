package order

import (
	"strings"

	"github.com/gilabs/webapp-ticket-konser/api/internal/integration/midtrans"
	orderservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// InitiatePayment initiates payment for an order (Guest API)
// POST /api/v1/orders/:id/payment
func (h *Handler) InitiatePayment(c *gin.Context) {
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

	// Verify order ownership
	order, err := h.orderService.GetByID(id)
	if err != nil {
		if err == orderservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	if order.UserID != userIDStr {
		errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
			"message": "You do not have permission to access this order",
		}, nil)
		return
	}

	// Parse request body
	var req struct {
		PaymentMethod string `json:"payment_method" binding:"required,oneof=qris"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	// Initiate payment
	paymentResp, err := h.orderService.InitiatePayment(id, req.PaymentMethod)
	if err != nil {
		errMsg := err.Error()
		if errMsg == "order is not unpaid" {
			errors.ErrorResponse(c, "PAYMENT_ALREADY_PROCESSED", map[string]interface{}{
				"message": "Order payment has already been processed",
			}, nil)
			return
		}
		if errMsg == "payment already initiated" {
			errors.ErrorResponse(c, "PAYMENT_ALREADY_INITIATED", map[string]interface{}{
				"message": "Payment has already been initiated for this order. Please check the payment status.",
			}, nil)
			return
		}
		if errMsg == "payment has expired" {
			errors.ErrorResponse(c, "PAYMENT_EXPIRED", map[string]interface{}{
				"message": "Payment has expired",
			}, nil)
			return
		}
		if errMsg == "midtrans server key is not configured" {
			errors.ErrorResponse(c, "PAYMENT_CONFIGURATION_ERROR", map[string]interface{}{
				"message": "Payment gateway is not properly configured. Please contact support.",
			}, nil)
			return
		}
		// Check for Midtrans authentication errors
		if strings.Contains(errMsg, "Unknown Merchant server_key/id") || strings.Contains(errMsg, "401") {
			errors.ErrorResponse(c, "PAYMENT_CONFIGURATION_ERROR", map[string]interface{}{
				"message": "Payment gateway credentials are invalid. Please check MIDTRANS_SERVER_KEY configuration.",
			}, nil)
			return
		}
		// Log error for debugging
		c.Error(err)
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, paymentResp, meta)
}

// CheckPaymentStatus checks payment status for an order (Guest API)
// GET /api/v1/orders/:id/payment-status
func (h *Handler) CheckPaymentStatus(c *gin.Context) {
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

	// Verify order ownership
	order, err := h.orderService.GetByID(id)
	if err != nil {
		if err == orderservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	if order.UserID != userIDStr {
		errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
			"message": "You do not have permission to access this order",
		}, nil)
		return
	}

	// Check payment status
	statusResp, err := h.orderService.CheckPaymentStatus(id)
	if err != nil {
		if err == orderservice.ErrOrderNotFound {
			errors.NotFoundResponse(c, "order", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, statusResp, meta)
}

// HandlePaymentWebhook handles payment webhook from Midtrans
// POST /api/v1/payments/webhook
func (h *Handler) HandlePaymentWebhook(c *gin.Context) {
	var payload midtrans.WebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		errors.InvalidRequestBodyResponse(c)
		return
	}

	// Process webhook
	err := h.orderService.ProcessPaymentWebhook(&payload)
	if err != nil {
		// Log error but return 200 to Midtrans (they will retry)
		// We don't want to expose internal errors to Midtrans
		c.JSON(200, gin.H{"status": "ok"})
		return
	}

	// Return 200 OK to Midtrans
	c.JSON(200, gin.H{"status": "ok"})
}
