package errors

import (
	"net/http"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

const (
	ErrorCodeInvalidRequestBody = "INVALID_REQUEST_BODY"
)

// ErrorInfo contains HTTP status and default message for error codes
type ErrorInfo struct {
	HTTPStatus int
	Message    string
}

// ErrorCodeMap maps error codes to their HTTP status and messages
var ErrorCodeMap = map[string]ErrorInfo{
	// Validation Errors
	"VALIDATION_ERROR": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Invalid request data",
	},
	"REQUIRED": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Field is required",
	},
	"INVALID_TYPE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Invalid data type",
	},
	"INVALID_FORMAT": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Invalid format",
	},
	"INVALID_EMAIL": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Invalid email format",
	},
	"MIN_VALUE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Value is less than minimum",
	},
	"MAX_VALUE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Value exceeds maximum",
	},

	// Authentication & Authorization
	"UNAUTHORIZED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Authentication token is invalid or expired",
	},
	"INVALID_CREDENTIALS": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Invalid email or password",
	},
	"TOKEN_EXPIRED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Token has expired",
	},
	"TOKEN_INVALID": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Invalid token",
	},
	"TOKEN_MISSING": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Token not found in header",
	},
	"ACCOUNT_DISABLED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Account is disabled",
	},
	"USER_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "User not found",
	},
	"REFRESH_TOKEN_INVALID": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Invalid refresh token",
	},
	"FORBIDDEN": {
		HTTPStatus: http.StatusForbidden,
		Message:    "You do not have permission to access this resource",
	},

	// Resource Errors
	"NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Resource not found",
	},
	"PRODUCT_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Product not found",
	},
	"CATEGORY_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Category not found",
	},
	"SCHEDULE_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Schedule not found",
	},
	"TICKET_CATEGORY_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Ticket category not found",
	},
	"INSUFFICIENT_QUOTA": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Insufficient quota available",
	},
	"INSUFFICIENT_SEATS": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Insufficient remaining seats",
	},
	"PAYMENT_ALREADY_PROCESSED": {
		HTTPStatus: http.StatusConflict,
		Message:    "Payment has already been processed",
	},
	"PAYMENT_EXPIRED": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Payment has expired",
	},
	"CONFLICT": {
		HTTPStatus: http.StatusConflict,
		Message:    "Conflict with current state",
	},

	// System Errors
	"INTERNAL_SERVER_ERROR": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "An internal server error occurred. Our team has been notified",
	},
	"RATE_LIMIT_EXCEEDED": {
		HTTPStatus: http.StatusTooManyRequests,
		Message:    "Too many requests. Please try again later",
	},
	"SERVICE_UNAVAILABLE": {
		HTTPStatus: http.StatusServiceUnavailable,
		Message:    "Service is under maintenance. Please try again later",
	},
	"INVALID_REQUEST_BODY": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Invalid request body",
	},
	"INVALID_QUERY_PARAM": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Invalid query parameter",
	},
	"INVALID_PATH_PARAM": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Invalid path parameter",
	},

	// AI Service Errors
	"AI_ANALYSIS_FAILED": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Failed to analyze visit report with AI",
	},
	"AI_CHAT_FAILED": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Failed to get AI chat response",
	},
	"AI_SERVICE_NOT_CONFIGURED": {
		HTTPStatus: http.StatusServiceUnavailable,
		Message:    "AI service is not configured. Please configure Cerebras API key",
	},
}

// ErrorResponse creates an error response
func ErrorResponse(c *gin.Context, code string, details map[string]interface{}, fieldErrors []response.FieldError) {
	errorInfo, exists := ErrorCodeMap[code]
	if !exists {
		errorInfo = ErrorCodeMap["INTERNAL_SERVER_ERROR"]
		code = "INTERNAL_SERVER_ERROR"
	}

	apiError := &response.APIError{
		Code:        code,
		Message:     errorInfo.Message,
		Details:     details,
		FieldErrors: fieldErrors,
	}

	apiResponse := &response.APIResponse{
		Success:   false,
		Error:     apiError,
		Timestamp: time.Now().In(response.GetTimezoneWIB()).Format(time.RFC3339),
		RequestID: getRequestID(c),
	}

	c.JSON(errorInfo.HTTPStatus, apiResponse)
}

