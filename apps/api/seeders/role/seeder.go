package role

import (
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
)

// Seed seeds initial roles
func Seed() error {
	var count int64
	database.DB.Model(&role.Role{}).Count(&count)
	if count > 0 {
		log.Println("[Role Seeder] Roles already seeded, skipping...")
		return nil
	}

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
			Description:   "Staff role with access only to Ticket Management menu",
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

	for _, r := range roles {
		if err := database.DB.Create(&r).Error; err != nil {
			return err
		}
		log.Printf("[Role Seeder] Created role: %s (code: %s)", r.Name, r.Code)
	}

	log.Println("[Role Seeder] Roles seeded successfully")
	return nil
}


