package middleware

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/pkg/logger"
	"github.com/gin-gonic/gin"
)

// LoggerMiddleware logs HTTP requests
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Log request
		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		reqID := ""
		if v, ok := c.Get("request_id"); ok {
			if s, ok := v.(string); ok {
				reqID = s
			}
		}

		if raw != "" {
			path = path + "?" + raw
		}

		logger.Logger.Printf(
			"[%d] %s %s %s %s req_id=%s",
			statusCode,
			method,
			path,
			clientIP,
			latency,
			reqID,
		)
	}
}
