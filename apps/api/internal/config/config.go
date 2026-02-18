package config

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Redis    RedisConfig
	Obs      ObservabilityConfig
	Cerebras CerebrasConfig
	Midtrans MidtransConfig
}

type ServerConfig struct {
	Port string
	Env  string

	// Request/transport hardening
	// MaxBodyBytes limits the size of incoming request bodies.
	// MaxHeaderBytes limits the size of request headers at the HTTP server level.
	MaxBodyBytes   int64
	MaxHeaderBytes int

	// MaxMultipartMemoryBytes controls how much of a multipart form is kept in memory
	// before being stored in a temporary file.
	MaxMultipartMemoryBytes int64

	// RequestTimeout is applied as a per-request context deadline.
	RequestTimeout time.Duration
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	SecretKey       string
	AccessTokenTTL  int // in hours
	RefreshTokenTTL int // in days
}

type CerebrasConfig struct {
	BaseURL string
	APIKey  string
	Model   string // Default model name
}

type MidtransConfig struct {
	ServerKey    string
	ClientKey    string
	MerchantID   string
	IsProduction bool
	APIBaseURL   string // https://api.midtrans.com (production) atau https://api.sandbox.midtrans.com (sandbox)
}

type RedisConfig struct {
	Enabled  bool
	URL      string
	Addr     string
	Password string
	DB       int
	Prefix   string

	DialTimeout  string
	ReadTimeout  string
	WriteTimeout string
}

type ObservabilityConfig struct {
	MetricsEnabled bool
	MetricsToken   string
	PprofEnabled   bool
	DebugToken     string
}

var AppConfig *Config

