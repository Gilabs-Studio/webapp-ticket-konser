package job

import (
	"log"

	orderservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order"
	"github.com/robfig/cron/v3"
)

// StartPaymentExpirationJob starts the payment expiration cron job
func StartPaymentExpirationJob(orderService *orderservice.Service) {
	c := cron.New()

	// Run every minute
	_, err := c.AddFunc("* * * * *", func() {
		// Phase 1: Cancel expired unpaid orders and restore quota
		expiredOrders, err := orderService.FindExpiredUnpaidOrders()
		if err != nil {
			log.Printf("Error finding expired orders: %v", err)
			return
		}

		if len(expiredOrders) > 0 {
			log.Printf("Found %d expired unpaid orders, processing...", len(expiredOrders))

			for _, order := range expiredOrders {
				// Update status to CANCELED
				if err := orderService.CancelExpiredOrder(order.ID); err != nil {
					log.Printf("Error canceling expired order %s: %v", order.ID, err)
					continue
				}

				// Restore quota (idempotent via QuotaRestored flag)
				if err := orderService.RestoreQuota(order.ID); err != nil {
					log.Printf("Error restoring quota for order %s: %v", order.ID, err)
				} else {
					log.Printf("Successfully expired and restored quota for order %s", order.ID)
				}
			}
		}

		// Phase 2: Retry quota restoration for canceled/failed orders where restore previously failed
		// This catches edge cases where CancelExpiredOrder succeeded but RestoreQuota failed
		unrestoredOrders, err := orderService.FindUnrestoredCanceledOrders()
		if err != nil {
			log.Printf("Error finding unrestored canceled orders: %v", err)
			return
		}

		for _, order := range unrestoredOrders {
			if err := orderService.RestoreQuota(order.ID); err != nil {
				log.Printf("Error retrying quota restore for order %s: %v", order.ID, err)
			} else {
				log.Printf("Successfully retried quota restore for order %s", order.ID)
			}
		}
	})

	if err != nil {
		log.Printf("Error adding payment expiration cron job: %v", err)
		return
	}

	c.Start()
	log.Println("Payment expiration job started (runs every minute)")
}


