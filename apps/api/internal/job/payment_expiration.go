package job

import (
	"log"
	"sync"

	orderservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/order"
	"github.com/robfig/cron/v3"
)

// StartPaymentExpirationJob starts the payment expiration cron job.
// Returns the *cron.Cron handle so the caller can defer c.Stop() for graceful shutdown.
func StartPaymentExpirationJob(orderService *orderservice.Service) *cron.Cron {
	c := cron.New()

	// Maximum orders processed per cycle to avoid overwhelming the DB
	const maxPerCycle = 200
	// Worker pool size for RestoreQuota (each opens its own transaction)
	const workers = 10

	_, err := c.AddFunc("* * * * *", func() {
		// ── Phase 1: Cancel expired unpaid orders and restore quota ──────────

		expiredOrders, err := orderService.FindExpiredUnpaidOrders()
		if err != nil {
			log.Printf("[PaymentExpiration] Error finding expired orders: %v", err)
			return
		}

		// Cap per cycle to avoid spike-induced overload
		if len(expiredOrders) > maxPerCycle {
			log.Printf("[PaymentExpiration] Found %d expired orders, processing first %d", len(expiredOrders), maxPerCycle)
			expiredOrders = expiredOrders[:maxPerCycle]
		}

		if len(expiredOrders) > 0 {
			log.Printf("[PaymentExpiration] Processing %d expired unpaid orders...", len(expiredOrders))

			// Worker pool for concurrent processing
			var wg sync.WaitGroup
			sem := make(chan struct{}, workers)

			for _, order := range expiredOrders {
				orderID := order.ID // capture loop variable
				wg.Add(1)
				sem <- struct{}{} // acquire semaphore slot

				go func() {
					defer wg.Done()
					defer func() { <-sem }() // release semaphore slot

					if err := orderService.CancelExpiredOrder(orderID); err != nil {
						log.Printf("[PaymentExpiration] Error canceling order %s: %v", orderID, err)
						return // skip restore if cancel failed
					}

					if err := orderService.RestoreQuota(orderID); err != nil {
						log.Printf("[PaymentExpiration] Error restoring quota for order %s: %v", orderID, err)
					} else {
						log.Printf("[PaymentExpiration] Successfully processed order %s", orderID)
					}
				}()
			}
			wg.Wait()
		}

		// ── Phase 2: Retry quota restoration for previously-failed restores ──

		unrestoredOrders, err := orderService.FindUnrestoredCanceledOrders()
		if err != nil {
			log.Printf("[PaymentExpiration] Error finding unrestored canceled orders: %v", err)
			return
		}

		if len(unrestoredOrders) > maxPerCycle {
			unrestoredOrders = unrestoredOrders[:maxPerCycle]
		}

		if len(unrestoredOrders) > 0 {
			log.Printf("[PaymentExpiration] Retrying %d unrestored quota orders...", len(unrestoredOrders))

			var wg sync.WaitGroup
			sem := make(chan struct{}, workers)

			for _, order := range unrestoredOrders {
				orderID := order.ID
				wg.Add(1)
				sem <- struct{}{}

				go func() {
					defer wg.Done()
					defer func() { <-sem }()

					if err := orderService.RestoreQuota(orderID); err != nil {
						log.Printf("[PaymentExpiration] Error retrying quota restore for order %s: %v", orderID, err)
					} else {
						log.Printf("[PaymentExpiration] Successfully retried quota restore for order %s", orderID)
					}
				}()
			}
			wg.Wait()
		}
	})

	if err != nil {
		log.Printf("[PaymentExpiration] Error adding cron job: %v", err)
		return c
	}

	c.Start()
	log.Println("[PaymentExpiration] Job started (runs every minute, max 200/cycle, 10 workers)")
	return c
}