// ValidationErrorResponse creates a validation error response
func ValidationErrorResponse(c *gin.Context, fieldErrors []response.FieldError) {
	ErrorResponse(c, "VALIDATION_ERROR", nil, fieldErrors)
}

// NotFoundResponse creates a not found error response
func NotFoundResponse(c *gin.Context, resource string, resourceID string) {
	details := map[string]interface{}{
		"resource":    resource,
		"resource_id": resourceID,
	}
	ErrorResponse(c, "NOT_FOUND", details, nil)
}

// UnauthorizedResponse creates an unauthorized error response
func UnauthorizedResponse(c *gin.Context, reason string) {
	details := map[string]interface{}{}
	if reason != "" {
		details["reason"] = reason
	}
	ErrorResponse(c, "UNAUTHORIZED", details, nil)
}

// ForbiddenResponse creates a forbidden error response
func ForbiddenResponse(c *gin.Context, requiredPermission string, userPermissions []string) {
	details := map[string]interface{}{
		"required_permission": requiredPermission,
		"user_permissions":    userPermissions,
	}
	ErrorResponse(c, "FORBIDDEN", details, nil)
}

// InternalServerErrorResponse creates an internal server error response
func InternalServerErrorResponse(c *gin.Context, errorID string) {
	details := map[string]interface{}{
		"error_id": errorID,
	}
	ErrorResponse(c, "INTERNAL_SERVER_ERROR", details, nil)
}

// HandleValidationError converts validator errors to FieldError slice
func HandleValidationError(c *gin.Context, err error) {
	var fieldErrors []response.FieldError

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fieldError := range validationErrors {
			errorInfo := getFieldErrorInfo(fieldError.Tag())
			fieldErr := response.FieldError{
				Field:   fieldError.Field(),
				Code:    fieldError.Tag(),
				Message: errorInfo.Message,
			}
			fieldErrors = append(fieldErrors, fieldErr)
		}
	}

	ValidationErrorResponse(c, fieldErrors)
}

// HandleDatabaseError converts database errors to appropriate API errors
func HandleDatabaseError(c *gin.Context, err error) {
	if err == gorm.ErrRecordNotFound {
		NotFoundResponse(c, "resource", "")
		return
	}
	InternalServerErrorResponse(c, "")
}

// getFieldErrorInfo returns error info for validation tag
func getFieldErrorInfo(tag string) ErrorInfo {
	switch tag {
	case "required":
		return ErrorCodeMap["REQUIRED"]
	case "email":
		return ErrorCodeMap["INVALID_EMAIL"]
	case "min", "gte":
		return ErrorCodeMap["MIN_VALUE"]
	case "max", "lte":
		return ErrorCodeMap["MAX_VALUE"]
	default:
		return ErrorCodeMap["INVALID_FORMAT"]
	}
}

// getRequestID extracts request ID from context
func getRequestID(c *gin.Context) string {
	if requestID, exists := c.Get("request_id"); exists {
		if id, ok := requestID.(string); ok {
			return id
		}
	}
	return "req_" + time.Now().Format("20060102150405")
}

// InvalidRequestBodyResponse creates an invalid request body error response
func InvalidRequestBodyResponse(c *gin.Context) {
	ErrorResponse(c, "INVALID_REQUEST_BODY", nil, nil)
}

// InvalidQueryParamResponse creates an invalid query parameter error response
func InvalidQueryParamResponse(c *gin.Context) {
	ErrorResponse(c, "INVALID_QUERY_PARAM", nil, nil)
}
