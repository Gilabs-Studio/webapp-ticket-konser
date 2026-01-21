package event

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	eventservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/event"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/upload"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	eventService *eventservice.Service
}

func NewHandler(eventService *eventservice.Service) *Handler {
	return &Handler{
		eventService: eventService,
	}
}

// GetByID gets an event by ID
// GET /api/v1/admin/events/:id
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	event, err := h.eventService.GetByID(id)
	if err != nil {
		if err == eventservice.ErrEventNotFound {
			errors.NotFoundResponse(c, "event", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, event, meta)
}

// Create creates a new event
// POST /api/v1/admin/events
func (h *Handler) Create(c *gin.Context) {
	var req event.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	event, err := h.eventService.Create(&req)
	if err != nil {
		if err == eventservice.ErrEventAlreadyExists {
			errors.ErrorResponse(c, "CONFLICT", map[string]interface{}{
				"reason":     "Event name already exists",
				"event_name": req.EventName,
			}, nil)
			return
		}
		if err == eventservice.ErrInvalidDateRange {
			errors.ErrorResponse(c, "VALIDATION_ERROR", map[string]interface{}{
				"reason": "End date must be after start date",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponseCreated(c, event, meta)
}

// Update updates an event
// PUT /api/v1/admin/events/:id
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req event.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	event, err := h.eventService.Update(id, &req)
	if err != nil {
		if err == eventservice.ErrEventNotFound {
			errors.NotFoundResponse(c, "event", id)
			return
		}
		if err == eventservice.ErrEventAlreadyExists {
			errors.ErrorResponse(c, "CONFLICT", map[string]interface{}{
				"reason": "Event name already exists",
			}, nil)
			return
		}
		if err == eventservice.ErrInvalidDateRange {
			errors.ErrorResponse(c, "VALIDATION_ERROR", map[string]interface{}{
				"reason": "End date must be after start date",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, event, meta)
}

// Delete deletes an event
// DELETE /api/v1/admin/events/:id
func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	err := h.eventService.Delete(id)
	if err != nil {
		if err == eventservice.ErrEventNotFound {
			errors.NotFoundResponse(c, "event", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// List lists all events with pagination and filters
// GET /api/v1/admin/events
func (h *Handler) List(c *gin.Context) {
	var req event.ListEventRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		errors.InvalidQueryParamResponse(c)
		return
	}

	events, _, paginationMeta, err := h.eventService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: paginationMeta,
		Filters: map[string]interface{}{
			"search": req.Search,
			"status": req.Status,
		},
	}

	response.SuccessResponse(c, events, meta)
}

// UpdateStatus updates event status
// PATCH /api/v1/admin/events/:id/status
func (h *Handler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	var req event.UpdateEventStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
		} else {
			errors.InvalidRequestBodyResponse(c)
		}
		return
	}

	event, err := h.eventService.UpdateStatus(id, req.Status)
	if err != nil {
		if err == eventservice.ErrEventNotFound {
			errors.NotFoundResponse(c, "event", id)
			return
		}
		if err == eventservice.ErrInvalidStatus {
			errors.ErrorResponse(c, "VALIDATION_ERROR", map[string]interface{}{
				"reason": "Invalid event status. Must be one of: draft, published, closed",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, event, meta)
}

// UploadBanner uploads banner image for event
// POST /api/v1/admin/events/:id/banner
func (h *Handler) UploadBanner(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	// Get file from form data
	file, err := c.FormFile("banner")
	if err != nil {
		errors.ErrorResponse(c, "VALIDATION_ERROR", map[string]interface{}{
			"reason": "Banner image file is required",
			"field":  "banner",
		}, nil)
		return
	}

	// Validate file type
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/webp": true,
	}

	fileHeader, err := file.Open()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}
	defer fileHeader.Close()

	buffer := make([]byte, 512)
	_, err = fileHeader.Read(buffer)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	contentType := http.DetectContentType(buffer)
	if !allowedTypes[contentType] {
		errors.ErrorResponse(c, "VALIDATION_ERROR", map[string]interface{}{
			"reason": "Invalid file type. Only JPEG, PNG, and WebP images are allowed",
			"field":  "banner",
		}, nil)
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		errors.ErrorResponse(c, "VALIDATION_ERROR", map[string]interface{}{
			"reason": "File size exceeds maximum limit of 5MB",
			"field":  "banner",
		}, nil)
		return
	}

	// For now, we'll save the file and return the URL
	// In production, you should upload to cloud storage (S3, Cloudinary, etc.)
	// For MVP, we'll save to local storage and return relative path
	uploadDir := "./uploads/events"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Generate server-controlled filename (do not use client-provided file.Filename)
	filename, err := upload.GenerateImageFilename(contentType)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}
	dstPath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveUploadedFile(file, dstPath); err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Generate URL (in production, this should be absolute URL from cloud storage)
	bannerURL := fmt.Sprintf("/uploads/events/%s", filename)

	// Update event banner image
	event, err := h.eventService.UpdateBannerImage(id, bannerURL)
	if err != nil {
		// Clean up uploaded file if update fails
		os.Remove(dstPath)
		if err == eventservice.ErrEventNotFound {
			errors.NotFoundResponse(c, "event", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, event, meta)
}

// ListPublic lists only published events
// GET /api/v1/events
func (h *Handler) ListPublic(c *gin.Context) {
	var req event.ListEventRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		errors.InvalidQueryParamResponse(c)
		return
	}

	// Force status to published for public routes
	req.Status = event.EventStatusPublished

	events, _, paginationMeta, err := h.eventService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: paginationMeta,
		Filters: map[string]interface{}{
			"search": req.Search,
			"status": "published",
		},
	}

	response.SuccessResponse(c, events, meta)
}

// GetByIDPublic gets a published event by ID (public route)
// GET /api/v1/events/:id
func (h *Handler) GetByIDPublic(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		errors.ErrorResponse(c, "INVALID_PATH_PARAM", map[string]interface{}{
			"param": "id",
		}, nil)
		return
	}

	eventResp, err := h.eventService.GetByID(id)
	if err != nil {
		if err == eventservice.ErrEventNotFound {
			errors.NotFoundResponse(c, "event", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Check if event is published
	if eventResp.Status != event.EventStatusPublished {
		errors.NotFoundResponse(c, "event", id)
		return
	}

	meta := &response.Meta{}
	response.SuccessResponse(c, eventResp, meta)
}
