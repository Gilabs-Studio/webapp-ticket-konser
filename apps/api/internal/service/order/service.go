package order

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
	orderrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"gorm.io/gorm"
)

var (
	ErrOrderNotFound = errors.New("order not found")
)

type Service struct {
	repo orderrepo.Repository
}

func NewService(repo orderrepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetByID returns an order by ID
func (s *Service) GetByID(id string) (*order.OrderResponse, error) {
	o, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	return o.ToOrderResponse(), nil
}

// GetByOrderCode returns an order by order code
func (s *Service) GetByOrderCode(orderCode string) (*order.OrderResponse, error) {
	o, err := s.repo.FindByOrderCode(orderCode)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	return o.ToOrderResponse(), nil
}

// GetByUserID returns orders by user ID
func (s *Service) GetByUserID(userID string) ([]*order.OrderResponse, error) {
	orders, err := s.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*order.OrderResponse, len(orders))
	for i, o := range orders {
		responses[i] = o.ToOrderResponse()
	}
	return responses, nil
}

// List lists orders with pagination and filters
func (s *Service) List(req *order.ListOrdersRequest) ([]*order.OrderResponse, *response.PaginationMeta, error) {
	page := 1
	perPage := 20

	if req.Page > 0 {
		page = req.Page
	}
	if req.PerPage > 0 && req.PerPage <= 100 {
		perPage = req.PerPage
	}

	// Build filters
	filters := make(map[string]interface{})
	if req.PaymentStatus != "" {
		filters["payment_status"] = req.PaymentStatus
	}
	if req.UserID != "" {
		filters["user_id"] = req.UserID
	}
	if req.ScheduleID != "" {
		filters["schedule_id"] = req.ScheduleID
	}
	if req.StartDate != nil {
		filters["start_date"] = req.StartDate
	}
	if req.EndDate != nil {
		filters["end_date"] = req.EndDate
	}

	orders, total, err := s.repo.List(page, perPage, filters)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]*order.OrderResponse, len(orders))
	for i, o := range orders {
		responses[i] = o.ToOrderResponse()
	}

	pagination := response.NewPaginationMeta(page, perPage, int(total))

	return responses, pagination, nil
}

// Update updates an order
func (s *Service) Update(id string, req *order.UpdateOrderRequest) (*order.OrderResponse, error) {
	o, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	// Update fields
	if req.PaymentStatus != nil {
		o.PaymentStatus = *req.PaymentStatus
	}
	if req.PaymentMethod != nil {
		o.PaymentMethod = *req.PaymentMethod
	}
	if req.MidtransTransactionID != nil {
		o.MidtransTransactionID = *req.MidtransTransactionID
	}

	if err := s.repo.Update(o); err != nil {
		return nil, err
	}

	// Reload
	updatedOrder, err := s.repo.FindByID(o.ID)
	if err != nil {
		return nil, err
	}

	return updatedOrder.ToOrderResponse(), nil
}

// Delete deletes an order
func (s *Service) Delete(id string) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrOrderNotFound
		}
		return err
	}

	return s.repo.Delete(id)
}

// GetRecentOrders returns recent orders (for dashboard)
func (s *Service) GetRecentOrders(limit int) ([]*order.OrderResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	filters := make(map[string]interface{})
	orders, _, err := s.repo.List(1, limit, filters)
	if err != nil {
		return nil, err
	}

	responses := make([]*order.OrderResponse, len(orders))
	for i, o := range orders {
		responses[i] = o.ToOrderResponse()
	}

	return responses, nil
}


