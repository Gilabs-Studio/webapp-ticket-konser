package middleware

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/config"
	redisint "github.com/gilabs/webapp-ticket-konser/api/internal/integration/redis"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gin-gonic/gin"
)

type IdempotencyConfig struct {
	TTL time.Duration
}

func IdempotencyMiddleware(cfg IdempotencyConfig) gin.HandlerFunc {
	if cfg.TTL <= 0 {
		cfg.TTL = 10 * time.Minute
	}

	return func(c *gin.Context) {
		if c.Request.Method != http.MethodPost {
			c.Next()
			return
		}

		idemKey := c.GetHeader("Idempotency-Key")
		if idemKey == "" {
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

		actor := c.ClientIP()
		if userID, ok := c.Get("user_id"); ok {
			if s, ok := userID.(string); ok && s != "" {
				actor = "u:" + s
			}
		}

		fullPath := c.FullPath()
		if fullPath == "" {
			fullPath = c.Request.URL.Path
		}

		bodyBytes, _ := io.ReadAll(c.Request.Body)
		c.Request.Body = io.NopCloser(bytes.NewReader(bodyBytes))

		reqHash := hashRequest(c.Request.Method, fullPath, bodyBytes)
		key := redisint.Key(prefix, "idemp", actor, fullPath, idemKey)
		lockKey := key + ":lock"

		ctx := c.Request.Context()

		// Fast path: replay stored response
		if replayed := tryReplayIdempotent(ctx, c, key, reqHash); replayed {
			return
		}

		// Acquire lock to compute response once
		locked, _ := redisint.Client.SetNX(ctx, lockKey, "1", 30*time.Second).Result()
		if !locked {
			// Someone else is processing; poll briefly for completed response
			deadline := time.Now().Add(2 * time.Second)
			for time.Now().Before(deadline) {
				if replayed := tryReplayIdempotent(ctx, c, key, reqHash); replayed {
					return
				}
				time.Sleep(100 * time.Millisecond)
			}
			errors.ErrorResponse(c, "IDEMPOTENCY_IN_PROGRESS", map[string]interface{}{
				"message": "Request with same Idempotency-Key is still in progress",
			}, nil)
			c.Abort()
			return
		}
		defer func() { _ = redisint.Client.Del(ctx, lockKey).Err() }()

		cw := newBodyCaptureWriter(c.Writer)
		c.Writer = cw
		c.Next()

		status := c.Writer.Status()
		body := cw.BodyBytes()
		ct := c.Writer.Header().Get("Content-Type")
		if ct == "" {
			ct = "application/json"
		}

		// Store non-5xx so retries get consistent result
		if status < 500 && len(body) > 0 {
			pipe := redisint.Client.Pipeline()
			pipe.HSet(ctx, key, "req_hash", reqHash, "status", status, "body", body, "ct", ct)
			pipe.Expire(ctx, key, cfg.TTL)
			_, _ = pipe.Exec(ctx)
		}
	}
}

func tryReplayIdempotent(ctx context.Context, c *gin.Context, key string, reqHash string) bool {
	vals, err := redisint.Client.HMGet(ctx, key, "req_hash", "status", "body", "ct").Result()
	if err != nil || len(vals) != 4 || vals[0] == nil || vals[1] == nil || vals[2] == nil {
		return false
	}

	storedHash := parseString(vals[0], "")
	if storedHash != reqHash {
		errors.ErrorResponse(c, "IDEMPOTENCY_KEY_REUSED", map[string]interface{}{
			"message": "Idempotency-Key already used with a different request payload",
		}, nil)
		c.Abort()
		return true
	}

	status := parseInt(vals[1], http.StatusOK)
	body := parseBytes(vals[2])
	ct := parseString(vals[3], "application/json")
	if len(body) == 0 {
		return false
	}

	// refresh request_id/timestamp when it matches standard envelope
	body = refreshStandardEnvelope(c, body)

	c.Header("Content-Type", ct)
	c.Header("X-Idempotent-Replay", "true")
	c.Status(status)
	_, _ = c.Writer.Write(body)
	c.Abort()
	return true
}

func hashRequest(method string, path string, body []byte) string {
	h := sha256.New()
	h.Write([]byte(method))
	h.Write([]byte("\n"))
	h.Write([]byte(path))
	h.Write([]byte("\n"))
	h.Write(body)
	sum := h.Sum(nil)
	return hex.EncodeToString(sum)
}
