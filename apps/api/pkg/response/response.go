package response

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Timezone WIB (UTC+7)
var timezoneWIB = time.FixedZone("WIB", 7*60*60)

// GetTimezoneWIB returns WIB timezone
func GetTimezoneWIB() *time.Location {
	return timezoneWIB
}


// APIResponse represents the standard API response structure
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     *APIError   `json:"error,omitempty"`
	Meta      *Meta       `json:"meta,omitempty"`
	Timestamp string      `json:"timestamp"`
	RequestID string      `json:"request_id"`
}

// APIError represents error information
type APIError struct {
	Code        string                 `json:"code"`
	Message     string                 `json:"message"`
	Details     map[string]interface{} `json:"details,omitempty"`
	FieldErrors []FieldError           `json:"field_errors,omitempty"`
	StackTrace  string                 `json:"stack_trace,omitempty"` // Only in dev/staging
}

// FieldError represents validation error for a specific field
type FieldError struct {
	Field      string                 `json:"field"`
	Code       string                 `json:"code"`
	Message    string                 `json:"message"`
	Constraint map[string]interface{} `json:"constraint,omitempty"`
}

// Meta represents metadata in response
type Meta struct {
	Pagination *PaginationMeta        `json:"pagination,omitempty"`
	Filters    map[string]interface{} `json:"filters,omitempty"`
	Sort       *SortMeta              `json:"sort,omitempty"`
	TenantID   string                 `json:"tenant_id,omitempty"`
	OutletID   string                 `json:"outlet_id,omitempty"`
	CreatedBy  string                 `json:"created_by,omitempty"`
	UpdatedBy  string                 `json:"updated_by,omitempty"`
	DeletedBy  string                 `json:"deleted_by,omitempty"`
	Changes    map[string]ChangeValue `json:"changes,omitempty"`
	Additional map[string]interface{} `json:"additional,omitempty"`
}

// ChangeValue represents old and new value for audit
type ChangeValue struct {
	Old interface{} `json:"old"`
	New interface{} `json:"new"`
}

// PaginationMeta represents pagination information
type PaginationMeta struct {
	Page       int  `json:"page"`
	PerPage    int  `json:"per_page"`
	Total      int  `json:"total"`
	TotalPages int  `json:"total_pages"`
	HasNext    bool `json:"has_next"`
	HasPrev    bool `json:"has_prev"`
	NextPage   *int `json:"next_page,omitempty"`
	PrevPage   *int `json:"prev_page,omitempty"`
}

// SortMeta represents sorting information
type SortMeta struct {
	Field string `json:"field"`
	Order string `json:"order"` // "asc" or "desc"
}

// SuccessResponse creates a success response
func SuccessResponse(c *gin.Context, data interface{}, meta *Meta) {
	response := &APIResponse{
		Success:   true,
		Data:      data,
		Meta:      meta,
		Timestamp: time.Now().In(timezoneWIB).Format(time.RFC3339),
		RequestID: getRequestID(c),
	}

	c.JSON(http.StatusOK, response)
}

// SuccessResponseCreated creates a success response for created resource
func SuccessResponseCreated(c *gin.Context, data interface{}, meta *Meta) {
	response := &APIResponse{
		Success:   true,
		Data:      data,
		Meta:      meta,
		Timestamp: time.Now().In(timezoneWIB).Format(time.RFC3339),
		RequestID: getRequestID(c),
	}

	c.JSON(http.StatusCreated, response)
}

// SuccessResponseNoContent creates a success response with no content
func SuccessResponseNoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// getRequestID extracts request ID from context or generates new one
func getRequestID(c *gin.Context) string {
	if requestID, exists := c.Get("request_id"); exists {
		if id, ok := requestID.(string); ok {
			return id
		}
	}
	// Generate new request ID if not exists
	return generateRequestID()
}

// generateRequestID generates a unique request ID
func generateRequestID() string {
	// Simple implementation - in production use UUID
	return "req_" + time.Now().Format("20060102150405") + "_" + randomString(8)
}

// randomString generates random string (simple implementation)
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}

// NewPaginationMeta creates pagination metadata
func NewPaginationMeta(page, perPage, total int) *PaginationMeta {
	totalPages := (total + perPage - 1) / perPage
	hasNext := page < totalPages
	hasPrev := page > 1

	var nextPage *int
	var prevPage *int

	if hasNext {
		next := page + 1
		nextPage = &next
	}

	if hasPrev {
		prev := page - 1
		prevPage = &prev
	}

	return &PaginationMeta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    hasNext,
		HasPrev:    hasPrev,
		NextPage:   nextPage,
		PrevPage:   prevPage,
	}
}

