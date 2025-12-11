package role_permission

import (
	"log"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
)

// Seed seeds role-permission relationships
func Seed() error {
	// Get roles
	var adminRole, staffTicketRole role.Role
	if err := database.DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "staff_ticket").First(&staffTicketRole).Error; err != nil {
		return err
	}

	// Get all permissions
	var allPermissions []permission.Permission
	if err := database.DB.Find(&allPermissions).Error; err != nil {
		return err
	}

	// Admin gets all permissions
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
			log.Printf("[Role Permission Seeder] Assigned permission %s to admin role", p.Code)
			assignedCount++
		} else {
			skippedCount++
		}
	}
	log.Printf("[Role Permission Seeder] Admin role: Assigned %d new permissions, Skipped %d existing permissions", assignedCount, skippedCount)

	// Staff ticket gets only ticket permissions
	ticketPermissions := []string{"ticket.create", "ticket.read", "ticket.update", "ticket.delete"}
	for _, permCode := range ticketPermissions {
		var p permission.Permission
		if err := database.DB.Where("code = ?", permCode).First(&p).Error; err != nil {
			continue
		}

		var count int64
		database.DB.Model(&role.RolePermission{}).
			Where("role_id = ? AND permission_id = ?", staffTicketRole.ID, p.ID).
			Count(&count)

		if count == 0 {
			rp := role.RolePermission{
				RoleID:       staffTicketRole.ID,
				PermissionID: p.ID,
			}
			if err := database.DB.Create(&rp).Error; err != nil {
				return err
			}
			log.Printf("[Role Permission Seeder] Assigned permission %s to staff_ticket role", p.Code)
		}
	}

	log.Println("[Role Permission Seeder] Role permissions seeded successfully")
	return nil
}



