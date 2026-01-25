package job

import (
	"log"

	orderservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order"
	"github.com/robfig/cron/v3"
)

// StartPaymentExpirationJob starts the payment expiration cron job
func StartPaymentExpirationJob(orderService *orderservice.Service) {
	c := cron.New()

	// Run setiap 1 menit
	_, err := c.AddFunc("* * * * *", func() {
		expiredOrders, err := orderService.FindExpiredUnpaidOrders()
		if err != nil {
			log.Printf("Error finding expired orders: %v", err)
			return
		}

		if len(expiredOrders) == 0 {
			return
		}

		log.Printf("Found %d expired unpaid orders, processing...", len(expiredOrders))

		for _, order := range expiredOrders {
			processed, err := orderService.ExpireAndRestoreQuota(order.ID)
			if err != nil {
				log.Printf("Error expiring order %s: %v", order.ID, err)
				continue
			}
			if processed {
				log.Printf("Successfully expired and restored quota for order %s", order.ID)
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


