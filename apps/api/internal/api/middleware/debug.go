package middleware

import (
	"net/http/pprof"

	"github.com/gilabs/webapp-ticket-konser/api/internal/config"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func RegisterDebugRoutes(router *gin.Engine) {
	if config.AppConfig == nil || !config.AppConfig.Obs.PprofEnabled {
		return
	}

	debug := router.Group("/debug")
	debug.Use(DebugTokenMiddleware())
	{
		debug.GET("/pprof/", gin.WrapF(pprof.Index))
		debug.GET("/pprof/cmdline", gin.WrapF(pprof.Cmdline))
		debug.GET("/pprof/profile", gin.WrapF(pprof.Profile))
		debug.POST("/pprof/symbol", gin.WrapF(pprof.Symbol))
		debug.GET("/pprof/symbol", gin.WrapF(pprof.Symbol))
		debug.GET("/pprof/trace", gin.WrapF(pprof.Trace))

		debug.GET("/pprof/allocs", gin.WrapH(pprof.Handler("allocs")))
		debug.GET("/pprof/block", gin.WrapH(pprof.Handler("block")))
		debug.GET("/pprof/goroutine", gin.WrapH(pprof.Handler("goroutine")))
		debug.GET("/pprof/heap", gin.WrapH(pprof.Handler("heap")))
		debug.GET("/pprof/mutex", gin.WrapH(pprof.Handler("mutex")))
		debug.GET("/pprof/threadcreate", gin.WrapH(pprof.Handler("threadcreate")))
	}
}

func DebugTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// In production, require a token.
		if config.AppConfig != nil && config.AppConfig.Server.Env == "production" {
			if config.AppConfig.Obs.DebugToken == "" {
				errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
					"message": "Debug endpoints are disabled in production",
				}, nil)
				c.Abort()
				return
			}
		}

		token := ""
		if config.AppConfig != nil {
			token = config.AppConfig.Obs.DebugToken
		}
		if token == "" {
			// If no token is configured (typical dev), allow.
			c.Next()
			return
		}

		if c.GetHeader("X-Debug-Token") != token {
			errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
				"message": "Invalid debug token",
			}, nil)
			c.Abort()
			return
		}

		c.Next()
	}
}

func RegisterMetricsRoute(router *gin.Engine) {
	if config.AppConfig != nil && !config.AppConfig.Obs.MetricsEnabled {
		return
	}

	router.GET("/metrics", gin.WrapH(promhttp.Handler()))
}
