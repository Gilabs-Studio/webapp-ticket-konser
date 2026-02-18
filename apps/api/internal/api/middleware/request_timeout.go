package middleware

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
)

// RequestTimeoutMiddleware adds a context timeout to every request.
// If the handler does not complete within the given duration, the request context
// is canceled — which propagates to any DB queries using WithContext().
func RequestTimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}
