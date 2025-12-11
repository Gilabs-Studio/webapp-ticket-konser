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

	// Check if event already exists
	var existingEvent event.Event
	if err := database.DB.Where("event_name = ?", "Harry Potter Museum Exhibition").First(&existingEvent).Error; err == nil {
		log.Println("[Event Seeder] Event 'Harry Potter Museum Exhibition' already exists, skipping...")
		return nil
	}

	// Create Harry Potter Museum Exhibition event
	harryPotterEvent := &event.Event{
		EventName:   "Harry Potter Museum Exhibition",
		Description: "Pameran interaktif yang membawa Anda ke dunia sihir Harry Potter. Jelajahi replika Hogwarts, lihat artefak asli dari film, dan nikmati pengalaman magis yang tak terlupakan.",
		BannerImage: "https://example.com/banners/harry-potter-exhibition.jpg",
		Status:      event.EventStatusPublished,
		StartDate:   time.Date(2025, 6, 1, 0, 0, 0, 0, time.UTC),
		EndDate:     time.Date(2025, 8, 31, 0, 0, 0, 0, time.UTC),
	}

	if err := database.DB.Create(harryPotterEvent).Error; err != nil {
		return err
	}

	log.Printf("[Event Seeder] ✅ Created event: %s (ID: %s)", harryPotterEvent.EventName, harryPotterEvent.ID)
	log.Println("[Event Seeder] Events seeded successfully")
	return nil
}


