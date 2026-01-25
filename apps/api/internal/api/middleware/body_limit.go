package middleware

import (
	"net/http"

	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gin-gonic/gin"
)

// BodySizeLimitMiddleware limits request body size.
//
// It rejects requests with Content-Length > maxBytes (when provided by client),
// and also enforces a hard limit via http.MaxBytesReader.
func BodySizeLimitMiddleware(maxBytes int64) gin.HandlerFunc {
	if maxBytes <= 0 {
		return func(c *gin.Context) { c.Next() }
	}

	return func(c *gin.Context) {
		if c.Request != nil && c.Request.ContentLength > maxBytes {
			errors.ErrorResponse(c, "PAYLOAD_TOO_LARGE", map[string]interface{}{
				"max_body_bytes": maxBytes,
				"content_length": c.Request.ContentLength,
			}, nil)
			c.Abort()
			return
		}

		if c.Request != nil && c.Request.Body != nil {
			c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes)
		}

		c.Next()
	}
}
