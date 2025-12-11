package schedule

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Schedule represents a schedule entity
type Schedule struct {
	ID           string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	EventID      string         `gorm:"type:uuid;not null;index" json:"event_id"`
	Event        *event.Event   `gorm:"foreignKey:EventID" json:"event,omitempty"`
	Date         time.Time      `gorm:"type:date;not null;index" json:"date"`
	SessionName  string         `gorm:"type:varchar(255);not null" json:"session_name"`
	StartTime    time.Time      `gorm:"type:time;not null" json:"start_time"`
	EndTime      time.Time      `gorm:"type:time;not null" json:"end_time"`
	ArtistName   string         `gorm:"type:varchar(255)" json:"artist_name"`
	Rundown      string         `gorm:"type:text" json:"rundown"`
	Capacity     int            `gorm:"not null;default:0" json:"capacity"`
	RemainingSeat int           `gorm:"not null;default:0" json:"remaining_seat"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Schedule
func (Schedule) TableName() string {
	return "schedules"
}

// BeforeCreate hook to generate UUID
func (s *Schedule) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return nil
}

// ScheduleResponse represents schedule response DTO
type ScheduleResponse struct {
	ID           string              `json:"id"`
	EventID      string              `json:"event_id"`
	Event        *event.EventResponse `json:"event,omitempty"`
	Date         time.Time           `json:"date"`
	SessionName  string               `json:"session_name"`
	StartTime    time.Time            `json:"start_time"`
	EndTime      time.Time            `json:"end_time"`
	ArtistName   string               `json:"artist_name"`
	Rundown      string               `json:"rundown"`
	Capacity     int                  `json:"capacity"`
	RemainingSeat int                 `json:"remaining_seat"`
	CreatedAt    time.Time            `json:"created_at"`
	UpdatedAt    time.Time            `json:"updated_at"`
}

// ToScheduleResponse converts Schedule to ScheduleResponse
func (s *Schedule) ToScheduleResponse() *ScheduleResponse {
	resp := &ScheduleResponse{
		ID:           s.ID,
		EventID:      s.EventID,
		Date:         s.Date,
		SessionName:  s.SessionName,
		StartTime:    s.StartTime,
		EndTime:      s.EndTime,
		ArtistName:   s.ArtistName,
		Rundown:      s.Rundown,
		Capacity:     s.Capacity,
		RemainingSeat: s.RemainingSeat,
		CreatedAt:    s.CreatedAt,
		UpdatedAt:    s.UpdatedAt,
	}
	if s.Event != nil {
		resp.Event = s.Event.ToEventResponse()
	}
	return resp
}

// CreateScheduleRequest represents create schedule request DTO
type CreateScheduleRequest struct {
	EventID      string    `json:"event_id" binding:"required,uuid"`
	Date         time.Time `json:"date" binding:"required"`
	SessionName  string    `json:"session_name" binding:"required,min=1,max=255"`
	StartTime    time.Time `json:"start_time" binding:"required"`
	EndTime      time.Time `json:"end_time" binding:"required"`
	ArtistName   string    `json:"artist_name" binding:"omitempty,max=255"`
	Rundown      string    `json:"rundown" binding:"omitempty"`
	Capacity     int       `json:"capacity" binding:"required,min=1"`
	RemainingSeat int      `json:"remaining_seat" binding:"omitempty,min=0"`
}

// UpdateScheduleRequest represents update schedule request DTO
type UpdateScheduleRequest struct {
	Date         *time.Time `json:"date"`
	SessionName  *string    `json:"session_name" binding:"omitempty,min=1,max=255"`
	StartTime    *time.Time `json:"start_time"`
	EndTime      *time.Time `json:"end_time"`
	ArtistName   *string    `json:"artist_name" binding:"omitempty,max=255"`
	Rundown      *string    `json:"rundown"`
	Capacity     *int       `json:"capacity" binding:"omitempty,min=1"`
	RemainingSeat *int       `json:"remaining_seat" binding:"omitempty,min=0"`
}


