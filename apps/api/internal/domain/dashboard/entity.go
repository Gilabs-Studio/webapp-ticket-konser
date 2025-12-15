package dashboard

import (
	"time"
)

// DashboardOverview represents dashboard overview response
type DashboardOverview struct {
	Sales   *SalesOverview   `json:"sales,omitempty"`
	CheckIns *CheckInOverview `json:"check_ins,omitempty"`
	Quota   *QuotaOverview   `json:"quota,omitempty"`
	Gates   []GateActivity   `json:"gates,omitempty"`
	Buyers  []BuyerSummary   `json:"buyers,omitempty"`
}

// SalesOverview represents sales overview
type SalesOverview struct {
	TotalRevenue       float64 `json:"total_revenue"`
	TotalRevenueFormatted string `json:"total_revenue_formatted"`
	TotalOrders        int     `json:"total_orders"`
	PaidOrders         int     `json:"paid_orders"`
	UnpaidOrders       int     `json:"unpaid_orders"`
	FailedOrders       int     `json:"failed_orders"`
	CanceledOrders     int     `json:"canceled_orders"`
	RefundedOrders     int     `json:"refunded_orders"`
	ChangePercent      float64 `json:"change_percent"`
	Period             Period  `json:"period"`
}

// CheckInOverview represents check-in overview
type CheckInOverview struct {
	TotalCheckIns      int     `json:"total_check_ins"`
	CheckedIn          int     `json:"checked_in"`
	NotCheckedIn      int     `json:"not_checked_in"`
	CheckInRate        float64 `json:"check_in_rate"`
	ChangePercent      float64 `json:"change_percent"`
	Period             Period  `json:"period"`
}

// QuotaOverview represents quota overview
type QuotaOverview struct {
	TotalQuota        int          `json:"total_quota"`
	Sold              int          `json:"sold"`
	Remaining         int          `json:"remaining"`
	UtilizationRate   float64      `json:"utilization_rate"`
	ByTier            []QuotaByTier `json:"by_tier"`
}

// QuotaByTier represents quota by tier
type QuotaByTier struct {
	TierID           string  `json:"tier_id"`
	TierName         string  `json:"tier_name"`
	TotalQuota       int     `json:"total_quota"`
	Sold             int     `json:"sold"`
	Remaining        int     `json:"remaining"`
	UtilizationRate  float64 `json:"utilization_rate"`
}

// GateActivity represents gate activity
type GateActivity struct {
	GateID         string     `json:"gate_id"`
	GateName       string     `json:"gate_name"`
	TotalCheckIns  int        `json:"total_check_ins"`
	LastCheckIn    *time.Time `json:"last_check_in,omitempty"`
	Status         string     `json:"status"` // active, inactive
}

// BuyerSummary represents buyer summary
type BuyerSummary struct {
	UserID         string     `json:"user_id"`
	Name           string     `json:"name"`
	Email          string     `json:"email"`
	TotalOrders    int        `json:"total_orders"`
	TotalSpent     float64    `json:"total_spent"`
	LastOrderDate  *time.Time `json:"last_order_date,omitempty"`
}

// Period represents time period
type Period struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

// DashboardFilters represents dashboard filters
type DashboardFilters struct {
	StartDate *time.Time `form:"start_date" binding:"omitempty"`
	EndDate   *time.Time `form:"end_date" binding:"omitempty"`
	EventID   string     `form:"event_id" binding:"omitempty,uuid"`
	GateID    string     `form:"gate_id" binding:"omitempty,uuid"`
}
