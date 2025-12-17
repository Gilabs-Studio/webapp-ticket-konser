package role_permission

import (
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
)

// Seed seeds role-permission relationships
// Only assigns permissions to admin role (no new roles created)
func Seed() error {
	// Get admin role only
	var adminRole role.Role
	if err := database.DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
		log.Printf("⚠️  [Role Permission Seeder] Admin role not found: %v", err)
		log.Println("⚠️  [Role Permission Seeder] Please seed roles first before seeding role permissions")
		return err
	}

	// Get all permissions
	var allPermissions []permission.Permission
	if err := database.DB.Find(&allPermissions).Error; err != nil {
		return err
	}

	if len(allPermissions) == 0 {
		log.Println("⚠️  [Role Permission Seeder] No permissions found, skipping...")
		log.Println("⚠️  [Role Permission Seeder] Please seed permissions first before seeding role permissions")
		return nil
	}

	// Admin gets all permissions (including ticket_category, schedule, event, order, ticket, etc.)
	// This ensures admin has access to all features including:
	// - Ticket Category Management (create, read, update, delete)
	// - Schedule Management (create, read, update, delete)
	// - Event Management
	// - Order Management
	// - E-Ticket Management (generate, view, update, delete)
	// - And all other permissions
	assignedCount := 0
	skippedCount := 0
	for _, p := range allPermissions {
		var count int64
		database.DB.Model(&role.RolePermission{}).
			Where("role_id = ? AND permission_id = ?", adminRole.ID, p.ID).
			Count(&count)

		if count == 0 {
			rp := role.RolePermission{
				RoleID:       adminRole.ID,
				PermissionID: p.ID,
			}
			if err := database.DB.Create(&rp).Error; err != nil {
				return err
			}
			log.Printf("[Role Permission Seeder] ✅ Assigned permission %s to admin role", p.Code)
			assignedCount++
		} else {
			skippedCount++
		}
	}
	log.Printf("[Role Permission Seeder] Admin role: Assigned %d new permissions, Skipped %d existing permissions", assignedCount, skippedCount)
	log.Println("[Role Permission Seeder] ✅ Role permissions seeded successfully")
	return nil
}