func Load() error {
	// Load .env file if exists (for local development)
	_ = godotenv.Load()

	env := getEnv("ENV", "development")
	defaultJWTSecret := "your-secret-key-change-in-production"

	// Read JWT secret from file if JWT_SECRET_FILE is set (Docker secrets)
	jwtSecret := getEnv("JWT_SECRET", "")
	if jwtSecret == "" {
		if secretFile := os.Getenv("JWT_SECRET_FILE"); secretFile != "" {
			if data, err := os.ReadFile(secretFile); err == nil {
				jwtSecret = strings.TrimSpace(string(data))
			} else {
				log.Printf("WARNING: Failed to read JWT_SECRET_FILE %s: %v", secretFile, err)
			}
		}
	}
	if jwtSecret == "" {
		jwtSecret = defaultJWTSecret
	}

	// Fail-fast in production if JWT secret is not properly set
	if env == "production" {
		if jwtSecret == "" || jwtSecret == defaultJWTSecret {
			return fmt.Errorf("JWT_SECRET must be set in production (do not use default)")
		}
		if len(jwtSecret) < 32 {
			return fmt.Errorf("JWT_SECRET must be at least 32 characters in production")
		}
	}

	// Validate JWT secret length (minimum 32 characters for security)
	if len(jwtSecret) < 32 {
		log.Printf("WARNING: JWT_SECRET is less than 32 characters. This is insecure for production!")
	}

	// Read DB credentials from file if set (Docker secrets)
	dbUser := getEnv("DB_USER", "")
	if dbUser == "" {
		if userFile := os.Getenv("DB_USER_FILE"); userFile != "" {
			if data, err := os.ReadFile(userFile); err == nil {
				dbUser = strings.TrimSpace(string(data))
			} else {
				log.Printf("WARNING: Failed to read DB_USER_FILE %s: %v", userFile, err)
			}
		}
	}
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPassword := getEnv("DB_PASSWORD", "")
	if dbPassword == "" {
		if passwordFile := os.Getenv("DB_PASSWORD_FILE"); passwordFile != "" {
			if data, err := os.ReadFile(passwordFile); err == nil {
				dbPassword = strings.TrimSpace(string(data))
			} else {
				log.Printf("WARNING: Failed to read DB_PASSWORD_FILE %s: %v", passwordFile, err)
			}
		}
	}
	if dbPassword == "" {
		dbPassword = "postgres"
	}

	AppConfig = &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8083"),
			Env:  env,
			MaxBodyBytes:           getEnvAsInt64("MAX_BODY_BYTES", 10*1024*1024),
			MaxHeaderBytes:         getEnvAsInt("MAX_HEADER_BYTES", 1*1024*1024),
			MaxMultipartMemoryBytes: getEnvAsInt64("MAX_MULTIPART_MEMORY_BYTES", 10*1024*1024),
			RequestTimeout:         getEnvAsDuration("REQUEST_TIMEOUT", 25*time.Second),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     dbUser,
			Password: dbPassword,
			DBName:   getEnv("DB_NAME", "ticketing_app"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			SecretKey:       jwtSecret,
			AccessTokenTTL:  getEnvAsInt("JWT_ACCESS_TTL", 24), // 24 hours
			RefreshTokenTTL: getEnvAsInt("JWT_REFRESH_TTL", 7), // 7 days
		},
		Redis: RedisConfig{
			Enabled:  getEnv("REDIS_ENABLED", "false") == "true",
			URL:      getEnv("REDIS_URL", ""),
			Addr:     getEnv("REDIS_ADDR", "localhost:6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
			Prefix:   getEnv("REDIS_PREFIX", "ticketing_api"),

			DialTimeout:  getEnv("REDIS_DIAL_TIMEOUT", "2s"),
			ReadTimeout:  getEnv("REDIS_READ_TIMEOUT", "1s"),
			WriteTimeout: getEnv("REDIS_WRITE_TIMEOUT", "1s"),
		},
		Obs: ObservabilityConfig{
			MetricsEnabled: getEnv("METRICS_ENABLED", "true") == "true",
			MetricsToken:   getEnv("METRICS_TOKEN", ""),
			PprofEnabled:   getEnv("PPROF_ENABLED", "false") == "true",
			DebugToken:     getEnv("DEBUG_TOKEN", ""),
		},
		Cerebras: CerebrasConfig{
			BaseURL: getEnv("CEREBRAS_BASE_URL", "https://api.cerebras.ai"),
			APIKey:  getEnv("CEREBRAS_API_KEY", ""),
			Model:   getEnv("CEREBRAS_MODEL", "llama-3.1-8b"), // Default model
		},
		Midtrans: MidtransConfig{
			ServerKey:    getEnv("MIDTRANS_SERVER_KEY", ""),
			ClientKey:    getEnv("MIDTRANS_CLIENT_KEY", ""),
			MerchantID:   getEnv("MIDTRANS_MERCHANT_ID", ""),
			IsProduction: getEnv("MIDTRANS_IS_PRODUCTION", "false") == "true",
		},
	}

	// Set APIBaseURL berdasarkan IsProduction
	if AppConfig.Midtrans.IsProduction {
		AppConfig.Midtrans.APIBaseURL = "https://api.midtrans.com"
	} else {
		AppConfig.Midtrans.APIBaseURL = "https://api.sandbox.midtrans.com"
	}

	// Validate Midtrans credentials (warn jika tidak ada, tapi tidak block startup)
	if AppConfig.Midtrans.ServerKey == "" {
		log.Printf("WARNING: MIDTRANS_SERVER_KEY is not set. Payment features will not work.")
	}
	if AppConfig.Midtrans.ClientKey == "" {
		log.Printf("WARNING: MIDTRANS_CLIENT_KEY is not set. Payment features will not work.")
	}
	if AppConfig.Midtrans.MerchantID == "" {
		log.Printf("WARNING: MIDTRANS_MERCHANT_ID is not set. Payment features will not work.")
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	var value int
	_, err := fmt.Sscanf(valueStr, "%d", &value)
	if err != nil {
		return defaultValue
	}
	return value
}

func getEnvAsInt64(key string, defaultValue int64) int64 {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	var value int64
	_, err := fmt.Sscanf(valueStr, "%d", &value)
	if err != nil {
		return defaultValue
	}
	return value
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	valueStr := strings.TrimSpace(os.Getenv(key))
	if valueStr == "" {
		return defaultValue
	}
	d, err := time.ParseDuration(valueStr)
	if err != nil {
		return defaultValue
	}
	return d
}

func GetDSN() string {
	db := AppConfig.Database
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		db.Host, db.Port, db.User, db.Password, db.DBName, db.SSLMode,
	)
}
