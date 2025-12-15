package merchandise

import (
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/event"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/merchandise"
)

// Seed seeds merchandise data
// This function uses upsert logic: creates merchandise if not exists, skips if exists
// Requires: Events must be seeded first
func Seed() error {
	log.Println("Seeding merchandise...")

	// Get Harry Potter event
	var harryPotterEvent event.Event
	if err := database.DB.Where("event_name = ?", "Harry Potter Museum Exhibition").First(&harryPotterEvent).Error; err != nil {
		log.Println("⚠️  [Merchandise Seeder] Harry Potter event not found, skipping merchandise seeding...")
		log.Println("⚠️  [Merchandise Seeder] Please seed events first before seeding merchandise")
		return nil
	}

	// Use upsert logic: create if not exists, skip if exists
	// Check if merchandise already exist for this event
	var existingCount int64
	database.DB.Model(&merchandise.Merchandise{}).Where("event_id = ?", harryPotterEvent.ID).Count(&existingCount)
	if existingCount > 0 {
		log.Printf("[Merchandise Seeder] Merchandise already exist for event %s (%d items), skipping...", harryPotterEvent.EventName, existingCount)
		return nil
	}

	// Create merchandise items
	merchandises := []*merchandise.Merchandise{
		{
			EventID:     harryPotterEvent.ID,
			Name:        "Event Hoodie",
			Description: "Comfortable hoodie with event logo and Harry Potter theme",
			Price:       550000, // Rp 550.000
			Stock:       142,
			Variant:     "Black / Cotton",
			ImageURL:    "https://example.com/merchandise/hoodie.jpg",
			IconName:    "Shirt",
			Status:      "active",
		},
		{
			EventID:     harryPotterEvent.ID,
			Name:        "Tote Bag",
			Description: "Canvas tote bag with event design",
			Price:       250000, // Rp 250.000
			Stock:       310,
			Variant:     "Canvas",
			ImageURL:    "https://example.com/merchandise/tote-bag.jpg",
			IconName:    "ShoppingBag",
			Status:      "active",
		},
		{
			EventID:     harryPotterEvent.ID,
			Name:        "Tumbler",
			Description: "Matte black tumbler with event logo",
			Price:       300000, // Rp 300.000
			Stock:       12,
			Variant:     "Matte Black",
			ImageURL:    "https://example.com/merchandise/tumbler.jpg",
			IconName:    "Coffee",
			Status:      "active",
		},
		{
			EventID:     harryPotterEvent.ID,
			Name:        "Magic Wand Replica",
			Description: "Official replica wand from the exhibition",
			Price:       750000, // Rp 750.000
			Stock:       45,
			Variant:     "Wooden",
			ImageURL:    "https://example.com/merchandise/wand.jpg",
			IconName:    "Wand",
			Status:      "active",
		},
		{
			EventID:     harryPotterEvent.ID,
			Name:        "Event T-Shirt",
			Description: "Limited edition t-shirt with exclusive design",
			Price:       350000, // Rp 350.000
			Stock:       89,
			Variant:     "Cotton / Multiple Sizes",
			ImageURL:    "https://example.com/merchandise/tshirt.jpg",
			IconName:    "Shirt",
			Status:      "active",
		},
	}

	createdCount := 0
	for _, m := range merchandises {
		if err := database.DB.Create(m).Error; err != nil {
			log.Printf("❌ Error creating merchandise %s: %v", m.Name, err)
			continue
		}
		log.Printf("[Merchandise Seeder] ✅ Created merchandise: %s (ID: %s)", m.Name, m.ID)
		createdCount++
	}

	log.Printf("[Merchandise Seeder] Merchandise seeded successfully. Created: %d", createdCount)
	return nil
}
