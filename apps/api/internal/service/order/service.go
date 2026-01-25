package order

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/schedule"
	ticketcategory "github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
	"github.com/gilabs/webapp-ticket-konser/api/internal/integration/midtrans"
	orderrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order"
	orderitemrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order_item"
	schedulerepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/schedule"
	ticketcategoryrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/ticket_category"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrOrderNotFound          = errors.New("order not found")
	ErrScheduleNotFound       = errors.New("schedule not found")
	ErrTicketCategoryNotFound = errors.New("ticket category not found")
	ErrInsufficientQuota      = errors.New("insufficient quota")
	ErrInsufficientSeats      = errors.New("insufficient remaining seats")
	ErrUserNotFound           = errors.New("user not found")
)

type Service struct {
	repo               orderrepo.Repository
	ticketCategoryRepo ticketcategoryrepo.Repository
	scheduleRepo       schedulerepo.Repository
	orderItemRepo      orderitemrepo.Repository
	orderItemService   OrderItemServiceInterface
	db                 *gorm.DB
}

// OrderItemServiceInterface defines interface for OrderItemService to avoid circular dependency
type OrderItemServiceInterface interface {
	GenerateTickets(orderID string, categories []string, quantities []int) ([]*orderitem.OrderItemResponse, error)
}

func NewService(repo orderrepo.Repository, ticketCategoryRepo ticketcategoryrepo.Repository, scheduleRepo schedulerepo.Repository, orderItemRepo orderitemrepo.Repository, orderItemService OrderItemServiceInterface) *Service {
	return &Service{
		repo:               repo,
		ticketCategoryRepo: ticketCategoryRepo,
		scheduleRepo:       scheduleRepo,
		orderItemRepo:      orderItemRepo,
		orderItemService:   orderItemService,
		db:                 database.DB,
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

	resp := o.ToOrderResponse()

	// Include OrderItems jika order sudah PAID dan OrderItems sudah generated
	if o.PaymentStatus == order.PaymentStatusPaid {
		orderItems, err := s.orderItemRepo.FindByOrderID(id)
		if err == nil && len(orderItems) > 0 {
			// Convert OrderItems to map (without Order field to avoid circular reference)
			orderItemMaps := make([]map[string]interface{}, len(orderItems))
			for i, item := range orderItems {
				itemMap := map[string]interface{}{
					"id":            item.ID,
					"order_id":      item.OrderID,
					"category_id":   item.CategoryID,
					"qr_code":       item.QRCode,
					"status":        string(item.Status),
					"check_in_time": item.CheckInTime,
					"created_at":    item.CreatedAt,
					"updated_at":    item.UpdatedAt,
				}
				if item.Category != nil {
					itemMap["category"] = item.Category.ToTicketCategoryResponse()
				}
				orderItemMaps[i] = itemMap
			}
			resp.OrderItems = orderItemMaps
		}
	}

	return resp, nil
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
		o.MidtransTransactionID = req.MidtransTransactionID
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

// CreateOrder creates a new order with quota management and transaction lock
func (s *Service) CreateOrder(req *order.CreateOrderRequest, userID string) (*order.OrderResponse, error) {
	// Validate user exists before starting transaction
	var userExists bool
	if err := s.db.Raw("SELECT EXISTS(SELECT 1 FROM users WHERE id = ? AND deleted_at IS NULL)", userID).Scan(&userExists).Error; err != nil {
		return nil, fmt.Errorf("failed to validate user: %w", err)
	}
	if !userExists {
		return nil, ErrUserNotFound
	}

	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Lock ticket category untuk prevent race condition
	var ticketCategory ticketcategory.TicketCategory
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", req.TicketCategoryID).First(&ticketCategory).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTicketCategoryNotFound
		}
		return nil, err
	}

	// Check quota
	if ticketCategory.Quota < req.Quantity {
		tx.Rollback()
		return nil, ErrInsufficientQuota
	}

	// Lock schedule
	var schedule schedule.Schedule
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", req.ScheduleID).First(&schedule).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrScheduleNotFound
		}
		return nil, err
	}

	// Check remaining seats (note: field name is RemainingSeat, not RemainingSeats)
	if schedule.RemainingSeat < req.Quantity {
		tx.Rollback()
		return nil, ErrInsufficientSeats
	}

	// Calculate total amount
	totalAmount := ticketCategory.Price * float64(req.Quantity)

	// Decrement quota
	ticketCategory.Quota -= req.Quantity
	if err := tx.Save(&ticketCategory).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Decrement remaining seats
	schedule.RemainingSeat -= req.Quantity
	if err := tx.Save(&schedule).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Set payment expiration (15 minutes from now)
	paymentExpiresAt := time.Now().Add(15 * time.Minute)

	// Create order
	newOrder := &order.Order{
		UserID:           userID,
		ScheduleID:       req.ScheduleID,
		TicketCategoryID: req.TicketCategoryID,
		Quantity:         req.Quantity,
		TotalAmount:      totalAmount,
		PaymentStatus:    order.PaymentStatusUnpaid,
		PaymentExpiresAt: &paymentExpiresAt,
		BuyerName:        req.BuyerName,
		BuyerEmail:       req.BuyerEmail,
		BuyerPhone:       req.BuyerPhone,
	}

	if err := tx.Create(newOrder).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Reload order dengan relations
	createdOrder, err := s.repo.FindByID(newOrder.ID)
	if err != nil {
		return nil, err
	}

	return createdOrder.ToOrderResponse(), nil
}

