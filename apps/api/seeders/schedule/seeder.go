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

	// Delete old schedules for this event to ensure clean state and fresh dates
	if err := database.DB.Where("event_id = ?", harryPotterEvent.ID).Delete(&schedule.Schedule{}).Error; err != nil {
		log.Printf("[Schedule Seeder] Error clearing old schedules: %v", err)
	} else {
		log.Println("[Schedule Seeder] Cleared old schedules for Harry Potter event")
	}

	// Create schedules starting from today
	startDate := time.Now().Truncate(24 * time.Hour)
	schedules := []*schedule.Schedule{}

	// Update event dates as well to match the new schedules (redundant but safe)
	harryPotterEvent.StartDate = startDate
	harryPotterEvent.EndDate = startDate.AddDate(0, 3, 0) // 3 months from now
	database.DB.Save(&harryPotterEvent)

	// Create 3 sessions per day for 7 days
	for day := 0; day < 7; day++ {
		currentDate := startDate.AddDate(0, 0, day)

		// Morning session: 09:00 - 12:00
		schedules = append(schedules, &schedule.Schedule{
			EventID:       harryPotterEvent.ID,
			Date:          currentDate,
			SessionName:   "Morning Session",
			StartTime:     time.Date(currentDate.Year(), currentDate.Month(), currentDate.Day(), 9, 0, 0, 0, time.UTC),
			EndTime:       time.Date(currentDate.Year(), currentDate.Month(), currentDate.Day(), 12, 0, 0, 0, time.UTC),
			ArtistName:    "Harry Potter Orchestra",
			Rundown:       "09:00 - Opening Ceremony\n09:30 - Main Performance\n11:00 - Interactive Session\n11:30 - Q&A Session\n12:00 - Closing",
			Capacity:      200,
			RemainingSeat: 200,
		})

		// Afternoon session: 13:00 - 16:00
		schedules = append(schedules, &schedule.Schedule{
			EventID:       harryPotterEvent.ID,
			Date:          currentDate,
			SessionName:   "Afternoon Session",
			StartTime:     time.Date(currentDate.Year(), currentDate.Month(), currentDate.Day(), 13, 0, 0, 0, time.UTC),
			EndTime:       time.Date(currentDate.Year(), currentDate.Month(), currentDate.Day(), 16, 0, 0, 0, time.UTC),
			ArtistName:    "Harry Potter Orchestra & Special Guest",
			Rundown:       "13:00 - Opening Ceremony\n13:30 - Main Performance\n14:30 - Special Guest Performance\n15:00 - Interactive Session\n15:30 - Q&A Session\n16:00 - Closing",
			Capacity:      200,
			RemainingSeat: 200,
		})

		// Evening session: 17:00 - 20:00
		schedules = append(schedules, &schedule.Schedule{
			EventID:       harryPotterEvent.ID,
			Date:          currentDate,
			SessionName:   "Evening Session",
			StartTime:     time.Date(currentDate.Year(), currentDate.Month(), currentDate.Day(), 17, 0, 0, 0, time.UTC),
			EndTime:       time.Date(currentDate.Year(), currentDate.Month(), currentDate.Day(), 20, 0, 0, 0, time.UTC),
			ArtistName:    "Harry Potter Orchestra & Full Cast",
			Rundown:       "17:00 - Opening Ceremony\n17:30 - Main Performance\n18:30 - Full Cast Performance\n19:00 - Interactive Session\n19:30 - Q&A Session\n20:00 - Closing",
			Capacity:      200,
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
