package settings

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/settings"
	settingsrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/settings"
	"gorm.io/gorm"
)

var (
	ErrSettingsNotFound = errors.New("settings not found")
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new settings repository
func NewRepository(db *gorm.DB) settingsrepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByKey finds a setting by key
func (r *Repository) FindByKey(key string) (*settings.Settings, error) {
	var s settings.Settings
	if err := r.db.Where("key = ?", key).First(&s).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Join(gorm.ErrRecordNotFound, ErrSettingsNotFound)
		}
		return nil, err
	}
	return &s, nil
}

// FindByType finds all settings by type
func (r *Repository) FindByType(settingType string) ([]*settings.Settings, error) {
	var settingsList []*settings.Settings
	if err := r.db.Where("type = ?", settingType).Find(&settingsList).Error; err != nil {
		return nil, err
	}
	return settingsList, nil
}

// Create creates a new setting
func (r *Repository) Create(s *settings.Settings) error {
	return r.db.Create(s).Error
}

// Update updates a setting
func (r *Repository) Update(s *settings.Settings) error {
	return r.db.Save(s).Error
}

// Upsert creates or updates a setting
func (r *Repository) Upsert(s *settings.Settings) error {
	var existing settings.Settings
	err := r.db.Where("key = ?", s.Key).First(&existing).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new
			return r.db.Create(s).Error
		}
		return err
	}
	
	// Update existing
	existing.Value = s.Value
	existing.Description = s.Description
	return r.db.Save(&existing).Error
}
