package orderitem

import (
	"fmt"
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	ticketcategory "github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
	orderitemrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order_item"
	orderrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order"
	ticketcategoryrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/ticket_category"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
	db               *gorm.DB
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
		db:               database.DB,
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
	// Validate categories and quantities match
	if len(categories) != len(quantities) {
		return nil, errors.New("categories and quantities must have the same length")
	}

	// Start transaction + lock the order row to prevent concurrent ticket generation
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Lock order row
	var lockedOrder order.Order
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", orderID).First(&lockedOrder).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	// Check if order is paid
	if lockedOrder.PaymentStatus != order.PaymentStatusPaid {
		tx.Rollback()
		return nil, ErrOrderNotPaid
	}

	// Check if tickets already exist (within the same tx)
	var existingCount int64
	if err := tx.Model(&orderitem.OrderItem{}).Where("order_id = ?", orderID).Count(&existingCount).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if existingCount > 0 {
		tx.Rollback()
		return nil, ErrTicketsAlreadyGenerated
	}

	// Validate categories exist (single query)
	uniqueCategoryIDs := make(map[string]struct{}, len(categories))
	for _, id := range categories {
		uniqueCategoryIDs[id] = struct{}{}
	}
	categoryIDs := make([]string, 0, len(uniqueCategoryIDs))
	for id := range uniqueCategoryIDs {
		categoryIDs = append(categoryIDs, id)
	}
	if len(categoryIDs) > 0 {
		var categoryCount int64
		if err := tx.Model(&ticketcategory.TicketCategory{}).Where("id IN ?", categoryIDs).Count(&categoryCount).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
		if int(categoryCount) != len(categoryIDs) {
			tx.Rollback()
			return nil, ErrInvalidCategory
		}
	}

	// Build items for batch insert
	items := make([]orderitem.OrderItem, 0, 16)
	for i, categoryID := range categories {
		quantity := quantities[i]
		if quantity <= 0 {
			continue
		}
		for j := 0; j < quantity; j++ {
			items = append(items, orderitem.OrderItem{
				OrderID:    orderID,
				CategoryID: categoryID,
				Status:     orderitem.TicketStatusPaid,
			})
		}
	}

	if len(items) == 0 {
		tx.Rollback()
		return nil, fmt.Errorf("no tickets to generate")
	}

	// Batch create (use conservative batch size)
	if err := tx.CreateInBatches(&items, 100).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Fetch created tickets once with preloads for response
	var created []*orderitem.OrderItem
	if err := tx.Where("order_id = ?", orderID).
		Preload("Order").
		Preload("Category").
		Order("created_at ASC").
		Find(&created).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	responses := make([]*orderitem.OrderItemResponse, len(created))
	for i, item := range created {
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

