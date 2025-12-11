package schedule

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/schedule"
	schedulerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/schedule"
	"gorm.io/gorm"
)

var (
	ErrScheduleNotFound = errors.New("schedule not found")
)

type Service struct {
	repo schedulerepo.Repository
}

func NewService(repo schedulerepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetByID returns a schedule by ID
func (s *Service) GetByID(id string) (*schedule.ScheduleResponse, error) {
	sch, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrScheduleNotFound
		}
		return nil, err
	}
	return sch.ToScheduleResponse(), nil
}

// GetByEventID returns schedules by event ID
func (s *Service) GetByEventID(eventID string) ([]*schedule.ScheduleResponse, error) {
	schedules, err := s.repo.FindByEventID(eventID)
	if err != nil {
		return nil, err
	}

	responses := make([]*schedule.ScheduleResponse, len(schedules))
	for i, sch := range schedules {
		responses[i] = sch.ToScheduleResponse()
	}
	return responses, nil
}

// Create creates a new schedule
func (s *Service) Create(req *schedule.CreateScheduleRequest) (*schedule.ScheduleResponse, error) {
	remainingSeat := req.Capacity
	if req.RemainingSeat > 0 {
		remainingSeat = req.RemainingSeat
	}

	sch := &schedule.Schedule{
		EventID:      req.EventID,
		Date:         req.Date,
		SessionName:  req.SessionName,
		StartTime:    req.StartTime,
		EndTime:      req.EndTime,
		ArtistName:   req.ArtistName,
		Rundown:      req.Rundown,
		Capacity:     req.Capacity,
		RemainingSeat: remainingSeat,
	}

	if err := s.repo.Create(sch); err != nil {
		return nil, err
	}

	// Reload to get generated fields
	createdSchedule, err := s.repo.FindByID(sch.ID)
	if err != nil {
		return nil, err
	}

	return createdSchedule.ToScheduleResponse(), nil
}

// Update updates a schedule
func (s *Service) Update(id string, req *schedule.UpdateScheduleRequest) (*schedule.ScheduleResponse, error) {
	sch, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrScheduleNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Date != nil {
		sch.Date = *req.Date
	}
	if req.SessionName != nil {
		sch.SessionName = *req.SessionName
	}
	if req.StartTime != nil {
		sch.StartTime = *req.StartTime
	}
	if req.EndTime != nil {
		sch.EndTime = *req.EndTime
	}
	if req.ArtistName != nil {
		sch.ArtistName = *req.ArtistName
	}
	if req.Rundown != nil {
		sch.Rundown = *req.Rundown
	}
	if req.Capacity != nil {
		sch.Capacity = *req.Capacity
	}
	if req.RemainingSeat != nil {
		sch.RemainingSeat = *req.RemainingSeat
	}

	if err := s.repo.Update(sch); err != nil {
		return nil, err
	}

	// Reload
	updatedSchedule, err := s.repo.FindByID(sch.ID)
	if err != nil {
		return nil, err
	}

	return updatedSchedule.ToScheduleResponse(), nil
}

// Delete deletes a schedule
func (s *Service) Delete(id string) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrScheduleNotFound
		}
		return err
	}

	return s.repo.Delete(id)
}

// List lists all schedules
func (s *Service) List() ([]*schedule.ScheduleResponse, error) {
	schedules, err := s.repo.List()
	if err != nil {
		return nil, err
	}

	responses := make([]*schedule.ScheduleResponse, len(schedules))
	for i, sch := range schedules {
		responses[i] = sch.ToScheduleResponse()
	}
	return responses, nil
}


