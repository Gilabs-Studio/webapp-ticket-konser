package auth

import (
	"errors"
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Seed seeds initial auth users
// This function uses upsert logic: creates user if not exists, skips if exists
func Seed() error {
	// Get roles
	var adminRole, staffTicketRole, guestRole role.Role
	if err := database.DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Println("[Auth Seeder] Error: Admin role not found. Please seed roles first.")
			return err
		}
		return err
	}
	if err := database.DB.Where("code = ?", "staff_ticket").First(&staffTicketRole).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Println("[Auth Seeder] Error: Staff ticket role not found. Please seed roles first.")
			return err
		}
		return err
	}
	if err := database.DB.Where("code = ?", "guest").First(&guestRole).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Println("[Auth Seeder] Error: Guest role not found. Please seed roles first.")
			return err
		}
		return err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	users := []user.User{
		{
			Email:     "admin@example.com",
			Password:  string(hashedPassword),
			Name:      "Admin User",
			AvatarURL: "https://api.dicebear.com/7.x/lorelei/svg?seed=admin@example.com",
			RoleID:    adminRole.ID,
			Status:    "active",
		},
		{
			Email:     "staff@example.com",
			Password:  string(hashedPassword),
			Name:      "Staff Ticket User",
			AvatarURL: "https://api.dicebear.com/7.x/lorelei/svg?seed=staff@example.com",
			RoleID:    staffTicketRole.ID,
			Status:    "active",
		},
		{
			Email:     "guest@example.com",
			Password:  string(hashedPassword),
			Name:      "Guest User",
			AvatarURL: "https://api.dicebear.com/7.x/lorelei/svg?seed=guest@example.com",
			RoleID:    guestRole.ID,
			Status:    "active",
		},
	}

	createdCount := 0
	skippedCount := 0

	for _, u := range users {
		// Check if user already exists
		var existingUser user.User
		result := database.DB.Where("email = ?", u.Email).First(&existingUser)

		if result.Error != nil {
			// Check if error is "record not found" - means user doesn't exist
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// User doesn't exist, create it
				if err := database.DB.Create(&u).Error; err != nil {
					return err
				}
				log.Printf("[Auth Seeder] Created user: %s (role_id: %s)", u.Email, u.RoleID)
				createdCount++
			} else {
				// Other database error
				return result.Error
			}
		} else {
			// User exists, skip
			log.Printf("[Auth Seeder] User %s already exists, skipping...", u.Email)
			skippedCount++
		}
	}

	log.Printf("[Auth Seeder] Users seeded successfully. Created: %d, Skipped: %d", createdCount, skippedCount)
	return nil
}
