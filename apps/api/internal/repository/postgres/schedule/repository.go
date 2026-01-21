package schedule

import (
	"errors"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/schedule"
	schedulerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/schedule"
	"gorm.io/gorm"
)

var (
	ErrScheduleNotFound = errors.New("schedule not found")
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new schedule repository
func NewRepository(db *gorm.DB) schedulerepo.Repository {
	return &Repository{
		db: db,
	}
}

// FindByID finds a schedule by ID
func (r *Repository) FindByID(id string) (*schedule.Schedule, error) {
	var s schedule.Schedule
	if err := r.db.Where("id = ?", id).Preload("Event").First(&s).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrScheduleNotFound
		}
		return nil, err
	}
	return &s, nil
}

// FindByEventID finds schedules by event ID
func (r *Repository) FindByEventID(eventID string) ([]*schedule.Schedule, error) {
	var schedules []*schedule.Schedule
	if err := r.db.Where("event_id = ?", eventID).Preload("Event").Order("date ASC, start_time ASC").Find(&schedules).Error; err != nil {
		return nil, err
	}
	return schedules, nil
}

// FindByDate finds schedules by date
func (r *Repository) FindByDate(date time.Time) ([]*schedule.Schedule, error) {
	var schedules []*schedule.Schedule
	dateStr := date.Format("2006-01-02")
	if err := r.db.Where("date = ?", dateStr).Preload("Event").Order("start_time ASC").Find(&schedules).Error; err != nil {
		return nil, err
	}
	return schedules, nil
}

// Create creates a new schedule
func (r *Repository) Create(s *schedule.Schedule) error {
	return r.db.Create(s).Error
}

// Update updates a schedule
func (r *Repository) Update(s *schedule.Schedule) error {
	return r.db.Save(s).Error
}

// Delete soft deletes a schedule
func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&schedule.Schedule{}).Error
}

// List lists all schedules
func (r *Repository) List() ([]*schedule.Schedule, error) {
	var schedules []*schedule.Schedule
	if err := r.db.Preload("Event").Order("date ASC, start_time ASC").Find(&schedules).Error; err != nil {
		return nil, err
	}
	return schedules, nil
}