// RestoreQuota restores quota and remaining seats for an order
// Also cancels OrderItems if they exist (for orders that were PAID and OrderItems were generated)
func (s *Service) RestoreQuota(orderID string) error {
	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Load minimal order fields inside the same transaction
	var o order.Order
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Select("id", "ticket_category_id", "schedule_id", "quantity").
		Where("id = ?", orderID).
		First(&o).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Cancel OrderItems (untuk orders yang sudah PAID dan OrderItems sudah generated)
	if err := tx.Model(&orderitem.OrderItem{}).
		Where("order_id = ?", orderID).
		Update("status", orderitem.TicketStatusCanceled).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to cancel order items: %w", err)
	}

	// Lock dan restore quota
	var ticketCategory ticketcategory.TicketCategory
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", o.TicketCategoryID).First(&ticketCategory).Error; err != nil {
		tx.Rollback()
		return err
	}
	ticketCategory.Quota += o.Quantity
	if err := tx.Save(&ticketCategory).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Lock dan restore remaining seats
	var schedule schedule.Schedule
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", o.ScheduleID).First(&schedule).Error; err != nil {
		tx.Rollback()
		return err
	}
	schedule.RemainingSeat += o.Quantity
	if err := tx.Save(&schedule).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit
	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

// ExpireAndRestoreQuota atomically cancels an expired UNPAID order and restores quota/seats.
// Returns (true, nil) if the order was expired and processed; (false, nil) if no action needed.
func (s *Service) ExpireAndRestoreQuota(orderID string) (bool, error) {
	now := time.Now()

	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Lock order row and read only what we need
	var o order.Order
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Select("id", "payment_status", "payment_expires_at", "ticket_category_id", "schedule_id", "quantity").
		Where("id = ?", orderID).
		First(&o).Error; err != nil {
		tx.Rollback()
		return false, err
	}

	if o.PaymentStatus != order.PaymentStatusUnpaid {
		_ = tx.Commit().Error
		return false, nil
	}
	if o.PaymentExpiresAt == nil || o.PaymentExpiresAt.After(now) {
		_ = tx.Commit().Error
		return false, nil
	}

	// Mark order as canceled + clear temporary QRIS code
	if err := tx.Model(&order.Order{}).
		Where("id = ?", o.ID).
		Updates(map[string]interface{}{
			"payment_status": order.PaymentStatusCanceled,
			"qris_code":      nil,
		}).Error; err != nil {
		tx.Rollback()
		return false, err
	}

	// Cancel order items if any
	if err := tx.Model(&orderitem.OrderItem{}).
		Where("order_id = ?", o.ID).
		Update("status", orderitem.TicketStatusCanceled).Error; err != nil {
		tx.Rollback()
		return false, fmt.Errorf("failed to cancel order items: %w", err)
	}

	// Restore ticket category quota
	var ticketCategory ticketcategory.TicketCategory
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", o.TicketCategoryID).First(&ticketCategory).Error; err != nil {
		tx.Rollback()
		return false, err
	}
	ticketCategory.Quota += o.Quantity
	if err := tx.Save(&ticketCategory).Error; err != nil {
		tx.Rollback()
		return false, err
	}

	// Restore schedule remaining seats
	var sched schedule.Schedule
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", o.ScheduleID).First(&sched).Error; err != nil {
		tx.Rollback()
		return false, err
	}
	sched.RemainingSeat += o.Quantity
	if err := tx.Save(&sched).Error; err != nil {
		tx.Rollback()
		return false, err
	}

	if err := tx.Commit().Error; err != nil {
		return false, err
	}

	return true, nil
}

