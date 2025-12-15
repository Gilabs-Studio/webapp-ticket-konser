package dashboard

import (
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/dashboard"
	dashboardrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/dashboard"
)

type Service struct {
	repo dashboardrepo.Repository
}

func NewService(repo dashboardrepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetSalesOverview gets sales overview
func (s *Service) GetSalesOverview(filters *dashboard.DashboardFilters) (*dashboard.SalesOverview, error) {
	return s.repo.GetSalesOverview(filters.StartDate, filters.EndDate, filters.EventID)
}

// GetCheckInOverview gets check-in overview
func (s *Service) GetCheckInOverview(filters *dashboard.DashboardFilters) (*dashboard.CheckInOverview, error) {
	return s.repo.GetCheckInOverview(filters.StartDate, filters.EndDate, filters.EventID)
}

// GetQuotaOverview gets quota overview
func (s *Service) GetQuotaOverview(filters *dashboard.DashboardFilters) (*dashboard.QuotaOverview, error) {
	return s.repo.GetQuotaOverview(filters.EventID)
}

// GetGateActivity gets gate activity
func (s *Service) GetGateActivity(filters *dashboard.DashboardFilters) ([]*dashboard.GateActivity, error) {
	return s.repo.GetGateActivity(filters.GateID)
}

// GetBuyerList gets buyer list
func (s *Service) GetBuyerList(filters *dashboard.DashboardFilters) ([]*dashboard.BuyerSummary, error) {
	return s.repo.GetBuyerList(filters.StartDate, filters.EndDate, filters.EventID)
}

// GetDashboardOverview gets complete dashboard overview
func (s *Service) GetDashboardOverview(filters *dashboard.DashboardFilters) (*dashboard.DashboardOverview, error) {
	sales, err := s.GetSalesOverview(filters)
	if err != nil {
		return nil, err
	}

	checkIns, err := s.GetCheckInOverview(filters)
	if err != nil {
		return nil, err
	}

	quota, err := s.GetQuotaOverview(filters)
	if err != nil {
		return nil, err
	}

	gates, err := s.GetGateActivity(filters)
	if err != nil {
		return nil, err
	}

	buyers, err := s.GetBuyerList(filters)
	if err != nil {
		return nil, err
	}

	// Convert pointer slices to non-pointer slices
	gatesList := make([]dashboard.GateActivity, len(gates))
	for i, g := range gates {
		gatesList[i] = *g
	}

	buyersList := make([]dashboard.BuyerSummary, len(buyers))
	for i, b := range buyers {
		buyersList[i] = *b
	}

	return &dashboard.DashboardOverview{
		Sales:    sales,
		CheckIns: checkIns,
		Quota:    quota,
		Gates:    gatesList,
		Buyers:   buyersList,
	}, nil
}
