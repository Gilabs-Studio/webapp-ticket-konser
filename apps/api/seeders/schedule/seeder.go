package schedule

import (
	"log"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/schedule"
)

// Seed seeds schedule data
// This function uses upsert logic: creates schedules if not exists, skips if exists
// Requires: Events must be seeded first
func Seed() error {
	log.Println("Seeding schedules...")

	// Get Harry Potter event
	var harryPotterEvent event.Event
	if err := database.DB.Where("event_name = ?", "Harry Potter Museum Exhibition").First(&harryPotterEvent).Error; err != nil {
		log.Println("⚠️  [Schedule Seeder] Harry Potter event not found, skipping schedule seeding...")
		log.Println("⚠️  [Schedule Seeder] Please seed events first before seeding schedules")
		return nil
	}

	// Use upsert logic: create if not exists, skip if exists
	// Check if schedules already exist for this event
	var existingCount int64
	database.DB.Model(&schedule.Schedule{}).Where("event_id = ?", harryPotterEvent.ID).Count(&existingCount)
	if existingCount > 0 {
		log.Printf("[Schedule Seeder] Schedules already exist for event %s (%d schedules), skipping...", harryPotterEvent.EventName, existingCount)
		return nil
	}

	// Create schedules for the first week of June 2025
	startDate := time.Date(2025, 6, 1, 0, 0, 0, 0, time.UTC)
	schedules := []*schedule.Schedule{}

	// Create 3 sessions per day for 7 days
	for day := 0; day < 7; day++ {
		currentDate := startDate.AddDate(0, 0, day)
		
		// Morning session: 09:00 - 12:00
		schedules = append(schedules, &schedule.Schedule{
			EventID:      harryPotterEvent.ID,
			Date:         currentDate,
			SessionName:  "Morning Session",
			StartTime:    time.Date(2025, 6, 1+day, 9, 0, 0, 0, time.UTC),
			EndTime:      time.Date(2025, 6, 1+day, 12, 0, 0, 0, time.UTC),
			ArtistName:   "Harry Potter Orchestra",
			Rundown:      "09:00 - Opening Ceremony\n09:30 - Main Performance\n11:00 - Interactive Session\n11:30 - Q&A Session\n12:00 - Closing",
			Capacity:     200,
			RemainingSeat: 200,
		})

		// Afternoon session: 13:00 - 16:00
		schedules = append(schedules, &schedule.Schedule{
			EventID:      harryPotterEvent.ID,
			Date:         currentDate,
			SessionName:  "Afternoon Session",
			StartTime:    time.Date(2025, 6, 1+day, 13, 0, 0, 0, time.UTC),
			EndTime:      time.Date(2025, 6, 1+day, 16, 0, 0, 0, time.UTC),
			ArtistName:   "Harry Potter Orchestra & Special Guest",
			Rundown:      "13:00 - Opening Ceremony\n13:30 - Main Performance\n14:30 - Special Guest Performance\n15:00 - Interactive Session\n15:30 - Q&A Session\n16:00 - Closing",
			Capacity:     200,
			RemainingSeat: 200,
		})

		// Evening session: 17:00 - 20:00
		schedules = append(schedules, &schedule.Schedule{
			EventID:      harryPotterEvent.ID,
			Date:         currentDate,
			SessionName:  "Evening Session",
			StartTime:    time.Date(2025, 6, 1+day, 17, 0, 0, 0, time.UTC),
			EndTime:      time.Date(2025, 6, 1+day, 20, 0, 0, 0, time.UTC),
			ArtistName:   "Harry Potter Orchestra & Full Cast",
			Rundown:      "17:00 - Opening Ceremony\n17:30 - Main Performance\n18:30 - Full Cast Performance\n19:00 - Interactive Session\n19:30 - Q&A Session\n20:00 - Closing",
			Capacity:     200,
			RemainingSeat: 200,
		})
	}

	createdCount := 0
	for _, sched := range schedules {
		if err := database.DB.Create(sched).Error; err != nil {
			return err
		}
		log.Printf("[Schedule Seeder] ✅ Created schedule: %s - %s (ID: %s)", sched.Date.Format("2006-01-02"), sched.SessionName, sched.ID)
		createdCount++
	}

	log.Printf("[Schedule Seeder] Schedules seeded successfully. Created: %d", createdCount)
	return nil
}


