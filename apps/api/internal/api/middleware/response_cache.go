package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/config"
	redisint "github.com/gilabs/webapp-ticket-konser/api/internal/integration/redis"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type CacheConfig struct {
	TTL time.Duration
}

func ResponseCacheMiddleware(cfg CacheConfig) gin.HandlerFunc {
	if cfg.TTL <= 0 {
		cfg.TTL = 10 * time.Second
	}

	return func(c *gin.Context) {
		if c.Request.Method != http.MethodGet {
			c.Next()
			return
		}
		if redisint.Client == nil {
			c.Next()
			return
		}

		prefix := "ticketing_api"
		if config.AppConfig != nil {
			prefix = config.AppConfig.Redis.Prefix
		}

		userScope := "guest"
		if userID, ok := c.Get("user_id"); ok {
			if s, ok := userID.(string); ok && s != "" {
				userScope = "u:" + s
			}
		}

		fullPath := c.FullPath()
		if fullPath == "" {
			fullPath = c.Request.URL.Path
		}

		query := c.Request.URL.RawQuery
		qHash := "noq"
		if strings.TrimSpace(query) != "" {
			qHash = redisint.HashKeySuffix(query)
		}

		key := redisint.Key(prefix, "cache", userScope, c.Request.Method, fullPath, qHash)
		ctx := c.Request.Context()

		// Default headers for cacheable responses (set early so they're actually sent)
		c.Header("X-Cache", "MISS")
		c.Header("Cache-Control", "public, max-age="+strconv.Itoa(int(cfg.TTL.Seconds())))

		vals, err := redisint.Client.HMGet(ctx, key, "status", "body", "ct").Result()
		if err == nil && len(vals) == 3 && vals[0] != nil && vals[1] != nil {
			status := parseInt(vals[0], http.StatusOK)
			body := parseBytes(vals[1])
			ct := parseString(vals[2], "application/json")

			if len(body) > 0 {
				body = refreshStandardEnvelope(c, body)
				c.Header("Content-Type", ct)
				c.Header("X-Cache", "HIT")
				c.Status(status)
				_, _ = c.Writer.Write(body)
				c.Abort()
				return
			}
		}

		// Capture response
		cw := newBodyCaptureWriter(c.Writer)
		c.Writer = cw
		c.Next()

		status := c.Writer.Status()
		if status < 200 || status >= 300 {
			return
		}

		body := cw.BodyBytes()
		if len(body) == 0 {
			return
		}

		ct := c.Writer.Header().Get("Content-Type")
		if ct == "" {
			ct = "application/json"
		}

		storeCache(ctx, key, status, body, ct, cfg.TTL)
	}
}

func storeCache(ctx context.Context, key string, status int, body []byte, contentType string, ttl time.Duration) {
	if redisint.Client == nil {
		return
	}
	pipe := redisint.Client.Pipeline()
	pipe.HSet(ctx, key, "status", status, "body", body, "ct", contentType)
	pipe.Expire(ctx, key, ttl)
	_, _ = pipe.Exec(ctx)
}

func refreshStandardEnvelope(c *gin.Context, body []byte) []byte {
	var apiResp response.APIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return body
	}

	apiResp.Timestamp = time.Now().In(response.GetTimezoneWIB()).Format(time.RFC3339)
	if rid, ok := c.Get("request_id"); ok {
		if s, ok := rid.(string); ok {
			apiResp.RequestID = s
		}
	}

	b, err := json.Marshal(&apiResp)
	if err != nil {
		return body
	}
	return b
}

func parseInt(v interface{}, def int) int {
	switch t := v.(type) {
	case int64:
		return int(t)
	case int:
		return t
	case string:
		if n, err := strconv.Atoi(t); err == nil {
			return n
		}
	case []byte:
		if n, err := strconv.Atoi(string(t)); err == nil {
			return n
		}
	}
	return def
}

func parseString(v interface{}, def string) string {
	switch t := v.(type) {
	case string:
		if t != "" {
			return t
		}
	case []byte:
		if s := string(t); s != "" {
			return s
		}
	}
	return def
}

func parseBytes(v interface{}) []byte {
	switch t := v.(type) {
	case []byte:
		return t
	case string:
		return []byte(t)
	}
	return nil
}
