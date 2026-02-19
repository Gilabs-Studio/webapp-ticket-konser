package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeadersMiddleware adds safe, broadly compatible security headers.
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("Referrer-Policy", "no-referrer")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")

		// HSTS — only effective over HTTPS in production
		c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")

		c.Next()
	}
}
