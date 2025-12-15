package settings

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/settings"
)

// Repository defines the interface for settings repository operations
type Repository interface {
	// FindByKey finds a setting by key
	FindByKey(key string) (*settings.Settings, error)
	
	// FindByType finds all settings by type
	FindByType(settingType string) ([]*settings.Settings, error)
	
	// Create creates a new setting
	Create(s *settings.Settings) error
	
	// Update updates a setting
	Update(s *settings.Settings) error
	
	// Upsert creates or updates a setting
	Upsert(s *settings.Settings) error
}
