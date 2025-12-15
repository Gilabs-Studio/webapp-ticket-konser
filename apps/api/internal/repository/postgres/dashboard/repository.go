package dashboard

import (
	"fmt"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/checkin"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/dashboard"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/gate"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	ticketcategory "github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
	dashboardrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/dashboard"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new dashboard repository
func NewRepository(db *gorm.DB) dashboardrepo.Repository {
	return &Repository{
		db: db,
	}
}

// GetSalesOverview gets sales overview statistics
func (r *Repository) GetSalesOverview(startDate, endDate *time.Time, eventID string) (*dashboard.SalesOverview, error) {
	query := r.db.Model(&order.Order{}).Where("deleted_at IS NULL")

	// Apply date filters
	if startDate != nil {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != nil {
		query = query.Where("created_at <= ?", endDate)
	}

	// Apply event filter (via schedule)
	if eventID != "" {
		query = query.Joins("JOIN schedules ON orders.schedule_id = schedules.id").
			Where("schedules.event_id = ?", eventID)
	}

	// Count orders by status
	var totalOrders int64
	var paidOrders int64
	var unpaidOrders int64
	var failedOrders int64
	var canceledOrders int64
	var refundedOrders int64

	if err := query.Count(&totalOrders).Error; err != nil {
		return nil, err
	}

	if err := query.Where("payment_status = ?", order.PaymentStatusPaid).Count(&paidOrders).Error; err != nil {
		return nil, err
	}

	if err := query.Where("payment_status = ?", order.PaymentStatusUnpaid).Count(&unpaidOrders).Error; err != nil {
		return nil, err
	}

	if err := query.Where("payment_status = ?", order.PaymentStatusFailed).Count(&failedOrders).Error; err != nil {
		return nil, err
	}

	if err := query.Where("payment_status = ?", order.PaymentStatusCanceled).Count(&canceledOrders).Error; err != nil {
		return nil, err
	}

	if err := query.Where("payment_status = ?", order.PaymentStatusRefunded).Count(&refundedOrders).Error; err != nil {
		return nil, err
	}

	// Calculate total revenue from paid orders
	var totalRevenue float64
	if err := query.Where("payment_status = ?", order.PaymentStatusPaid).
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&totalRevenue).Error; err != nil {
		return nil, err
	}

	// Format revenue
	revenueFormatted := fmt.Sprintf("Rp %.0f", totalRevenue)

	// Calculate period
	period := dashboard.Period{}
	if startDate != nil {
		period.StartDate = startDate.Format(time.RFC3339)
	} else {
		period.StartDate = time.Now().AddDate(0, 0, -30).Format(time.RFC3339)
	}
	if endDate != nil {
		period.EndDate = endDate.Format(time.RFC3339)
	} else {
		period.EndDate = time.Now().Format(time.RFC3339)
	}

	return &dashboard.SalesOverview{
		TotalRevenue:        totalRevenue,
		TotalRevenueFormatted: revenueFormatted,
		TotalOrders:         int(totalOrders),
		PaidOrders:          int(paidOrders),
		UnpaidOrders:        int(unpaidOrders),
		FailedOrders:        int(failedOrders),
		CanceledOrders:      int(canceledOrders),
		RefundedOrders:      int(refundedOrders),
		ChangePercent:       0, // TODO: Calculate when we have historical data
		Period:              period,
	}, nil
}

// GetCheckInOverview gets check-in overview statistics
func (r *Repository) GetCheckInOverview(startDate, endDate *time.Time, eventID string) (*dashboard.CheckInOverview, error) {
	// Get total order items (tickets issued)
	var totalTickets int64
	orderItemQuery := r.db.Model(&orderitem.OrderItem{}).Where("deleted_at IS NULL")
	
	if startDate != nil {
		orderItemQuery = orderItemQuery.Where("created_at >= ?", startDate)
	}
	if endDate != nil {
		orderItemQuery = orderItemQuery.Where("created_at <= ?", endDate)
	}

	// Apply event filter via order -> schedule
	if eventID != "" {
		orderItemQuery = orderItemQuery.
			Joins("JOIN orders ON order_items.order_id = orders.id").
			Joins("JOIN schedules ON orders.schedule_id = schedules.id").
			Where("schedules.event_id = ?", eventID)
	}

	if err := orderItemQuery.Count(&totalTickets).Error; err != nil {
		return nil, err
	}

	// Get checked in count
	var checkedInCount int64
	checkInQuery := r.db.Model(&checkin.CheckIn{}).Where("status = ?", checkin.CheckInStatusSuccess)
	
	if startDate != nil {
		checkInQuery = checkInQuery.Where("checked_in_at >= ?", startDate)
	}
	if endDate != nil {
		checkInQuery = checkInQuery.Where("checked_in_at <= ?", endDate)
	}

	// Apply event filter via order_item -> order -> schedule
	if eventID != "" {
		checkInQuery = checkInQuery.
			Joins("JOIN order_items ON check_ins.order_item_id = order_items.id").
			Joins("JOIN orders ON order_items.order_id = orders.id").
			Joins("JOIN schedules ON orders.schedule_id = schedules.id").
			Where("schedules.event_id = ?", eventID)
	}

	if err := checkInQuery.Count(&checkedInCount).Error; err != nil {
		return nil, err
	}

	notCheckedIn := int(totalTickets) - int(checkedInCount)
	checkInRate := 0.0
	if totalTickets > 0 {
		checkInRate = float64(checkedInCount) / float64(totalTickets) * 100.0
	}

	// Calculate period
	period := dashboard.Period{}
	if startDate != nil {
		period.StartDate = startDate.Format(time.RFC3339)
	} else {
		period.StartDate = time.Now().AddDate(0, 0, -30).Format(time.RFC3339)
	}
	if endDate != nil {
		period.EndDate = endDate.Format(time.RFC3339)
	} else {
		period.EndDate = time.Now().Format(time.RFC3339)
	}

	return &dashboard.CheckInOverview{
		TotalCheckIns: int(totalTickets),
		CheckedIn:     int(checkedInCount),
		NotCheckedIn: notCheckedIn,
		CheckInRate:   checkInRate,
		ChangePercent: 0, // TODO: Calculate when we have historical data
		Period:        period,
	}, nil
}

// GetQuotaOverview gets quota overview statistics
func (r *Repository) GetQuotaOverview(eventID string) (*dashboard.QuotaOverview, error) {
	query := r.db.Model(&ticketcategory.TicketCategory{}).Where("deleted_at IS NULL")
	
	if eventID != "" {
		query = query.Where("event_id = ?", eventID)
	}

	var categories []ticketcategory.TicketCategory
	if err := query.Find(&categories).Error; err != nil {
		return nil, err
	}

	totalQuota := 0
	totalSold := 0
	byTier := make([]dashboard.QuotaByTier, 0, len(categories))

	for _, cat := range categories {
		// Get sold count
		var soldCount int64
		if err := r.db.Model(&orderitem.OrderItem{}).
			Where("category_id = ?", cat.ID).
			Where("status IN ?", []orderitem.TicketStatus{
				orderitem.TicketStatusPaid,
				orderitem.TicketStatusCheckedIn,
			}).
			Count(&soldCount).Error; err != nil {
			return nil, err
		}

		sold := int(soldCount)
		remaining := cat.Quota - sold
		utilizationRate := 0.0
		if cat.Quota > 0 {
			utilizationRate = float64(sold) / float64(cat.Quota) * 100.0
		}

		totalQuota += cat.Quota
		totalSold += sold

		byTier = append(byTier, dashboard.QuotaByTier{
			TierID:          cat.ID,
			TierName:        cat.CategoryName,
			TotalQuota:      cat.Quota,
			Sold:            sold,
			Remaining:       remaining,
			UtilizationRate: utilizationRate,
		})
	}

	remaining := totalQuota - totalSold
	utilizationRate := 0.0
	if totalQuota > 0 {
		utilizationRate = float64(totalSold) / float64(totalQuota) * 100.0
	}

	return &dashboard.QuotaOverview{
		TotalQuota:      totalQuota,
		Sold:            totalSold,
		Remaining:       remaining,
		UtilizationRate: utilizationRate,
		ByTier:          byTier,
	}, nil
}

// GetGateActivity gets gate activity statistics
func (r *Repository) GetGateActivity(gateID string) ([]*dashboard.GateActivity, error) {
	query := r.db.Model(&gate.Gate{}).Where("deleted_at IS NULL")
	
	if gateID != "" {
		query = query.Where("id = ?", gateID)
	}

	var gates []gate.Gate
	if err := query.Find(&gates).Error; err != nil {
		return nil, err
	}

	activities := make([]*dashboard.GateActivity, 0, len(gates))
	for _, g := range gates {
		// Get check-in count for this gate
		var checkInCount int64
		if err := r.db.Model(&checkin.CheckIn{}).
			Where("gate_id = ?", g.ID).
			Where("status = ?", checkin.CheckInStatusSuccess).
			Count(&checkInCount).Error; err != nil {
			return nil, err
		}

		// Get last check-in time
		var lastCheckIn checkin.CheckIn
		var lastCheckInTime *time.Time
		if err := r.db.Where("gate_id = ?", g.ID).
			Where("status = ?", checkin.CheckInStatusSuccess).
			Order("checked_in_at DESC").
			First(&lastCheckIn).Error; err == nil {
			lastCheckInTime = &lastCheckIn.CheckedInAt
		}

		status := "active"
		if g.Status == gate.GateStatusInactive {
			status = "inactive"
		}

		activities = append(activities, &dashboard.GateActivity{
			GateID:        g.ID,
			GateName:      g.Name,
			TotalCheckIns: int(checkInCount),
			LastCheckIn:   lastCheckInTime,
			Status:        status,
		})
	}

	return activities, nil
}

// GetBuyerList gets buyer list with statistics
func (r *Repository) GetBuyerList(startDate, endDate *time.Time, eventID string) ([]*dashboard.BuyerSummary, error) {
	query := r.db.Model(&order.Order{}).
		Select("orders.user_id, users.name, users.email, COUNT(orders.id) as total_orders, COALESCE(SUM(CASE WHEN orders.payment_status = 'PAID' THEN orders.total_amount ELSE 0 END), 0) as total_spent, MAX(orders.created_at) as last_order_date").
		Joins("JOIN users ON orders.user_id = users.id").
		Where("orders.deleted_at IS NULL")

	// Apply date filters
	if startDate != nil {
		query = query.Where("orders.created_at >= ?", startDate)
	}
	if endDate != nil {
		query = query.Where("orders.created_at <= ?", endDate)
	}

	// Apply event filter
	if eventID != "" {
		query = query.Joins("JOIN schedules ON orders.schedule_id = schedules.id").
			Where("schedules.event_id = ?", eventID)
	}

	query = query.Group("orders.user_id, users.name, users.email")

	type BuyerResult struct {
		UserID        string
		Name          string
		Email         string
		TotalOrders   int64
		TotalSpent    float64
		LastOrderDate time.Time
	}

	var results []BuyerResult
	if err := query.Scan(&results).Error; err != nil {
		return nil, err
	}

	buyers := make([]*dashboard.BuyerSummary, 0, len(results))
	for _, result := range results {
		lastOrderDate := &result.LastOrderDate
		buyers = append(buyers, &dashboard.BuyerSummary{
			UserID:        result.UserID,
			Name:          result.Name,
			Email:         result.Email,
			TotalOrders:   int(result.TotalOrders),
			TotalSpent:    result.TotalSpent,
			LastOrderDate: lastOrderDate,
		})
	}

	return buyers, nil
}
