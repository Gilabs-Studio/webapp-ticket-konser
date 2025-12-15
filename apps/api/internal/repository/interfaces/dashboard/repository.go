package dashboard

import (
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/dashboard"
)

// Repository defines the interface for dashboard repository operations
type Repository interface {
	// GetSalesOverview gets sales overview statistics
	GetSalesOverview(startDate, endDate *time.Time, eventID string) (*dashboard.SalesOverview, error)
	
	// GetCheckInOverview gets check-in overview statistics
	GetCheckInOverview(startDate, endDate *time.Time, eventID string) (*dashboard.CheckInOverview, error)
	
	// GetQuotaOverview gets quota overview statistics
	GetQuotaOverview(eventID string) (*dashboard.QuotaOverview, error)
	
	// GetGateActivity gets gate activity statistics
	GetGateActivity(gateID string) ([]*dashboard.GateActivity, error)
	
	// GetBuyerList gets buyer list with statistics
	GetBuyerList(startDate, endDate *time.Time, eventID string) ([]*dashboard.BuyerSummary, error)
}
