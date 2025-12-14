package middleware

import (
	"fmt"
	"sync"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// visitor holds rate limiter and last seen time for each client
type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimitConfig holds configuration for rate limiting
type RateLimitConfig struct {
	// Requests per second
	Rate float64
	// Burst capacity (allows bursts of up to N requests)
	Burst int
	// Cleanup interval for old visitors
	CleanupInterval time.Duration
	// Visitor expiration time (delete visitors not seen for this duration)
	VisitorExpiration time.Duration
}

// DefaultRateLimitConfig returns default rate limit configuration
func DefaultRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		Rate:             10.0,              // 10 requests per second
		Burst:            20,                 // Allow bursts of up to 20 requests
		CleanupInterval:  1 * time.Minute,    // Cleanup every minute
		VisitorExpiration: 5 * time.Minute,    // Delete visitors not seen for 5 minutes
	}
}

// CheckInRateLimitConfig returns rate limit configuration for check-in endpoints
// More restrictive to prevent abuse
func CheckInRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		Rate:             5.0,                // 5 requests per second
		Burst:            10,                  // Allow bursts of up to 10 requests
		CleanupInterval:  1 * time.Minute,    // Cleanup every minute
		VisitorExpiration: 5 * time.Minute,    // Delete visitors not seen for 5 minutes
	}
}

// RateLimitMiddleware creates a rate limiting middleware
func RateLimitMiddleware(config RateLimitConfig) gin.HandlerFunc {
	visitors := make(map[string]*visitor)
	var mu sync.Mutex

	// Background goroutine to clean up old visitors
	go func() {
		for {
			time.Sleep(config.CleanupInterval)
			mu.Lock()
			for ip, v := range visitors {
				if time.Since(v.lastSeen) > config.VisitorExpiration {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		v, exists := visitors[ip]
		if !exists {
			limiter := rate.NewLimiter(rate.Limit(config.Rate), config.Burst)
			visitors[ip] = &visitor{
				limiter:  limiter,
				lastSeen: time.Now(),
			}
			v = visitors[ip]
		}
		v.lastSeen = time.Now()
		mu.Unlock()

		if !v.limiter.Allow() {
			// Calculate reset time (next allowed request time)
			reservation := v.limiter.Reserve()
			resetTime := time.Now().Add(reservation.Delay()).Unix()

			// Set rate limit headers
			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", config.Burst))
			c.Header("X-RateLimit-Remaining", "0")
			c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))

			errors.ErrorResponse(c, "RATE_LIMIT_EXCEEDED", map[string]interface{}{
				"limit":     config.Burst,
				"remaining": 0,
				"reset_at":  time.Unix(resetTime, 0).Format(time.RFC3339),
			}, nil)
			c.Abort()
			return
		}

		// Set rate limit headers for successful requests
		// Note: rate.Limiter doesn't expose remaining directly, so we estimate
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", config.Burst))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(time.Second).Unix()))

		c.Next()
	}
}

// CheckInRateLimitMiddleware creates a rate limiting middleware specifically for check-in endpoints
func CheckInRateLimitMiddleware() gin.HandlerFunc {
	return RateLimitMiddleware(CheckInRateLimitConfig())
}

