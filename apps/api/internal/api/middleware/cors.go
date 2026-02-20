package middleware

import (
	"os"
	"strings"

	configpkg "github.com/gilabs/webapp-ticket-konser/api/internal/config"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORSMiddleware sets up CORS configuration
func CORSMiddleware() gin.HandlerFunc {
	corsCfg := cors.DefaultConfig()

	env := "development"
	if appCfg := configpkg.AppConfig; appCfg != nil {
		env = appCfg.Server.Env
	}

	if env == "production" {
		// Comma-separated list, e.g. "https://app.example.com,https://admin.example.com"
		originsRaw := strings.TrimSpace(os.Getenv("CORS_ALLOW_ORIGINS"))
		if originsRaw != "" {
			parts := strings.Split(originsRaw, ",")
			origins := make([]string, 0, len(parts))
			for _, p := range parts {
				v := strings.TrimSpace(p)
				if v != "" {
					origins = append(origins, v)
				}
			}
			corsCfg.AllowOrigins = origins
		} else {
			// CORS_ALLOW_ORIGINS is not set — fall back to allowing all origins.
			// To lock down CORS, set CORS_ALLOW_ORIGINS to a comma-separated list
			// of allowed origins (e.g. "https://app.example.com,https://admin.example.com").
			corsCfg.AllowAllOrigins = true
		}
	} else {
		// In development, allow all origins to facilitate testing from mobile devices
		// and local network IPs without triggering CORS issues.
		corsCfg.AllowAllOrigins = true
	}
	corsCfg.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsCfg.AllowHeaders = []string{
		"Origin",
		"Content-Type",
		"Content-Length",
		"Accept-Encoding",
		"X-CSRF-Token",
		"Authorization",
		"Accept",
		"X-Requested-With",
		"X-Request-ID",
	}
	corsCfg.AllowCredentials = true
	corsCfg.ExposeHeaders = []string{"X-Request-ID"}

	return cors.New(corsCfg)
}
