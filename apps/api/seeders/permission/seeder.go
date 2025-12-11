package permission

import (
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
)

// Seed seeds initial permissions
func Seed() error {
	var count int64
	database.DB.Model(&permission.Permission{}).Count(&count)
	if count > 0 {
		log.Println("[Permission Seeder] Permissions already seeded, skipping...")
		return nil
	}

	permissions := []permission.Permission{
		// Ticket permissions
		{Code: "ticket.create", Name: "Create Ticket", Resource: "ticket", Action: "create"},
		{Code: "ticket.read", Name: "Read Ticket", Resource: "ticket", Action: "read"},
		{Code: "ticket.update", Name: "Update Ticket", Resource: "ticket", Action: "update"},
		{Code: "ticket.delete", Name: "Delete Ticket", Resource: "ticket", Action: "delete"},

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
	}

	for _, p := range permissions {
		if err := database.DB.Create(&p).Error; err != nil {
			return err
		}
		log.Printf("[Permission Seeder] Created permission: %s", p.Code)
	}

	log.Println("[Permission Seeder] Permissions seeded successfully")
	return nil
}


