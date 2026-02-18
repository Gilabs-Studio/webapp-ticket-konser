package role_permission

import (
"log"

"github.com/gilabs/webapp-ticket-konser/api/internal/database"
"github.com/gilabs/webapp-ticket-konser/api/internal/domain/permission"
"github.com/gilabs/webapp-ticket-konser/api/internal/domain/role"
)

// Seed seeds role-permission relationships
func Seed() error {
// 1. Assign all permissions to Admin
if err := assignAllToAdmin(); err != nil {
return err
}

// 2. Assign specific permissions to Staff Ticket
if err := assignToStaffTicket(); err != nil {
return err
}

// 3. Assign gatekeeper permissions (optional role)
if err := assignToGatekeeper(); err != nil {
return err
}

log.Println("[Role Permission Seeder] Role permissions seeded successfully")
return nil
}

func assignAllToAdmin() error {
var adminRole role.Role
if err := database.DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
log.Printf("[Role Permission Seeder] Admin role not found: %v", err)
return err
}

var allPermissions []permission.Permission
if err := database.DB.Find(&allPermissions).Error; err != nil {
return err
}

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
assignedCount++
} else {
skippedCount++
}
}
log.Printf("[Role Permission Seeder] Admin role: Assigned %d new permissions, Skipped %d existing permissions", assignedCount, skippedCount)
return nil
}

func assignToStaffTicket() error {
var staffRole role.Role
if err := database.DB.Where("code = ?", "staff_ticket").First(&staffRole).Error; err != nil {
log.Printf("[Role Permission Seeder] Staff Ticket role not found: %v", err)
return err
}

staffPermissions := []string{
"checkin.read",
"checkin.create",
"ticket.read",
"event.read",
"ticket_category.read",
"schedule.read",
"gate.read",
"dashboard.read",
}

assignedCount := 0
skippedCount := 0

for _, code := range staffPermissions {
var p permission.Permission
if err := database.DB.Where("code = ?", code).First(&p).Error; err != nil {
log.Printf("[Role Permission Seeder] Permission %s not found, skipping...", code)
continue
}

var count int64
database.DB.Model(&role.RolePermission{}).
Where("role_id = ? AND permission_id = ?", staffRole.ID, p.ID).
Count(&count)

if count == 0 {
rp := role.RolePermission{
RoleID:       staffRole.ID,
PermissionID: p.ID,
}
if err := database.DB.Create(&rp).Error; err != nil {
return err
}
log.Printf("[Role Permission Seeder] Assigned permission %s to staff_ticket role", code)
assignedCount++
} else {
skippedCount++
}
}

log.Printf("[Role Permission Seeder] Staff Ticket role: Assigned %d new permissions, Skipped %d existing permissions", assignedCount, skippedCount)
return nil
}

// assignToGatekeeper assigns minimal scanning permissions to the gatekeeper role.
// This role is optional — older databases may not have it yet.
func assignToGatekeeper() error {
var gatekeeperRole role.Role
if database.DB.Where("code = ?", "gatekeeper").First(&gatekeeperRole).Error != nil {
log.Println("[Role Permission Seeder] Gatekeeper role not found, skipping...")
return nil
}

var allPermissions []permission.Permission
if err := database.DB.Find(&allPermissions).Error; err != nil {
return err
}

gatekeeperPerms := map[string]bool{
"attendee.read":  true,
"checkin.create": true,
}

gAssigned := 0
gSkipped := 0
for _, p := range allPermissions {
if !gatekeeperPerms[p.Code] {
continue
}

var count int64
database.DB.Model(&role.RolePermission{}).
Where("role_id = ? AND permission_id = ?", gatekeeperRole.ID, p.ID).
Count(&count)

if count == 0 {
rp := role.RolePermission{RoleID: gatekeeperRole.ID, PermissionID: p.ID}
if err := database.DB.Create(&rp).Error; err != nil {
return err
}
log.Printf("[Role Permission Seeder] Assigned permission %s to gatekeeper role", p.Code)
gAssigned++
} else {
gSkipped++
}
}
log.Printf("[Role Permission Seeder] Gatekeeper role: Assigned %d new permissions, Skipped %d existing permissions", gAssigned, gSkipped)
return nil
}
