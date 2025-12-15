package attendee

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/attendee"
	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	attendeeRepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/attendee"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new attendee repository
func NewRepository(db *gorm.DB) attendeeRepo.Repository {
	return &Repository{
		db: db,
	}
}

// mapTicketTier maps category name to ticket tier
func mapTicketTier(categoryName string) attendee.TicketTier {
	categoryName = strings.ToUpper(categoryName)
	if strings.Contains(categoryName, "VIP") {
		return attendee.TicketTierVIP
	}
	if strings.Contains(categoryName, "PREMIUM") {
		return attendee.TicketTierPremium
	}
	if strings.Contains(categoryName, "GENERAL") {
		return attendee.TicketTierGeneral
	}
	return attendee.TicketTierStandard
}

// mapAttendeeStatus maps order item status and check-in status to attendee status
func mapAttendeeStatus(orderItemStatus orderitem.TicketStatus, hasCheckIn bool) attendee.AttendeeStatus {
	if orderItemStatus == orderitem.TicketStatusCanceled {
		return attendee.AttendeeStatusCancelled
	}
	if hasCheckIn || orderItemStatus == orderitem.TicketStatusCheckedIn {
		return attendee.AttendeeStatusCheckedIn
	}
	return attendee.AttendeeStatusRegistered
}

// List lists attendees with pagination and filters
func (r *Repository) List(page, perPage int, filters map[string]interface{}) ([]*attendee.Attendee, int64, error) {
	var attendees []*attendee.Attendee
	var total int64

	// Build query with joins
	query := r.db.Table("order_items").
		Select(`
			order_items.id,
			orders.user_id,
			users.name,
			users.email,
			ticket_categories.category_name as ticket_type,
			ticket_categories.category_name,
			orders.created_at as registration_date,
			order_items.status as order_item_status,
			order_items.check_in_time,
			check_ins.checked_in_at,
			users.avatar_url,
			orders.id as order_id,
			order_items.id as order_item_id,
			order_items.qr_code,
			ticket_categories.id as category_id
		`).
		Joins("INNER JOIN orders ON order_items.order_id = orders.id").
		Joins("INNER JOIN users ON orders.user_id = users.id").
		Joins("INNER JOIN ticket_categories ON order_items.category_id = ticket_categories.id").
		Joins("LEFT JOIN check_ins ON order_items.id = check_ins.order_item_id AND check_ins.deleted_at IS NULL").
		Where("order_items.deleted_at IS NULL").
		Where("orders.deleted_at IS NULL").
		Where("users.deleted_at IS NULL").
		Where("order_items.status IN (?, ?, ?)", orderitem.TicketStatusPaid, orderitem.TicketStatusCheckedIn, orderitem.TicketStatusCanceled)

	// Apply filters
	if search, ok := filters["search"]; ok && search != nil && search.(string) != "" {
		searchStr := fmt.Sprintf("%%%s%%", search.(string))
		query = query.Where("(users.name ILIKE ? OR users.email ILIKE ? OR order_items.qr_code ILIKE ?)", searchStr, searchStr, searchStr)
	}

	if ticketTier, ok := filters["ticket_tier"]; ok && ticketTier != nil {
		tierStr := ticketTier.(attendee.TicketTier)
		// Map ticket tier to category name patterns
		switch tierStr {
		case attendee.TicketTierVIP:
			query = query.Where("ticket_categories.category_name ILIKE ?", "%VIP%")
		case attendee.TicketTierPremium:
			query = query.Where("ticket_categories.category_name ILIKE ?", "%PREMIUM%")
		case attendee.TicketTierGeneral:
			query = query.Where("ticket_categories.category_name ILIKE ?", "%GENERAL%")
		case attendee.TicketTierStandard:
			query = query.Where("ticket_categories.category_name NOT ILIKE ? AND ticket_categories.category_name NOT ILIKE ? AND ticket_categories.category_name NOT ILIKE ?", "%VIP%", "%PREMIUM%", "%GENERAL%")
		}
	}

	if status, ok := filters["status"]; ok && status != nil {
		statusStr := status.(attendee.AttendeeStatus)
		switch statusStr {
		case attendee.AttendeeStatusCancelled:
			query = query.Where("order_items.status = ?", orderitem.TicketStatusCanceled)
		case attendee.AttendeeStatusCheckedIn:
			query = query.Where("(order_items.status = ? OR check_ins.id IS NOT NULL)", orderitem.TicketStatusCheckedIn)
		case attendee.AttendeeStatusRegistered:
			query = query.Where("order_items.status = ? AND check_ins.id IS NULL", orderitem.TicketStatusPaid)
		}
	}

	if startDate, ok := filters["start_date"]; ok && startDate != nil {
		query = query.Where("orders.created_at >= ?", startDate)
	}

	if endDate, ok := filters["end_date"]; ok && endDate != nil {
		query = query.Where("orders.created_at <= ?", endDate)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * perPage
	rows, err := query.
		Order("orders.created_at DESC").
		Offset(offset).
		Limit(perPage).
		Rows()

	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var a attendee.Attendee
		var orderItemStatus string
		var categoryName string
		var checkInTime sql.NullTime
		var checkInAt sql.NullTime

		err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.Name,
			&a.Email,
			&a.TicketType,
			&categoryName,
			&a.RegistrationDate,
			&orderItemStatus,
			&checkInTime,
			&checkInAt,
			&a.AvatarURL,
			&a.OrderID,
			&a.OrderItemID,
			&a.QRCode,
			&a.CategoryID,
		)
		if err != nil {
			return nil, 0, err
		}

		// Map ticket tier
		a.TicketTier = mapTicketTier(categoryName)

		// Set checked in at (prefer check_ins.checked_in_at, fallback to order_items.check_in_time)
		if checkInAt.Valid {
			a.CheckedInAt = &checkInAt.Time
		} else if checkInTime.Valid {
			a.CheckedInAt = &checkInTime.Time
		}

		// Map status
		hasCheckIn := a.CheckedInAt != nil
		a.Status = mapAttendeeStatus(orderitem.TicketStatus(orderItemStatus), hasCheckIn)

		attendees = append(attendees, &a)
	}

	return attendees, total, nil
}

