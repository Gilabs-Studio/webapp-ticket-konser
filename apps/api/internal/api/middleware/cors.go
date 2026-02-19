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

	defaultDevOrigins := []string{
		"http://localhost:3000",
		"http://localhost:3001",
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
			// Safe default: do not allow cross-origin in production unless explicitly configured.
			corsCfg.AllowOrigins = []string{}
		}
	} else {
		corsCfg.AllowOrigins = defaultDevOrigins
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
