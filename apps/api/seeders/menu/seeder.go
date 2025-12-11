package menu

import (
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/menu"
)

// Seed seeds initial menus
func Seed() error {
	var count int64
	database.DB.Model(&menu.Menu{}).Count(&count)
	if count > 0 {
		log.Println("[Menu Seeder] Menus already seeded, skipping...")
		return nil
	}

	menus := []menu.Menu{
		{
			Code:           "dashboard",
			Label:          "Dashboard",
			Icon:           "layout-dashboard",
			Path:           "/",
			OrderIndex:     1,
			PermissionCode: "", // No permission needed - all admin users can access
			IsActive:       true,
		},
		{
			Code:           "ticket-management",
			Label:          "Ticket Management",
			Icon:           "ticket",
			Path:           "/tickets",
			OrderIndex:     2,
			PermissionCode: "ticket.read",
			IsActive:       true,
		},
		{
			Code:           "user-management",
			Label:          "User Management",
			Icon:           "users",
			Path:           "/users",
			OrderIndex:     3,
			PermissionCode: "user.read",
			IsActive:       true,
		},
		{
			Code:           "settings",
			Label:          "Settings",
			Icon:           "settings",
			Path:           "/settings",
			OrderIndex:     4,
			PermissionCode: "menu.read",
			IsActive:       true,
		},
	}

	for _, m := range menus {
		if err := database.DB.Create(&m).Error; err != nil {
			return err
		}
		log.Printf("[Menu Seeder] Created menu: %s (code: %s)", m.Label, m.Code)
	}

	log.Println("[Menu Seeder] Menus seeded successfully")
	return nil
}


