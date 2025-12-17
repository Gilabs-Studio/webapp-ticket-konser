package orderitem

import (
	"errors"

	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	orderitemrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order_item"
	orderrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order"
	ticketcategoryrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/ticket_category"
	"gorm.io/gorm"
)

var (
	ErrOrderItemNotFound    = errors.New("order item not found")
	ErrOrderNotFound        = errors.New("order not found")
	ErrOrderNotPaid         = errors.New("order is not paid")
	ErrTicketsAlreadyGenerated = errors.New("tickets already generated for this order")
	ErrInvalidCategory      = errors.New("invalid ticket category")
)

type Service struct {
	orderItemRepo     orderitemrepo.Repository
	orderRepo         orderrepo.Repository
	ticketCategoryRepo ticketcategoryrepo.Repository
}

func NewService(
	orderItemRepo orderitemrepo.Repository,
	orderRepo orderrepo.Repository,
	ticketCategoryRepo ticketcategoryrepo.Repository,
) *Service {
	return &Service{
		orderItemRepo:     orderItemRepo,
		orderRepo:         orderRepo,
		ticketCategoryRepo: ticketCategoryRepo,
	}
}

// GetByID returns an order item by ID
func (s *Service) GetByID(id string) (*orderitem.OrderItemResponse, error) {
	oi, err := s.orderItemRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderItemNotFound
		}
		return nil, err
	}
	return oi.ToOrderItemResponse(), nil
}

// GetByQRCode returns an order item by QR code
func (s *Service) GetByQRCode(qrCode string) (*orderitem.OrderItemResponse, error) {
	oi, err := s.orderItemRepo.FindByQRCode(qrCode)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderItemNotFound
		}
		return nil, err
	}
	return oi.ToOrderItemResponse(), nil
}

// GetByOrderID returns order items by order ID
func (s *Service) GetByOrderID(orderID string) ([]*orderitem.OrderItemResponse, error) {
	items, err := s.orderItemRepo.FindByOrderID(orderID)
	if err != nil {
		return nil, err
	}

	responses := make([]*orderitem.OrderItemResponse, len(items))
	for i, item := range items {
		responses[i] = item.ToOrderItemResponse()
	}
	return responses, nil
}

// GenerateTickets generates tickets (order items) for an order
// This creates order items based on the order's ticket categories
func (s *Service) GenerateTickets(orderID string, categories []string, quantities []int) ([]*orderitem.OrderItemResponse, error) {
	// Validate order exists and is paid
	o, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	// Check if order is paid
	// PaymentStatus is string type, check if equals "PAID"
	if o.PaymentStatus != "PAID" {
		return nil, ErrOrderNotPaid
	}

	// Check if tickets already exist
	existingItems, err := s.orderItemRepo.FindByOrderID(orderID)
	if err != nil {
		return nil, err
	}
	if len(existingItems) > 0 {
		return nil, ErrTicketsAlreadyGenerated
	}

	// Validate categories and quantities match
	if len(categories) != len(quantities) {
		return nil, errors.New("categories and quantities must have the same length")
	}

	// Generate order items
	var generatedItems []*orderitem.OrderItem
	for i, categoryID := range categories {
		quantity := quantities[i]
		if quantity <= 0 {
			continue
		}

		// Validate category exists
		_, err := s.ticketCategoryRepo.FindByID(categoryID)
		if err != nil {
			return nil, ErrInvalidCategory
		}

		// Create order items for this category (one per ticket)
		for j := 0; j < quantity; j++ {
			oi := &orderitem.OrderItem{
				OrderID:    orderID,
				CategoryID: categoryID,
				Status:     orderitem.TicketStatusPaid, // Set as paid since order is paid
			}

			if err := s.orderItemRepo.Create(oi); err != nil {
				return nil, err
			}

			// Reload to get QR code
			createdItem, err := s.orderItemRepo.FindByID(oi.ID)
			if err != nil {
				return nil, err
			}

			generatedItems = append(generatedItems, createdItem)
		}
	}

	// Convert to responses
	responses := make([]*orderitem.OrderItemResponse, len(generatedItems))
	for i, item := range generatedItems {
		responses[i] = item.ToOrderItemResponse()
	}

	return responses, nil
}

// Update updates an order item
func (s *Service) Update(id string, req *orderitem.UpdateOrderItemRequest) (*orderitem.OrderItemResponse, error) {
	oi, err := s.orderItemRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderItemNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Status != nil {
		oi.Status = *req.Status
	}
	if req.CheckInTime != nil {
		oi.CheckInTime = req.CheckInTime
	}

	if err := s.orderItemRepo.Update(oi); err != nil {
		return nil, err
	}

	// Reload
	updatedItem, err := s.orderItemRepo.FindByID(oi.ID)
	if err != nil {
		return nil, err
	}

	return updatedItem.ToOrderItemResponse(), nil
}

// Delete deletes an order item
func (s *Service) Delete(id string) error {
	_, err := s.orderItemRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrOrderItemNotFound
		}
		return err
	}

	return s.orderItemRepo.Delete(id)
}

