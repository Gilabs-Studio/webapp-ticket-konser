package middleware

import (
	"net"
	"strings"

	"github.com/gilabs/webapp-ticket-konser/api/internal/config"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gin-gonic/gin"
)

// MidtransIPWhitelist restricts webhook access to known Midtrans IP ranges.
//
// Production Midtrans IPs (Core API):
//   - 103.208.0.0/22
//   - 34.101.64.0/18 (GCP-based infra)
//
// In development / sandbox mode the check is skipped via config so local testing is not blocked.
func MidtransIPWhitelist() gin.HandlerFunc {
	// Midtrans published source IPs (update periodically from Midtrans docs)
	cidrs := []string{
		"103.208.0.0/22",
		"34.101.64.0/18",
	}

	// Parse once at startup
	allowedNets := make([]*net.IPNet, 0, len(cidrs))
	for _, cidr := range cidrs {
		_, ipNet, err := net.ParseCIDR(cidr)
		if err == nil {
			allowedNets = append(allowedNets, ipNet)
		}
	}

	return func(c *gin.Context) {
		// Skip IP check in sandbox/development mode so local testing works
		if config.AppConfig != nil && config.AppConfig.Midtrans.APIBaseURL != "" {
			if strings.Contains(config.AppConfig.Midtrans.APIBaseURL, "sandbox") {
				c.Next()
				return
			}
		}

		clientIP := net.ParseIP(c.ClientIP())
		if clientIP == nil {
			errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
				"message": "Invalid IP address",
			}, nil)
			c.Abort()
			return
		}

		// Allow loopback for local development
		if clientIP.IsLoopback() {
			c.Next()
			return
		}

		for _, network := range allowedNets {
			if network.Contains(clientIP) {
				c.Next()
				return
			}
		}

		// IP not in whitelist
		errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
			"message": "Request origin not allowed",
		}, nil)
		c.Abort()
	}
}
