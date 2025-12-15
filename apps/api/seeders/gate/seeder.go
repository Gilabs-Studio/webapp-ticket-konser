package gate

import (
	"errors"
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/gate"
	"gorm.io/gorm"
)

// Seed seeds initial gates
// This function uses upsert logic: creates gate if not exists, skips if exists
func Seed() error {
	gates := []gate.Gate{
		{
			Code:        "GATE-A",
			Name:        "Gate A",
			Location:    "Main Entrance - North Side",
			Description: "Main entrance gate for regular ticket holders",
			IsVIP:       false,
			Status:      gate.GateStatusActive,
			Capacity:    0, // Unlimited capacity
		},
		{
			Code:        "GATE-B",
			Name:        "Gate B",
			Location:    "Main Entrance - South Side",
			Description: "Secondary entrance gate for regular ticket holders",
			IsVIP:       false,
			Status:      gate.GateStatusActive,
			Capacity:    0, // Unlimited capacity
		},
		{
			Code:        "GATE-C",
			Name:        "Gate C",
			Location:    "VIP Entrance - East Side",
			Description: "VIP entrance gate for VIP ticket holders",
			IsVIP:       true,
			Status:      gate.GateStatusActive,
			Capacity:    0, // Unlimited capacity
		},
	}

	createdCount := 0
	skippedCount := 0

	for _, g := range gates {
		// Check if gate already exists
		var existingGate gate.Gate
		result := database.DB.Where("code = ?", g.Code).First(&existingGate)

		if result.Error != nil {
			// Check if error is "record not found" - means gate doesn't exist
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Gate doesn't exist, create it
				if err := database.DB.Create(&g).Error; err != nil {
					return err
				}
				log.Printf("[Gate Seeder] Created gate: %s (code: %s)", g.Name, g.Code)
				createdCount++
			} else {
				// Other database error
				return result.Error
			}
		} else {
			// Gate exists, skip
			log.Printf("[Gate Seeder] Gate %s already exists, skipping...", g.Code)
			skippedCount++
		}
	}

	log.Printf("[Gate Seeder] Gates seeded successfully. Created: %d, Skipped: %d", createdCount, skippedCount)
	return nil
}
