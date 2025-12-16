package seeders

import (
	"log"

	authseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/auth"
	eventseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/event"
	gateseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/gate"
	menuseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/menu"
	merchandiseseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/merchandise"
	orderitemseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/order_item"
	orderseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/order"
	permissionseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/permission"
	roleseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/role"
	rolepermissionseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/role_permission"
	scheduleseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/schedule"
	ticketcategoryseeder "github.com/gilabs/webapp-ticket-konser/api/seeders/ticket_category"
)

// SeedAll runs all seeders in the correct order
// This function orchestrates all module seeders in the proper dependency order
//
// Dependency order:
// 1. Roles (no dependencies) - required for users and role_permissions
// 2. Permissions (no dependencies) - required for role_permissions and menus
// 3. Role Permissions (depends on: roles, permissions) - links roles to permissions
// 4. Menus (depends on: permissions) - validates permission_code exists
// 5. Users/Auth (depends on: roles) - requires roles to exist
// 6. Events (no dependencies) - required for schedules and ticket_categories
// 7. Ticket Categories (depends on: events) - requires events to exist
// 8. Schedules (depends on: events) - requires events to exist
//
// Note: All seeders use upsert logic (create if not exists, skip if exists)
// This allows safe re-running of seeders without duplicating data
func SeedAll() error {
	log.Println("=========================================")
	log.Println("Starting database seeding...")
	log.Println("=========================================")

	// Step 1: Seed roles first (required for users and role_permissions)
	log.Println("\n[Step 1/11] Seeding roles...")
	if err := roleseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding roles: %v", err)
		return err
	}

	// Step 2: Seed permissions (required for role_permissions and menus)
	log.Println("\n[Step 2/11] Seeding permissions...")
	if err := permissionseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding permissions: %v", err)
		return err
	}

	// Step 3: Seed role permissions (requires roles and permissions)
	log.Println("\n[Step 3/11] Seeding role permissions...")
	if err := rolepermissionseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding role permissions: %v", err)
		return err
	}

	// Step 4: Seed menus (requires permissions for validation)
	log.Println("\n[Step 4/11] Seeding menus...")
	if err := menuseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding menus: %v", err)
		return err
	}

	// Step 5: Seed users (requires roles)
	log.Println("\n[Step 5/11] Seeding users...")
	if err := authseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding users: %v", err)
		return err
	}

	// Step 6: Seed events (no dependencies, but required for schedules and ticket_categories)
	log.Println("\n[Step 6/11] Seeding events...")
	if err := eventseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding events: %v", err)
		return err
	}

	// Step 7: Seed ticket categories (requires events)
	log.Println("\n[Step 7/11] Seeding ticket categories...")
	if err := ticketcategoryseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding ticket categories: %v", err)
		return err
	}

	// Step 8: Seed schedules (requires events)
	log.Println("\n[Step 8/11] Seeding schedules...")
	if err := scheduleseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding schedules: %v", err)
		return err
	}

	// Step 9: Seed orders (requires users and schedules)
	log.Println("\n[Step 9/11] Seeding orders...")
	if err := orderseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding orders: %v", err)
		return err
	}

	// Step 10: Seed order items (tickets) (requires orders and ticket categories)
	log.Println("\n[Step 10/12] Seeding order items (tickets)...")
	if err := orderitemseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding order items: %v", err)
		return err
	}

	// Step 11: Seed merchandise (requires events)
	log.Println("\n[Step 10/11] Seeding merchandise...")
	if err := merchandiseseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding merchandise: %v", err)
		return err
	}

	// Step 12: Seed gates (no dependencies)
	log.Println("\n[Step 12/12] Seeding gates...")
	if err := gateseeder.Seed(); err != nil {
		log.Printf("❌ Error seeding gates: %v", err)
		return err
	}

	log.Println("\n=========================================")
	log.Println("✅ All seeders completed successfully!")
	log.Println("=========================================")
	return nil
}
