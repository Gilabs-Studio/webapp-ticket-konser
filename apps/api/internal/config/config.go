package config

import (
	"fmt"
	"os"

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

	AppConfig = &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "crm_healthcare"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			SecretKey:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
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

