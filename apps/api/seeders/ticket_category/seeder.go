package ticketcategory

import (
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	ticketcategory "github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
)

// Seed seeds ticket category data
// This function uses upsert logic: creates ticket categories if not exists, skips if exists
// Requires: Events must be seeded first
func Seed() error {
	log.Println("Seeding ticket categories...")

	// Get Harry Potter event
	var harryPotterEvent event.Event
	if err := database.DB.Where("event_name = ?", "Harry Potter Museum Exhibition").First(&harryPotterEvent).Error; err != nil {
		log.Println("⚠️  [Ticket Category Seeder] Harry Potter event not found, skipping ticket category seeding...")
		log.Println("⚠️  [Ticket Category Seeder] Please seed events first before seeding ticket categories")
		return nil
	}

	// Use upsert logic: create if not exists, skip if exists
	// Check if categories already exist for this event
	var existingCount int64
	database.DB.Model(&ticketcategory.TicketCategory{}).Where("event_id = ?", harryPotterEvent.ID).Count(&existingCount)
	if existingCount > 0 {
		log.Printf("[Ticket Category Seeder] Ticket categories already exist for event %s (%d categories), skipping...", harryPotterEvent.EventName, existingCount)
		return nil
	}

	// Create ticket categories
	categories := []*ticketcategory.TicketCategory{
		{
			EventID:      harryPotterEvent.ID,
			CategoryName: "Regular",
			Price:        150000,
			Quota:        1000,
			LimitPerUser: 5,
		},
		{
			EventID:      harryPotterEvent.ID,
			CategoryName: "VIP",
			Price:        300000,
			Quota:        200,
			LimitPerUser: 3,
		},
		{
			EventID:      harryPotterEvent.ID,
			CategoryName: "Premium",
			Price:        500000,
			Quota:        100,
			LimitPerUser: 2,
		},
		{
			EventID:      harryPotterEvent.ID,
			CategoryName: "Student",
			Price:        100000,
			Quota:        500,
			LimitPerUser: 2,
		},
		{
			EventID:      harryPotterEvent.ID,
			CategoryName: "Child",
			Price:        75000,
			Quota:        300,
			LimitPerUser: 3,
		},
	}

	createdCount := 0
	for _, category := range categories {
		if err := database.DB.Create(category).Error; err != nil {
			return err
		}
		log.Printf("[Ticket Category Seeder] ✅ Created ticket category: %s (ID: %s)", category.CategoryName, category.ID)
		createdCount++
	}

	log.Printf("[Ticket Category Seeder] Ticket categories seeded successfully. Created: %d", createdCount)
	return nil
}
