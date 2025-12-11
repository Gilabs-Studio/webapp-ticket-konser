package config

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Cerebras CerebrasConfig
}

type ServerConfig struct {
	Port string
	Env  string
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
	SecretKey      string
	AccessTokenTTL int // in hours
	RefreshTokenTTL int // in days
}

type CerebrasConfig struct {
	BaseURL string
	APIKey  string
	Model   string // Default model name
}

var AppConfig *Config

func Load() error {
	// Load .env file if exists (for local development)
	_ = godotenv.Load()

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
		jwtSecret = "your-secret-key-change-in-production"
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
			Env:  getEnv("ENV", "development"),
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
			SecretKey:      jwtSecret,
			AccessTokenTTL: getEnvAsInt("JWT_ACCESS_TTL", 24), // 24 hours
			RefreshTokenTTL: getEnvAsInt("JWT_REFRESH_TTL", 7), // 7 days
		},
		Cerebras: CerebrasConfig{
			BaseURL: getEnv("CEREBRAS_BASE_URL", "https://api.cerebras.ai"),
			APIKey:  getEnv("CEREBRAS_API_KEY", ""),
			Model:   getEnv("CEREBRAS_MODEL", "llama-3.1-8b"), // Default model
		},
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

func GetDSN() string {
	db := AppConfig.Database
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		db.Host, db.Port, db.User, db.Password, db.DBName, db.SSLMode,
	)
}

