package redis

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client

type Config struct {
	Enabled  bool
	Addr     string
	Password string
	DB       int
	Prefix   string

	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

func LoadConfigFromEnv() Config {
	cfg := Config{
		Enabled:      strings.EqualFold(strings.TrimSpace(os.Getenv("REDIS_ENABLED")), "true"),
		Addr:         strings.TrimSpace(os.Getenv("REDIS_ADDR")),
		Password:     os.Getenv("REDIS_PASSWORD"),
		DB:           envInt("REDIS_DB", 0),
		Prefix:       strings.TrimSpace(os.Getenv("REDIS_PREFIX")),
		DialTimeout:  envDuration("REDIS_DIAL_TIMEOUT", 2*time.Second),
		ReadTimeout:  envDuration("REDIS_READ_TIMEOUT", 1*time.Second),
		WriteTimeout: envDuration("REDIS_WRITE_TIMEOUT", 1*time.Second),
	}

	if cfg.Prefix == "" {
		cfg.Prefix = "ticketing_api"
	}

	// Support REDIS_URL=redis://:pass@host:6379/0
	if rawURL := strings.TrimSpace(os.Getenv("REDIS_URL")); rawURL != "" {
		if parsed, err := url.Parse(rawURL); err == nil {
			if parsed.Host != "" {
				cfg.Addr = parsed.Host
			}
			if parsed.User != nil {
				if p, ok := parsed.User.Password(); ok {
					cfg.Password = p
				}
			}
			if parsed.Path != "" {
				if db, err := strconv.Atoi(strings.TrimPrefix(parsed.Path, "/")); err == nil {
					cfg.DB = db
				}
			}
			// If REDIS_URL is set, assume enabled unless explicitly disabled
			if os.Getenv("REDIS_ENABLED") == "" {
				cfg.Enabled = true
			}
		}
	}

	if cfg.Addr == "" {
		cfg.Addr = "localhost:6379"
	}

	return cfg
}

func Connect(ctx context.Context, cfg Config) error {
	if !cfg.Enabled {
		log.Println("Redis disabled")
		Client = nil
		return nil
	}

	Client = redis.NewClient(&redis.Options{
		Addr:         cfg.Addr,
		Password:     cfg.Password,
		DB:           cfg.DB,
		DialTimeout:  cfg.DialTimeout,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
	})

	if err := Client.Ping(ctx).Err(); err != nil {
		Client = nil
		return fmt.Errorf("failed to connect to redis: %w", err)
	}

	log.Printf("Redis connected (%s/%d)", cfg.Addr, cfg.DB)
	return nil
}

func Close() {
	if Client == nil {
		return
	}
	_ = Client.Close()
	Client = nil
}

func Key(prefix string, parts ...string) string {
	clean := make([]string, 0, len(parts)+1)
	clean = append(clean, prefix)
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		clean = append(clean, p)
	}
	return strings.Join(clean, ":")
}

func envInt(key string, defaultValue int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return defaultValue
	}
	parsed, err := strconv.Atoi(v)
	if err != nil {
		return defaultValue
	}
	return parsed
}

func envDuration(key string, defaultValue time.Duration) time.Duration {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return defaultValue
	}
	if d, err := time.ParseDuration(v); err == nil {
		return d
	}
	// Allow seconds as plain integer
	if sec, err := strconv.Atoi(v); err == nil {
		return time.Duration(sec) * time.Second
	}
	return defaultValue
}
