package order

import (
	"fmt"
	"log"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/database"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/order"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/schedule"
	ticketcategory "github.com/gilabs/webapp-ticket-konser/api/internal/domain/ticket_category"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	"gorm.io/gorm"
)

// Seed seeds order data
// This function uses upsert logic: creates orders if not exists, skips if exists
// Requires: Users and Schedules must be seeded first
func Seed() error {
	log.Println("Seeding orders...")

	// Get users (admin, staff, and guest)
	var adminUser, staffUser, guestUser user.User
	if err := database.DB.Where("email = ?", "admin@example.com").First(&adminUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Println("⚠️  [Order Seeder] Admin user not found, skipping order seeding...")
			log.Println("⚠️  [Order Seeder] Please seed users first before seeding orders")
			return nil
		}
		return err
	}

	if err := database.DB.Where("email = ?", "staff@example.com").First(&staffUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Println("⚠️  [Order Seeder] Staff user not found, skipping order seeding...")
			log.Println("⚠️  [Order Seeder] Please seed users first before seeding orders")
			return nil
		}
		return err
	}

	if err := database.DB.Where("email = ?", "guest@example.com").First(&guestUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Println("⚠️  [Order Seeder] Guest user not found, skipping order seeding...")
			log.Println("⚠️  [Order Seeder] Please seed users first before seeding orders")
			return nil
		}
		return err
	}

	// Get schedules from Harry Potter event with event preloaded
	var schedules []schedule.Schedule
	if err := database.DB.Preload("Event").
		Where("event_id IN (SELECT id FROM events WHERE event_name = ?)", "Harry Potter Museum Exhibition").
		Order("date ASC, start_time ASC").
		Limit(10).
		Find(&schedules).Error; err != nil {
		log.Println("⚠️  [Order Seeder] Schedules not found, skipping order seeding...")
		log.Println("⚠️  [Order Seeder] Please seed schedules first before seeding orders")
		return nil
	}

	if len(schedules) == 0 {
		log.Println("⚠️  [Order Seeder] No schedules found, skipping order seeding...")
		log.Println("⚠️  [Order Seeder] Please seed schedules first before seeding orders")
		return nil
	}

	// Get ticket categories for the event
	var ticketCategories []ticketcategory.TicketCategory
	eventID := schedules[0].EventID
	if schedules[0].Event != nil {
		eventID = schedules[0].Event.ID
	}
	if err := database.DB.Where("event_id = ?", eventID).Find(&ticketCategories).Error; err != nil {
		log.Println("⚠️  [Order Seeder] Failed to get ticket categories, skipping order seeding...")
		log.Println("⚠️  [Order Seeder] Please seed ticket categories first before seeding orders")
		return nil
	}

	if len(ticketCategories) == 0 {
		log.Println("⚠️  [Order Seeder] No ticket categories found, skipping order seeding...")
		log.Println("⚠️  [Order Seeder] Please seed ticket categories first before seeding orders")
		return nil
	}

	// Use upsert logic: create if not exists, skip if exists
	// Check if orders already exist
	var existingCount int64
	database.DB.Model(&order.Order{}).Count(&existingCount)
	if existingCount > 0 {
		log.Printf("[Order Seeder] Orders already exist (%d orders), skipping...", existingCount)
		return nil
	}

	// Create sample orders with different payment statuses
	// Use all available users (admin, staff, guest)
	allUsers := []user.User{adminUser, staffUser, guestUser}
	orderIndex := 0

	orders := []*order.Order{}

	// Create orders for each schedule with different statuses
	for i, sched := range schedules {
		if i >= 7 {
			break // Limit to 7 orders
		}

		// Verify schedule has event
		if sched.Event == nil || sched.Event.ID == "" {
			log.Printf("⚠️  [Order Seeder] Schedule %s has no event, skipping...", sched.ID)
			continue
		}

		// Ensure we have users
		if len(allUsers) == 0 {
			log.Println("⚠️  [Order Seeder] No users available, skipping order creation")
			break
		}

		// Select user based on index
		selectedUser := allUsers[i%len(allUsers)]

		// Select ticket category based on index (cycle through available categories)
		selectedCategory := ticketCategories[i%len(ticketCategories)]

		// Create order date based on schedule date
		orderDate := sched.Date
		if orderDate.IsZero() {
			orderDate = time.Date(2025, 6, 1+i, 0, 0, 0, 0, time.UTC)
		}

		// Generate order code based on date
		orderCode := "ORD-" + orderDate.Format("20060102") + "-" + generateOrderCodeSuffix(orderIndex)

		var paymentStatus order.PaymentStatus
		var paymentMethod string
		// var midtransID string
		var paymentExpiresAt *time.Time

		// Assign different payment statuses
		switch i % 5 {
		case 0:
			paymentStatus = order.PaymentStatusPaid
			paymentMethod = "QRIS"
			// midtransID = "MIDTRANS-TXN-" + formatNumber(i+1)
		case 1:
			paymentStatus = order.PaymentStatusUnpaid
			// Set payment expiration for UNPAID orders (15 minutes from order creation)
			expiresAt := time.Now().Add(15 * time.Minute)
			paymentExpiresAt = &expiresAt
		case 2:
			paymentStatus = order.PaymentStatusFailed
			paymentMethod = "QRIS"
			// midtransID = "MIDTRANS-TXN-FAILED-" + formatNumber(i+1)
		case 3:
			paymentStatus = order.PaymentStatusCanceled
		case 4:
			paymentStatus = order.PaymentStatusRefunded
			paymentMethod = "QRIS"
			// midtransID = "MIDTRANS-TXN-REFUNDED-" + formatNumber(i+1)
		}

		// Set quantity (1-3 tickets per order)
		quantity := (i % 3) + 1

		// Calculate total amount based on ticket category price
		totalAmount := selectedCategory.Price * float64(quantity)

		// Create order timestamp (order was created before the event date, more realistic)
		// Order created 1-7 days before the event date
		daysBeforeEvent := 7 - i
		if daysBeforeEvent < 1 {
			daysBeforeEvent = 1
		}
		orderCreatedAt := orderDate.AddDate(0, 0, -daysBeforeEvent).Add(time.Duration(i*2) * time.Hour)

		// Ensure order is not in the future
		if orderCreatedAt.After(time.Now()) {
			orderCreatedAt = time.Now().Add(-time.Duration((7-i)*24) * time.Hour)
		}

		// Generate buyer information based on user
		buyerName := selectedUser.Name
		if buyerName == "" {
			buyerName = "Buyer " + fmt.Sprintf("%d", i+1)
		}
		buyerEmail := selectedUser.Email
		if buyerEmail == "" {
			buyerEmail = fmt.Sprintf("buyer%d@example.com", i+1)
		}
		buyerPhone := "+628123456789" + fmt.Sprintf("%d", i)

		order := &order.Order{
			UserID:           selectedUser.ID,
			OrderCode:        orderCode,
			ScheduleID:       sched.ID,
			TicketCategoryID: selectedCategory.ID,
			Quantity:         quantity,
			TotalAmount:      totalAmount,
			PaymentStatus:    paymentStatus,
			PaymentMethod:    paymentMethod,
			// MidtransTransactionID: midtransID,
			PaymentExpiresAt: paymentExpiresAt,
			BuyerName:        buyerName,
			BuyerEmail:       buyerEmail,
			BuyerPhone:       buyerPhone,
			CreatedAt:        orderCreatedAt,
			UpdatedAt:        orderCreatedAt,
		}

		orders = append(orders, order)
		orderIndex++
	}

	createdCount := 0
	for _, o := range orders {
		if err := database.DB.Create(o).Error; err != nil {
			return err
		}
		log.Printf("[Order Seeder] ✅ Created order: %s (User: %s, Status: %s, Amount: %.0f, Schedule: %s, Category: %s, Quantity: %d)",
			o.OrderCode, o.UserID, o.PaymentStatus, o.TotalAmount, o.ScheduleID, o.TicketCategoryID, o.Quantity)
		createdCount++
	}

	log.Printf("[Order Seeder] Orders seeded successfully. Created: %d", createdCount)
	return nil
}

// Helper function to generate order code suffix
func generateOrderCodeSuffix(index int) string {
	// Generate 8-character suffix
	suffixes := []string{
		"12345678",
		"87654321",
		"11111111",
		"22222222",
		"33333333",
		"44444444",
		"55555555",
		"66666666",
		"77777777",
		"88888888",
	}
	if index < len(suffixes) {
		return suffixes[index]
	}
	return "00000000"
}

// Helper function to format number for midtrans ID
func formatNumber(n int) string {
	return fmt.Sprintf("%03d", n)
}