// FindExpiredUnpaidOrders finds expired unpaid orders
func (s *Service) FindExpiredUnpaidOrders() ([]*order.Order, error) {
	return s.repo.FindExpiredUnpaidOrders()
}

// CancelExpiredOrder cancels an expired order
func (s *Service) CancelExpiredOrder(orderID string) error {
	o, err := s.repo.FindByID(orderID)
	if err != nil {
		return err
	}

	o.PaymentStatus = order.PaymentStatusCanceled
	return s.repo.Update(o)
}

// InitiatePayment initiates payment via Midtrans
func (s *Service) InitiatePayment(orderID string, paymentMethod string) (*PaymentInitiationResponse, error) {
	return s.InitiatePaymentWithContext(context.Background(), orderID, paymentMethod)
}

// InitiatePaymentWithContext initiates payment via Midtrans with request context.
func (s *Service) InitiatePaymentWithContext(ctx context.Context, orderID string, paymentMethod string) (*PaymentInitiationResponse, error) {
	// Find order
	o, err := s.repo.FindByID(orderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	// Verify order status
	if o.PaymentStatus != order.PaymentStatusUnpaid {
		return nil, errors.New("order is not unpaid")
	}

	// Verify payment not expired
	if o.PaymentExpiresAt != nil && o.PaymentExpiresAt.Before(time.Now()) {
		return nil, errors.New("payment has expired")
	}

	// Create Midtrans client
	midtransClient := midtrans.NewClient()

	// Validate Midtrans client configuration
	if midtransClient.ServerKey == "" {
		return nil, fmt.Errorf("midtrans server key is not configured")
	}

	// If order already has transaction ID, return QRIS code from database if available
	if o.MidtransTransactionID != nil && *o.MidtransTransactionID != "" {
		// Check if payment has expired
		if o.PaymentExpiresAt != nil && o.PaymentExpiresAt.Before(time.Now()) {
			return nil, errors.New("payment has expired")
		}

		// If we have QRIS code stored in database, return it
		if o.QRISCode != nil && *o.QRISCode != "" {
			return &PaymentInitiationResponse{
				OrderID:       o.ID,
				TransactionID: *o.MidtransTransactionID,
				PaymentType:   o.PaymentMethod,
				QRISCode:      *o.QRISCode,
				PaymentURL:    "",
				ExpiresAt:     o.PaymentExpiresAt,
				Status:        "pending",
			}, nil
		}

		// If no QRIS code in database, check Midtrans status (might have QRIS code)
		statusResp, err := midtransClient.GetTransactionStatusWithContext(ctx, *o.MidtransTransactionID)
		if err == nil {
			// If transaction is still pending and we have QRIS code from Midtrans, save it and return
			if statusResp.TransactionStatus == "pending" && statusResp.QRISCode != "" {
				// Save QRIS code to database for future access
				o.QRISCode = &statusResp.QRISCode
				if err := s.repo.Update(o); err != nil {
					log.Printf("[InitiatePayment] Error saving QRIS code for order %s: %v", orderID, err)
				}

				// Parse expiry time from Midtrans response if available
				var expiresAt *time.Time
				if statusResp.ExpiryTime != "" {
					if parsed, err := time.Parse(time.RFC3339, statusResp.ExpiryTime); err == nil {
						expiresAt = &parsed
					}
				}
				// Fallback to order's payment_expires_at if Midtrans expiry not available
				if expiresAt == nil {
					expiresAt = o.PaymentExpiresAt
				}

				return &PaymentInitiationResponse{
					OrderID:       o.ID,
					TransactionID: statusResp.TransactionID,
					PaymentType:   statusResp.PaymentType,
					QRISCode:      statusResp.QRISCode,
					PaymentURL:    "",
					ExpiresAt:     expiresAt,
					Status:        statusResp.TransactionStatus,
				}, nil
			}
			// If transaction is not pending, cannot re-initiate
			if statusResp.TransactionStatus != "pending" {
				return nil, errors.New("payment already initiated")
			}
		}
		// If no QRIS code available, return error
		return nil, errors.New("payment already initiated - QRIS code not available")
	}

	// Get ticket category for item details
	ticketCategory, err := s.ticketCategoryRepo.FindByID(o.TicketCategoryID)
	if err != nil {
		return nil, err
	}

	// Get schedule for event info
	schedule, err := s.scheduleRepo.FindByID(o.ScheduleID)
	if err != nil {
		return nil, err
	}

	// Prepare customer details
	customerName := o.BuyerName
	firstName := customerName
	lastName := ""
	if len(customerName) > 0 {
		parts := strings.SplitN(customerName, " ", 2)
		firstName = parts[0]
		if len(parts) > 1 {
			lastName = parts[1]
		}
	}

	// Build item name
	itemName := ticketCategory.CategoryName
	if schedule.Event != nil && schedule.Event.EventName != "" {
		itemName = ticketCategory.CategoryName + " - " + schedule.Event.EventName
	}

	// Prepare Midtrans request
	midtransReq := &midtrans.CreateTransactionRequest{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:     o.OrderCode,
			GrossAmount: o.TotalAmount,
		},
		ItemDetails: []midtrans.ItemDetail{
			{
				ID:       o.TicketCategoryID,
				Price:    ticketCategory.Price,
				Quantity: o.Quantity,
				Name:     itemName,
			},
		},
		CustomerDetails: midtrans.CustomerDetails{
			FirstName: firstName,
			LastName:  lastName,
			Email:     o.BuyerEmail,
			Phone:     o.BuyerPhone,
		},
		PaymentType: paymentMethod,
		QRIS: &midtrans.QRISConfig{
			Acquirer: "gopay", // Default to gopay, can be configured
		},
		Expiry: &midtrans.ExpiryConfig{
			StartTime: time.Now().Format(time.RFC3339),
			Unit:      "minute",
			Duration:  15,
		},
	}

	// Call Midtrans API
	midtransResp, err := midtransClient.CreateTransactionWithContext(ctx, midtransReq)
	if err != nil {
		log.Printf("[InitiatePayment] Error creating Midtrans transaction for order %s: %v", orderID, err)
		return nil, fmt.Errorf("failed to create midtrans transaction: %w", err)
	}

	// Parse expiry time from Midtrans response
	var expiresAt *time.Time
	if midtransResp.ExpiryTime != "" {
		if parsed, err := time.Parse(time.RFC3339, midtransResp.ExpiryTime); err == nil {
			expiresAt = &parsed
		} else {
			// Fallback: calculate from current time + 15 minutes
			exp := time.Now().Add(15 * time.Minute)
			expiresAt = &exp
		}
	} else {
		// Fallback: calculate from current time + 15 minutes
		exp := time.Now().Add(15 * time.Minute)
		expiresAt = &exp
	}

	// Update order with transaction ID, expiry time, and QRIS code
	transactionID := midtransResp.TransactionID
	o.MidtransTransactionID = &transactionID
	o.PaymentMethod = paymentMethod
	o.PaymentExpiresAt = expiresAt
	// Store QRIS code temporarily (will be cleared after expired/paid)
	if midtransResp.QRISCode != "" {
		o.QRISCode = &midtransResp.QRISCode
	}
	if err := s.repo.Update(o); err != nil {
		log.Printf("[InitiatePayment] Error updating order %s: %v", orderID, err)
		return nil, fmt.Errorf("failed to update order: %w", err)
	}

	// Prepare response
	resp := &PaymentInitiationResponse{
		OrderID:       o.ID,
		TransactionID: midtransResp.TransactionID,
		PaymentType:   midtransResp.PaymentType,
		QRISCode:      midtransResp.QRISCode,
		PaymentURL:    "",
		ExpiresAt:     expiresAt,
		Status:        midtransResp.TransactionStatus,
	}

	// Get payment URL from actions if available
	if len(midtransResp.Actions) > 0 {
		for _, action := range midtransResp.Actions {
			if action.Name == "generate-qr-code" || action.Method == "GET" {
				resp.PaymentURL = action.URL
				break
			}
		}
	}

	return resp, nil
}

