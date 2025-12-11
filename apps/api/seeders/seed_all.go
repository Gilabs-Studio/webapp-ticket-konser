package seeders

import (
	"log"

	authseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/auth"
	menuseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/menu"
	permissionseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/permission"
	roleseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/role"
	rolepermissionseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/role_permission"
)

// SeedAll runs all seeders in the correct order
// This function orchestrates all module seeders in the proper dependency order
func SeedAll() error {
	log.Println("Starting database seeding...")

	// Seed roles first (required for permissions and users)
	log.Println("Seeding roles...")
	if err := roleseeder.Seed(); err != nil {
		return err
	}

	// Seed permissions (required for role_permissions)
	log.Println("Seeding permissions...")
	if err := permissionseeder.Seed(); err != nil {
		return err
	}

	// Seed role permissions (requires roles and permissions)
	log.Println("Seeding role permissions...")
	if err := rolepermissionseeder.Seed(); err != nil {
		return err
	}

	// Seed menus (requires permissions)
	log.Println("Seeding menus...")
	if err := menuseeder.Seed(); err != nil {
		return err
	}

	// Seed users (requires roles)
	log.Println("Seeding users...")
	if err := authseeder.Seed(); err != nil {
		return err
	}

	log.Println("All seeders completed successfully!")
	return nil
}

