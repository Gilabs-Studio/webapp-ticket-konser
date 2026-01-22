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
			Path:           "/dashboard",
			OrderIndex:     1,
			PermissionCode: "", // No permission needed - all admin users can access
			IsActive:       true,
		},
		{
			Code:           "event-management",
			Label:          "Event & Ticket",
			Icon:           "calendar",
			Path:           "/events-management",
			OrderIndex:     2,
			PermissionCode: "event.read",
			IsActive:       true,
		},

		{
			Code:           "order-management",
			Label:          "Order",
			Icon:           "shopping-cart",
			Path:           "/orders-management",
			OrderIndex:     4,
			PermissionCode: "order.read",
			IsActive:       true,
		},
		{
			Code:           "user-management",
			Label:          "User",
			Icon:           "users",
			Path:           "/users-management",
			OrderIndex:     5,
			PermissionCode: "user.read",
			IsActive:       true,
		},
		{
			Code:           "settings",
			Label:          "Settings",
			Icon:           "settings",
			Path:           "/settings",
			OrderIndex:     6,
			PermissionCode: "settings.read",
			IsActive:       true,
		},
		{
			Code:           "attendees",
			Label:          "Attendees",
			Icon:           "users",
			Path:           "/attendees-management",
			OrderIndex:     7,
			PermissionCode: "attendee.read",
			IsActive:       true,
		},
		{
			Code:           "gate-management",
			Label:          "Gate",
			Icon:           "door-open",
			Path:           "/gates-management",
			OrderIndex:     8,
			PermissionCode: "gate.read",
			IsActive:       true,
		},
		{
			Code:           "merchandise-management",
			Label:          "Merchandise",
			Icon:           "shirt",
			Path:           "/merchandise-management",
			OrderIndex:     9,
			PermissionCode: "merchandise.read",
			IsActive:       true,
		},
		{
			Code:           "schedule-management",
			Label:          "Schedule",
			Icon:           "calendar-clock",
			Path:           "/schedules-management",
			OrderIndex:     10,
			PermissionCode: "schedule.read",
			IsActive:       true,
		},
		// Note: Scanner and Check-ins menus are NOT added here because:
		// - Staff access these via profile dropdown (not sidebar)
		// - Admin should not see these in sidebar (they have admin dashboard)
		// - These are accessed via /scanner and /check-ins routes (not /staff/*)
		// Note: Ticket Category management is accessible via tabs in Ticket Management page
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
			// Menu exists, update it to ensure path/details are correct
			m.ID = existingMenu.ID // Preserve ID
			if err := database.DB.Save(&m).Error; err != nil {
				return err
			}
			log.Printf("[Menu Seeder] Updated menu: %s (code: %s)", m.Label, m.Code)
			// effectively we treat this as "created/updated" or we can track updates separately
			// for now let's just count it as doing "something"
			createdCount++ 
		}
	}

	log.Printf("[Menu Seeder] Menus seeded successfully. Created: %d, Skipped: %d", createdCount, skippedCount)
	return nil
}