// CheckPaymentStatus checks payment status from Midtrans
func (s *Service) CheckPaymentStatus(orderID string) (*PaymentStatusResponse, error) {
	return s.CheckPaymentStatusWithContext(context.Background(), orderID)
}

// CheckPaymentStatusWithContext checks payment status from Midtrans with request context.
func (s *Service) CheckPaymentStatusWithContext(ctx context.Context, orderID string) (*PaymentStatusResponse, error) {
	// Find order
	o, err := s.repo.FindByID(orderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	// If no transaction ID, return current status
	if o.MidtransTransactionID == nil || *o.MidtransTransactionID == "" {
		transactionID := ""
		if o.MidtransTransactionID != nil {
			transactionID = *o.MidtransTransactionID
		}
		return &PaymentStatusResponse{
			OrderID:       o.ID,
			PaymentStatus: string(o.PaymentStatus),
			PaymentMethod: o.PaymentMethod,
			TransactionID: transactionID,
			PaidAt:        nil,
			ExpiresAt:     o.PaymentExpiresAt,
			IsExpired:     o.PaymentExpiresAt != nil && o.PaymentExpiresAt.Before(time.Now()),
			QRISCode:      "", // No QRIS code if no transaction
		}, nil
	}

	// Create Midtrans client
	midtransClient := midtrans.NewClient()

	// Check status from Midtrans
	statusResp, err := midtransClient.GetTransactionStatusWithContext(ctx, *o.MidtransTransactionID)
	if err != nil {
		// If Midtrans API fails, return current status from DB with QRIS code if available
		transactionID := ""
		if o.MidtransTransactionID != nil {
			transactionID = *o.MidtransTransactionID
		}
		qrisCode := ""
		if o.QRISCode != nil && *o.QRISCode != "" {
			qrisCode = *o.QRISCode
		}
		return &PaymentStatusResponse{
			OrderID:       o.ID,
			PaymentStatus: string(o.PaymentStatus),
			PaymentMethod: o.PaymentMethod,
			TransactionID: transactionID,
			PaidAt:        nil,
			ExpiresAt:     o.PaymentExpiresAt,
			IsExpired:     o.PaymentExpiresAt != nil && o.PaymentExpiresAt.Before(time.Now()),
			QRISCode:      qrisCode, // Return QRIS code from database if Midtrans API fails
		}, nil
	}

	// Map Midtrans status to our payment status
	var paymentStatus order.PaymentStatus
	switch statusResp.TransactionStatus {
	case "settlement":
		paymentStatus = order.PaymentStatusPaid
	case "pending":
		paymentStatus = order.PaymentStatusUnpaid
	case "expire", "cancel":
		paymentStatus = order.PaymentStatusCanceled
	case "deny":
		paymentStatus = order.PaymentStatusFailed
	default:
		paymentStatus = o.PaymentStatus // Keep current status
	}

	// Never downgrade terminal statuses.
	// Once PAID/REFUNDED/CANCELED/FAILED, keep it stable unless Midtrans says settlement.
	if o.PaymentStatus == order.PaymentStatusPaid ||
		o.PaymentStatus == order.PaymentStatusRefunded ||
		o.PaymentStatus == order.PaymentStatusCanceled ||
		o.PaymentStatus == order.PaymentStatusFailed {
		if paymentStatus != order.PaymentStatusPaid {
			paymentStatus = o.PaymentStatus
		}
	}

	// Update order status if changed
	oldStatus := o.PaymentStatus
	if paymentStatus != o.PaymentStatus {
		o.PaymentStatus = paymentStatus
		// Clear QRIS code if payment is no longer pending
		if paymentStatus != order.PaymentStatusUnpaid {
			o.QRISCode = nil
		}
		if err := s.repo.Update(o); err != nil {
			// Log error but continue
		}

		// If status changed to PAID, trigger OrderItem generation (same behavior as webhook)
		if paymentStatus == order.PaymentStatusPaid && oldStatus == order.PaymentStatusUnpaid {
			categories := []string{o.TicketCategoryID}
			quantities := []int{o.Quantity}
			if s.orderItemService != nil {
				_, err := s.orderItemService.GenerateTickets(o.ID, categories, quantities)
				if err != nil {
					// Log error but don't fail payment status check
					log.Printf("[CheckPaymentStatus] Error generating tickets for order %s: %v", o.ID, err)
				}
			}
		}
	}

	var paidAt *time.Time
	if statusResp.SettlementTime != "" {
		if parsed, err := time.Parse(time.RFC3339, statusResp.SettlementTime); err == nil {
			paidAt = &parsed
		}
	}

	transactionID := ""
	if o.MidtransTransactionID != nil {
		transactionID = *o.MidtransTransactionID
	}

	// Parse expiry time from Midtrans response if available
	var expiresAt *time.Time
	if statusResp.ExpiryTime != "" {
		if parsed, err := time.Parse(time.RFC3339, statusResp.ExpiryTime); err == nil {
			expiresAt = &parsed
		}
	}
	// Fallback to order's payment_expires_at if Midtrans expiry not available
	if expiresAt == nil {
		expiresAt = o.PaymentExpiresAt
	}

	// Get QRIS code: prefer from database, fallback to Midtrans response
	qrisCode := ""
	if o.QRISCode != nil && *o.QRISCode != "" {
		qrisCode = *o.QRISCode
	} else if statusResp.QRISCode != "" {
		qrisCode = statusResp.QRISCode
		// Save QRIS code to database if we got it from Midtrans
		if paymentStatus == order.PaymentStatusUnpaid {
			o.QRISCode = &statusResp.QRISCode
			if err := s.repo.Update(o); err != nil {
				log.Printf("[CheckPaymentStatus] Error saving QRIS code for order %s: %v", orderID, err)
			}
		}
	}

	return &PaymentStatusResponse{
		OrderID:       o.ID,
		PaymentStatus: string(paymentStatus),
		PaymentMethod: o.PaymentMethod,
		TransactionID: transactionID,
		PaidAt:        paidAt,
		ExpiresAt:     expiresAt,
		IsExpired:     expiresAt != nil && expiresAt.Before(time.Now()),
		QRISCode:      qrisCode, // Include QRIS code if available (for pending transactions)
	}, nil
}

// PaymentInitiationResponse represents payment initiation response
type PaymentInitiationResponse struct {
	OrderID       string     `json:"order_id"`
	TransactionID string     `json:"transaction_id"`
	PaymentType   string     `json:"payment_type"`
	QRISCode      string     `json:"qris_code"`
	PaymentURL    string     `json:"payment_url"`
	ExpiresAt     *time.Time `json:"expires_at"`
	Status        string     `json:"status"`
}

// PaymentStatusResponse represents payment status response
type PaymentStatusResponse struct {
	OrderID       string     `json:"order_id"`
	PaymentStatus string     `json:"payment_status"`
	PaymentMethod string     `json:"payment_method"`
	TransactionID string     `json:"transaction_id"`
	PaidAt        *time.Time `json:"paid_at"`
	ExpiresAt     *time.Time `json:"expires_at"`
	IsExpired     bool       `json:"is_expired"`
	QRISCode      string     `json:"qris_code,omitempty"` // QRIS code (available for pending QRIS transactions)
}

// ProcessPaymentWebhook processes payment webhook from Midtrans
func (s *Service) ProcessPaymentWebhook(payload *midtrans.WebhookPayload) error {
	// Verify webhook signature
	midtransClient := midtrans.NewClient()
	if !midtransClient.VerifyWebhookSignature(payload) {
		return fmt.Errorf("invalid webhook signature")
	}

	// Process atomically with row lock to avoid concurrent webhook/polling/job races
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Find + lock order by order code
	var o order.Order
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("order_code = ?", payload.OrderID).First(&o).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("order not found: %w", err)
	}

	// Verify payment amount (convert gross_amount string to float64)
	grossAmount, err := strconv.ParseFloat(strings.TrimSpace(payload.GrossAmount), 64)
	if err != nil {
		return fmt.Errorf("invalid gross amount format: %w", err)
	}

	// Allow small floating point differences (0.01)
	if abs(grossAmount-o.TotalAmount) > 0.01 {
		return fmt.Errorf("payment amount mismatch: expected %.2f, got %.2f", o.TotalAmount, grossAmount)
	}

	// Check idempotency - if order already processed for this transaction and not UNPAID, skip
	if o.MidtransTransactionID != nil && *o.MidtransTransactionID == payload.TransactionID && o.PaymentStatus != order.PaymentStatusUnpaid {
		_ = tx.Commit().Error
		return nil
	}

	// Map transaction status to payment status
	var newPaymentStatus order.PaymentStatus
	switch payload.TransactionStatus {
	case "settlement":
		newPaymentStatus = order.PaymentStatusPaid
	case "pending":
		newPaymentStatus = order.PaymentStatusUnpaid // Keep as unpaid, wait for settlement
	case "expire", "cancel":
		newPaymentStatus = order.PaymentStatusCanceled
	case "deny":
		newPaymentStatus = order.PaymentStatusFailed
	default:
		// Unknown status, don't update
		return nil
	}

	oldStatus := o.PaymentStatus

	// Never downgrade terminal statuses.
	if oldStatus == order.PaymentStatusPaid ||
		oldStatus == order.PaymentStatusRefunded ||
		oldStatus == order.PaymentStatusCanceled ||
		oldStatus == order.PaymentStatusFailed {
		if newPaymentStatus != order.PaymentStatusPaid {
			_ = tx.Commit().Error
			return nil
		}
	}

	// Apply status + transaction info
	o.PaymentStatus = newPaymentStatus
	transactionID := payload.TransactionID
	o.MidtransTransactionID = &transactionID
	o.PaymentMethod = payload.PaymentType
	
	// Clear QRIS code if payment is no longer pending (paid, canceled, or failed)
	if newPaymentStatus != order.PaymentStatusUnpaid {
		o.QRISCode = nil
	}

	if err := tx.Save(&o).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update order: %w", err)
	}

	// If status changed to CANCELED or FAILED, restore quota atomically within this tx
	if (newPaymentStatus == order.PaymentStatusCanceled || newPaymentStatus == order.PaymentStatusFailed) && oldStatus == order.PaymentStatusUnpaid {
		// Cancel order items if any
		if err := tx.Model(&orderitem.OrderItem{}).
			Where("order_id = ?", o.ID).
			Update("status", orderitem.TicketStatusCanceled).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to cancel order items: %w", err)
		}

		// Restore ticket category quota
		var ticketCategory ticketcategory.TicketCategory
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", o.TicketCategoryID).First(&ticketCategory).Error; err != nil {
			tx.Rollback()
			return err
		}
		ticketCategory.Quota += o.Quantity
		if err := tx.Save(&ticketCategory).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Restore schedule remaining seats
		var sched schedule.Schedule
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", o.ScheduleID).First(&sched).Error; err != nil {
			tx.Rollback()
			return err
		}
		sched.RemainingSeat += o.Quantity
		if err := tx.Save(&sched).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	// If status changed to PAID, trigger OrderItem generation (post-commit)
	if newPaymentStatus == order.PaymentStatusPaid && oldStatus == order.PaymentStatusUnpaid {
		// Generate OrderItems for this order
		// Use order's TicketCategoryID and Quantity to generate tickets
		categories := []string{o.TicketCategoryID}
		quantities := []int{o.Quantity}

		if s.orderItemService != nil {
			_, err := s.orderItemService.GenerateTickets(o.ID, categories, quantities)
			if err != nil {
				// Log error but don't fail webhook processing
				// OrderItem generation can be retried manually if needed
				// Error will be logged by the service
			}
		}
	}

	return nil
}

// abs returns absolute value of float64
func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