// GetStatistics gets attendee statistics
func (r *Repository) GetStatistics(filters map[string]interface{}) (*attendee.AttendeeStatistics, error) {
	stats := &attendee.AttendeeStatistics{
		ByTicketTier: make(map[string]int64),
	}

	// Base query
	query := r.db.Table("order_items").
		Joins("INNER JOIN orders ON order_items.order_id = orders.id").
		Joins("INNER JOIN users ON orders.user_id = users.id").
		Joins("INNER JOIN ticket_categories ON order_items.category_id = ticket_categories.id").
		Joins("LEFT JOIN check_ins ON order_items.id = check_ins.order_item_id AND check_ins.deleted_at IS NULL").
		Where("order_items.deleted_at IS NULL").
		Where("orders.deleted_at IS NULL").
		Where("users.deleted_at IS NULL").
		Where("order_items.status IN (?, ?, ?)", orderitem.TicketStatusPaid, orderitem.TicketStatusCheckedIn, orderitem.TicketStatusCanceled)

	// Apply filters (same as List)
	if startDate, ok := filters["start_date"]; ok && startDate != nil {
		query = query.Where("orders.created_at >= ?", startDate)
	}
	if endDate, ok := filters["end_date"]; ok && endDate != nil {
		query = query.Where("orders.created_at <= ?", endDate)
	}

	// Total attendees
	if err := query.Count(&stats.TotalAttendees).Error; err != nil {
		return nil, err
	}

	// Checked in count
	checkedInQuery := query.Where("(order_items.status = ? OR check_ins.id IS NOT NULL)", orderitem.TicketStatusCheckedIn)
	if err := checkedInQuery.Count(&stats.CheckedInCount).Error; err != nil {
		return nil, err
	}

	// Registered count (paid but not checked in)
	registeredQuery := query.Where("order_items.status = ? AND check_ins.id IS NULL", orderitem.TicketStatusPaid)
	if err := registeredQuery.Count(&stats.RegisteredCount).Error; err != nil {
		return nil, err
	}

	// Cancelled count
	cancelledQuery := query.Where("order_items.status = ?", orderitem.TicketStatusCanceled)
	if err := cancelledQuery.Count(&stats.CancelledCount).Error; err != nil {
		return nil, err
	}

	// By ticket tier
	tierQuery := query.Select("ticket_categories.category_name, COUNT(*) as count").
		Group("ticket_categories.category_name")

	rows, err := tierQuery.Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var categoryName string
		var count int64
		if err := rows.Scan(&categoryName, &count); err != nil {
			return nil, err
		}
		tier := mapTicketTier(categoryName)
		stats.ByTicketTier[string(tier)] = count
	}

	return stats, nil
}

// Export exports attendees to CSV format
func (r *Repository) Export(filters map[string]interface{}) ([][]string, error) {
	// Get all attendees (no pagination for export)
	attendees, _, err := r.List(1, 10000, filters) // Large limit for export
	if err != nil {
		return nil, err
	}

	// CSV header
	result := [][]string{
		{"ID", "Name", "Email", "Ticket Type", "Ticket Tier", "Registration Date", "Status", "Checked In At"},
	}

	// CSV rows
	for _, a := range attendees {
		checkedInAt := ""
		if a.CheckedInAt != nil {
			checkedInAt = a.CheckedInAt.Format("2006-01-02 15:04:05")
		}
		result = append(result, []string{
			a.ID,
			a.Name,
			a.Email,
			a.TicketType,
			string(a.TicketTier),
			a.RegistrationDate.Format("2006-01-02 15:04:05"),
			string(a.Status),
			checkedInAt,
		})
	}

	return result, nil
}
