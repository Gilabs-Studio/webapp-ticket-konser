package permission

import (
	"errors"
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	"gorm.io/gorm"
)

// Seed seeds initial permissions
// This function uses upsert logic: creates permission if not exists, skips if exists
func Seed() error {
	permissions := []permission.Permission{
		// Ticket permissions
		{Code: "ticket.create", Name: "Create Ticket", Resource: "ticket", Action: "create"},
		{Code: "ticket.read", Name: "Read Ticket", Resource: "ticket", Action: "read"},
		{Code: "ticket.update", Name: "Update Ticket", Resource: "ticket", Action: "update"},
		{Code: "ticket.delete", Name: "Delete Ticket", Resource: "ticket", Action: "delete"},

		// Ticket Category permissions
		{Code: "ticket_category.create", Name: "Create Ticket Category", Resource: "ticket_category", Action: "create"},
		{Code: "ticket_category.read", Name: "Read Ticket Category", Resource: "ticket_category", Action: "read"},
		{Code: "ticket_category.update", Name: "Update Ticket Category", Resource: "ticket_category", Action: "update"},
		{Code: "ticket_category.delete", Name: "Delete Ticket Category", Resource: "ticket_category", Action: "delete"},

		// Event permissions
		{Code: "event.create", Name: "Create Event", Resource: "event", Action: "create"},
		{Code: "event.read", Name: "Read Event", Resource: "event", Action: "read"},
		{Code: "event.update", Name: "Update Event", Resource: "event", Action: "update"},
		{Code: "event.delete", Name: "Delete Event", Resource: "event", Action: "delete"},

		// Schedule permissions
		{Code: "schedule.create", Name: "Create Schedule", Resource: "schedule", Action: "create"},
		{Code: "schedule.read", Name: "Read Schedule", Resource: "schedule", Action: "read"},
		{Code: "schedule.update", Name: "Update Schedule", Resource: "schedule", Action: "update"},
		{Code: "schedule.delete", Name: "Delete Schedule", Resource: "schedule", Action: "delete"},

		// Order permissions
		{Code: "order.create", Name: "Create Order", Resource: "order", Action: "create"},
		{Code: "order.read", Name: "Read Order", Resource: "order", Action: "read"},
		{Code: "order.update", Name: "Update Order", Resource: "order", Action: "update"},
		{Code: "order.delete", Name: "Delete Order", Resource: "order", Action: "delete"},

		// User permissions
		{Code: "user.create", Name: "Create User", Resource: "user", Action: "create"},
		{Code: "user.read", Name: "Read User", Resource: "user", Action: "read"},
		{Code: "user.update", Name: "Update User", Resource: "user", Action: "update"},
		{Code: "user.delete", Name: "Delete User", Resource: "user", Action: "delete"},

		// Menu permissions
		{Code: "menu.read", Name: "Read Menu", Resource: "menu", Action: "read"},
		{Code: "menu.create", Name: "Create Menu", Resource: "menu", Action: "create"},
		{Code: "menu.update", Name: "Update Menu", Resource: "menu", Action: "update"},
		{Code: "menu.delete", Name: "Delete Menu", Resource: "menu", Action: "delete"},

		// Role permissions
		{Code: "role.read", Name: "Read Role", Resource: "role", Action: "read"},
		{Code: "role.create", Name: "Create Role", Resource: "role", Action: "create"},
		{Code: "role.update", Name: "Update Role", Resource: "role", Action: "update"},
		{Code: "role.delete", Name: "Delete Role", Resource: "role", Action: "delete"},

		// Check-in permissions
		{Code: "checkin.read", Name: "Read Check-in", Resource: "checkin", Action: "read"},
		{Code: "checkin.create", Name: "Create Check-in", Resource: "checkin", Action: "create"},

		// Attendee permissions
		{Code: "attendee.read", Name: "Read Attendee", Resource: "attendee", Action: "read"},
		{Code: "attendee.export", Name: "Export Attendee", Resource: "attendee", Action: "export"},

		// Gate permissions
		{Code: "gate.create", Name: "Create Gate", Resource: "gate", Action: "create"},
		{Code: "gate.read", Name: "Read Gate", Resource: "gate", Action: "read"},
		{Code: "gate.update", Name: "Update Gate", Resource: "gate", Action: "update"},
		{Code: "gate.delete", Name: "Delete Gate", Resource: "gate", Action: "delete"},
	}

	createdCount := 0
	skippedCount := 0

	for _, p := range permissions {
		// Check if permission already exists
		var existingPermission permission.Permission
		result := database.DB.Where("code = ?", p.Code).First(&existingPermission)

		if result.Error != nil {
			// Check if error is "record not found" - means permission doesn't exist
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Permission doesn't exist, create it
				if err := database.DB.Create(&p).Error; err != nil {
					return err
				}
				log.Printf("[Permission Seeder] Created permission: %s", p.Code)
				createdCount++
			} else {
				// Other database error
				return result.Error
			}
		} else {
			// Permission exists, skip
			log.Printf("[Permission Seeder] Permission %s already exists, skipping...", p.Code)
			skippedCount++
		}
	}

	log.Printf("[Permission Seeder] Permissions seeded successfully. Created: %d, Skipped: %d", createdCount, skippedCount)
	return nil
}
