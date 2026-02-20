package role

import (
	"errors"
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
	"gorm.io/gorm"
)

// Seed seeds initial roles
// This function uses upsert logic: creates role if not exists, skips if exists
func Seed() error {
	roles := []role.Role{
		{
			Code:          "admin",
			Name:          "Admin",
			Description:   "Administrator role with full access to all menus",
			IsAdmin:       true,
			CanLoginAdmin: true,
		},
		{
			Code:          "staff_ticket",
			Name:          "Staff Ticket",
			Description:   "Staff role with access and QR check-in",
			IsAdmin:       false,
			CanLoginAdmin: true,
		},
		{
			Code:          "guest",
			Name:          "Guest",
			Description:   "Guest role for public access, cannot login to admin dashboard",
			IsAdmin:       false,
			CanLoginAdmin: false,
		},
	}

	createdCount := 0
	skippedCount := 0

	for _, r := range roles {
		// Check if role already exists
		var existingRole role.Role
		result := database.DB.Where("code = ?", r.Code).First(&existingRole)

		if result.Error != nil {
			// Check if error is "record not found" - means role doesn't exist
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Role doesn't exist, create it
				if err := database.DB.Create(&r).Error; err != nil {
					return err
				}
				log.Printf("[Role Seeder] Created role: %s (code: %s)", r.Name, r.Code)
				createdCount++
			} else {
				// Other database error
				return result.Error
			}
		} else {
			// Role exists, skip
			log.Printf("[Role Seeder] Role %s already exists, skipping...", r.Code)
			skippedCount++
		}
	}

	log.Printf("[Role Seeder] Roles seeded successfully. Created: %d, Skipped: %d", createdCount, skippedCount)
	return nil
}
