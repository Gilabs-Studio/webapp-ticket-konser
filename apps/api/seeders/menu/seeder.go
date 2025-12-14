package menu

import (
	"errors"
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/menu"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	"gorm.io/gorm"
)

// Seed seeds initial menus
// This function uses upsert logic: creates menu if not exists, skips if exists
// Also validates that permission_code exists in permissions table if provided
func Seed() error {
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
			Code:           "event-management",
			Label:          "Event Management",
			Icon:           "calendar",
			Path:           "/events",
			OrderIndex:     2,
			PermissionCode: "event.read",
			IsActive:       true,
		},
		{
			Code:           "ticket-management",
			Label:          "Ticket Management",
			Icon:           "ticket",
			Path:           "/tickets",
			OrderIndex:     3,
			PermissionCode: "ticket.read",
			IsActive:       true,
		},
		{
			Code:           "user-management",
			Label:          "User Management",
			Icon:           "users",
			Path:           "/users",
			OrderIndex:     4,
			PermissionCode: "user.read",
			IsActive:       true,
		},
		{
			Code:           "settings",
			Label:          "Settings",
			Icon:           "settings",
			Path:           "/settings",
			OrderIndex:     5,
			PermissionCode: "menu.read",
			IsActive:       true,
		},
		{
			Code:           "attendees",
			Label:          "Attendees",
			Icon:           "users",
			Path:           "/attendees",
			OrderIndex:     6,
			PermissionCode: "attendee.read",
			IsActive:       true,
		},
		// Note: Scanner and Check-ins menus are NOT added here because:
		// - Staff access these via profile dropdown (not sidebar)
		// - Admin should not see these in sidebar (they have admin dashboard)
		// - These are accessed via /scanner and /check-ins routes (not /staff/*)
	}

	createdCount := 0
	skippedCount := 0

	for _, m := range menus {
		// Validate permission_code if provided
		if m.PermissionCode != "" {
			var perm permission.Permission
			if err := database.DB.Where("code = ?", m.PermissionCode).First(&perm).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					log.Printf("[Menu Seeder] Warning: Permission code '%s' not found for menu '%s', skipping menu creation", m.PermissionCode, m.Code)
					continue
				}
				return err
			}
		}

		// Check if menu already exists
		var existingMenu menu.Menu
		result := database.DB.Where("code = ?", m.Code).First(&existingMenu)

		if result.Error != nil {
			// Check if error is "record not found" - means menu doesn't exist
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Menu doesn't exist, create it
				if err := database.DB.Create(&m).Error; err != nil {
					return err
				}
				log.Printf("[Menu Seeder] Created menu: %s (code: %s)", m.Label, m.Code)
				createdCount++
			} else {
				// Other database error
				return result.Error
			}
		} else {
			// Menu exists, skip
			log.Printf("[Menu Seeder] Menu %s already exists, skipping...", m.Code)
			skippedCount++
		}
	}

	log.Printf("[Menu Seeder] Menus seeded successfully. Created: %d, Skipped: %d", createdCount, skippedCount)
	return nil
}



