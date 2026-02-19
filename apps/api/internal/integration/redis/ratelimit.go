package redis

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

// Token bucket implemented via Redis Lua script.
// Stores two fields in a hash: "tokens" (float) and "ts" (ms).
// Returns: allowed (0/1), remaining_tokens (float), reset_unix (seconds).
var tokenBucketScript = redis.NewScript(`
local key = KEYS[1]
local rate = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local ttl_ms = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1])
local ts = tonumber(data[2])

if tokens == nil then tokens = capacity end
if ts == nil then ts = now_ms end

if now_ms < ts then ts = now_ms end

local delta = now_ms - ts
local refill = (delta * rate) / 1000.0

tokens = math.min(capacity, tokens + refill)
local allowed = 0
if tokens >= 1.0 then
  allowed = 1
  tokens = tokens - 1.0
end

redis.call('HMSET', key, 'tokens', tokens, 'ts', now_ms)
redis.call('PEXPIRE', key, ttl_ms)

local reset_s = 0
if allowed == 1 then
  reset_s = math.floor((now_ms + 1000) / 1000)
else
  if rate <= 0 then
    reset_s = math.floor((now_ms + ttl_ms) / 1000)
  else
    local missing = 1.0 - tokens
    local wait_ms = math.ceil((missing * 1000.0) / rate)
    reset_s = math.floor((now_ms + wait_ms) / 1000)
  end
end

return {allowed, tokens, reset_s}
`)

type RateLimitResult struct {
	Allowed   bool
	Remaining float64
	ResetUnix int64
}

func AllowTokenBucket(ctx context.Context, key string, rate float64, burst int) (RateLimitResult, error) {
	if Client == nil {
		return RateLimitResult{Allowed: true}, nil
	}
	if burst <= 0 {
		burst = 1
	}
	if rate <= 0 {
		rate = 1
	}

	now := time.Now()
	nowMs := now.UnixMilli()
	// TTL long enough so idle keys disappear, but short enough to avoid growth.
	ttl := int64(10 * time.Minute / time.Millisecond)

	res, err := tokenBucketScript.Run(ctx, Client, []string{key}, rate, burst, nowMs, ttl).Result()
	if err != nil {
		return RateLimitResult{}, fmt.Errorf("redis ratelimit eval failed: %w", err)
	}

	arr, ok := res.([]interface{})
	if !ok || len(arr) != 3 {
		return RateLimitResult{}, fmt.Errorf("unexpected ratelimit result")
	}

	allowed := toInt64(arr[0]) == 1
	remaining := toFloat64(arr[1])
	resetUnix := toInt64(arr[2])

	return RateLimitResult{Allowed: allowed, Remaining: remaining, ResetUnix: resetUnix}, nil
}

// HashKeySuffix makes a compact suffix when key parts could be long (query strings, etc).
func HashKeySuffix(s string) string {
	h := sha1.Sum([]byte(s))
	return hex.EncodeToString(h[:])
}

func toInt64(v interface{}) int64 {
	switch t := v.(type) {
	case int64:
		return t
	case int:
		return int64(t)
	case float64:
		return int64(t)
	case string:
		parsed, _ := strconv.ParseInt(t, 10, 64)
		return parsed
	case []byte:
		parsed, _ := strconv.ParseInt(string(t), 10, 64)
		return parsed
	default:
		return 0
	}
}

func toFloat64(v interface{}) float64 {
	switch t := v.(type) {
	case float64:
		return t
	case int64:
		return float64(t)
	case int:
		return float64(t)
	case string:
		parsed, _ := strconv.ParseFloat(t, 64)
		return parsed
	case []byte:
		parsed, _ := strconv.ParseFloat(string(t), 64)
		return parsed
	default:
		return 0
	}
}
