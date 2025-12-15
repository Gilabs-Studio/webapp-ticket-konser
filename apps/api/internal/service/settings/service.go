package settings

import (
	"encoding/json"
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/settings"
	settingsrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/settings"
)

var (
	ErrSettingsNotFound = errors.New("settings not found")
)

type Service struct {
	repo settingsrepo.Repository
}

func NewService(repo settingsrepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetEventSettings gets event settings
func (s *Service) GetEventSettings() (*settings.EventSettings, error) {
	settingsList, err := s.repo.FindByType("event")
	if err != nil {
		return nil, err
	}

	eventSettings := &settings.EventSettings{}
	for _, setting := range settingsList {
		switch setting.Key {
		case "event_name":
			eventSettings.EventName = setting.Value
		case "event_date":
			eventSettings.EventDate = setting.Value
		case "location":
			eventSettings.Location = setting.Value
		case "description":
			eventSettings.Description = setting.Value
		case "banner_image":
			eventSettings.BannerImage = setting.Value
		case "contact_email":
			eventSettings.ContactEmail = setting.Value
		case "contact_phone":
			eventSettings.ContactPhone = setting.Value
		case "is_sales_paused":
			if setting.Value == "true" {
				eventSettings.IsSalesPaused = true
			}
		}
	}

	return eventSettings, nil
}

// UpdateEventSettings updates event settings
func (s *Service) UpdateEventSettings(req *settings.UpdateEventSettingsRequest) (*settings.EventSettings, error) {
	// Update each field if provided
	if req.EventName != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "event",
			Key:   "event_name",
			Value: *req.EventName,
		}); err != nil {
			return nil, err
		}
	}
	if req.EventDate != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "event",
			Key:   "event_date",
			Value: *req.EventDate,
		}); err != nil {
			return nil, err
		}
	}
	if req.Location != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "event",
			Key:   "location",
			Value: *req.Location,
		}); err != nil {
			return nil, err
		}
	}
	if req.Description != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "event",
			Key:   "description",
			Value: *req.Description,
		}); err != nil {
			return nil, err
		}
	}
	if req.BannerImage != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "event",
			Key:   "banner_image",
			Value: *req.BannerImage,
		}); err != nil {
			return nil, err
		}
	}
	if req.ContactEmail != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "event",
			Key:   "contact_email",
			Value: *req.ContactEmail,
		}); err != nil {
			return nil, err
		}
	}
	if req.ContactPhone != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "event",
			Key:   "contact_phone",
			Value: *req.ContactPhone,
		}); err != nil {
			return nil, err
		}
	}
	if req.IsSalesPaused != nil {
		value := "false"
		if *req.IsSalesPaused {
			value = "true"
		}
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "event",
			Key:   "is_sales_paused",
			Value: value,
		}); err != nil {
			return nil, err
		}
	}

	// Return updated settings
	return s.GetEventSettings()
}

// GetSystemSettings gets system settings
func (s *Service) GetSystemSettings() (*settings.SystemSettings, error) {
	settingsList, err := s.repo.FindByType("system")
	if err != nil {
		return nil, err
	}

	systemSettings := &settings.SystemSettings{}
	for _, setting := range settingsList {
		switch setting.Key {
		case "site_name":
			systemSettings.SiteName = setting.Value
		case "site_description":
			systemSettings.SiteDescription = setting.Value
		case "maintenance_mode":
			if setting.Value == "true" {
				systemSettings.MaintenanceMode = true
			}
		case "max_upload_size":
			// Parse as int
			var size int
			if err := json.Unmarshal([]byte(setting.Value), &size); err == nil {
				systemSettings.MaxUploadSize = size
			}
		}
	}

	return systemSettings, nil
}

// UpdateSystemSettings updates system settings
func (s *Service) UpdateSystemSettings(req *settings.UpdateSystemSettingsRequest) (*settings.SystemSettings, error) {
	// Update each field if provided
	if req.SiteName != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "system",
			Key:   "site_name",
			Value: *req.SiteName,
		}); err != nil {
			return nil, err
		}
	}
	if req.SiteDescription != nil {
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "system",
			Key:   "site_description",
			Value: *req.SiteDescription,
		}); err != nil {
			return nil, err
		}
	}
	if req.MaintenanceMode != nil {
		value := "false"
		if *req.MaintenanceMode {
			value = "true"
		}
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "system",
			Key:   "maintenance_mode",
			Value: value,
		}); err != nil {
			return nil, err
		}
	}
	if req.MaxUploadSize != nil {
		sizeBytes, _ := json.Marshal(*req.MaxUploadSize)
		if err := s.repo.Upsert(&settings.Settings{
			Type:  "system",
			Key:   "max_upload_size",
			Value: string(sizeBytes),
		}); err != nil {
			return nil, err
		}
	}

	// Return updated settings
	return s.GetSystemSettings()
}

// GetEventDate gets event date for countdown (public endpoint)
func (s *Service) GetEventDate() (*settings.EventDateResponse, error) {
	setting, err := s.repo.FindByKey("event_date")
	if err != nil {
		// Return default date if not found
		return &settings.EventDateResponse{
			EventDate: "2025-12-31T00:00:00+07:00",
		}, nil
	}

	return &settings.EventDateResponse{
		EventDate: setting.Value,
	}, nil
}
