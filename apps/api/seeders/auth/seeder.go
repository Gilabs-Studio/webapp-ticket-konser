package auth

import (
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	"golang.org/x/crypto/bcrypt"
)

// Seed seeds initial auth users
func Seed() error {
	// Check if users already exist
	var count int64
	database.DB.Model(&user.User{}).Count(&count)
	if count > 0 {
		log.Println("[Auth Seeder] Users already seeded, skipping...")
		return nil
	}

	// Get roles
	var adminRole, staffTicketRole role.Role
	if err := database.DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "staff_ticket").First(&staffTicketRole).Error; err != nil {
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
	}

	for _, u := range users {
		if err := database.DB.Create(&u).Error; err != nil {
			return err
		}
		log.Printf("[Auth Seeder] Created user: %s (role_id: %s)", u.Email, u.RoleID)
	}

	log.Println("[Auth Seeder] Users seeded successfully")
	return nil
}


