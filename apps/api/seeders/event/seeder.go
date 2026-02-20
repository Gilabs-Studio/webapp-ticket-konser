package event

import (
	"log"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
)

// Seed seeds event data
// This function uses upsert logic: creates event if not exists, skips if exists
func Seed() error {
	log.Println("Seeding events...")

	// Create or update Harry Potter Museum Exhibition event
	startDate := time.Now().Truncate(24 * time.Hour)
	endDate := startDate.AddDate(0, 3, 0) // 3 months from now
	harryPotterID := "4c135e3d-e48e-4a7a-a9ab-895f025002f7"

	var harryPotterEvent event.Event
	err := database.DB.Where("id = ?", harryPotterID).First(&harryPotterEvent).Error
	if err == nil {
		// Event exists, update dates to ensure it's not expired
		harryPotterEvent.StartDate = startDate
		harryPotterEvent.EndDate = endDate
		database.DB.Save(&harryPotterEvent)
		log.Println("[Event Seeder] Updated dates for 'Harry Potter Museum Exhibition'")
		return nil
	}

	// Create new if not exists
	harryPotterEvent = event.Event{
		ID:          harryPotterID,
		EventName:   "Harry Potter Museum Exhibition",
		Description: "Pameran interaktif yang membawa Anda ke dunia sihir Harry Potter. Jelajahi replika Hogwarts, lihat artefak asli dari film, dan nikmati pengalaman magis yang tak terlupakan.",
		BannerImage: "https://example.com/banners/harry-potter-exhibition.jpg",
		Status:      event.EventStatusPublished,
		StartDate:   startDate,
		EndDate:     endDate,
	}

	if err := database.DB.Create(&harryPotterEvent).Error; err != nil {
		return err
	}

	log.Printf("[Event Seeder] ✅ Created event: %s (ID: %s)", harryPotterEvent.EventName, harryPotterEvent.ID)
	log.Println("[Event Seeder] Events seeded successfully")
	return nil
}
