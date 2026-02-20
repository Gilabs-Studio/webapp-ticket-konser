# Audit Report: Guest Ticket Purchase Flow → Gatekeeper QR Scan

**Tanggal:** 2026-02-19 (Updated with fixes)  
**Scope:** Flow, Logic, Performance, Security (BE + FE)  
**Roles Reviewed:** Guest (buyer) & Gatekeeper (staff)

---

## 📋 Flow Overview (End-to-End)

```
1. Guest melihat daftar event (Public)     → GET /api/v1/events
2. Guest melihat detail event + tiket      → GET /api/v1/events/detail/:id
3. Guest membuat order                     → POST /api/v1/orders
4. Guest melakukan pembayaran (Midtrans)   → POST /api/v1/orders/:id/payment
5. Guest cek status pembayaran             → GET /api/v1/orders/:id/payment-status
6. Midtrans mengirim webhook (settlement)  → POST /api/v1/payments/webhook
7. Guest melihat history order             → GET /api/v1/orders
8. Guest melihat e-ticket + QR code        → GET /api/v1/orders/:id/tickets
9. Guest download PDF e-ticket             → Frontend (jsPDF + html2canvas)
10. Gatekeeper scan QR code                → POST /api/v1/gates/:id/check-in
```

---

## ✅ Hal-Hal yang Sudah BAIK

### Backend
| # | Area | Detail |
|---|------|--------|
| 1 | **Transaction Locking** | `SELECT FOR UPDATE` pada ticket_category & schedule saat CreateOrder — mencegah overselling |
| 2 | **Idempotency** | Order creation menggunakan `Idempotency-Key` header + Redis untuk mencegah double order pada network retry |
| 3 | **Statement Timeout** | `SET LOCAL statement_timeout = '30s'` mencegah transaction deadlock tak terbatas |
| 4 | **Price Snapshot** | `unit_price`, `category_name_snapshot`, `event_name_snapshot` di-snapshot saat order dibuat — historis data terjaga |
| 5 | **Quota Restore** | Flag `QuotaRestored` mencegah double-restoration pada concurrent webhook + cron race |
| 6 | **Webhook Signature** | Midtrans webhook diverifikasi menggunakan SHA-512 signature (`VerifyWebhookSignature`) |
| 7 | **Amount Verification** | `ProcessPaymentWebhook` memverifikasi `gross_amount` match dengan `total_amount` order |
| 8 | **Ownership Verification** | `GetMyOrder`, `GetMyOrderTickets`, `InitiatePayment`, `CheckPaymentStatus` semua memverifikasi `order.UserID == userID` |
| 9 | **Rate Limiting** | Berbeda-beda per endpoint: Order (5 rps), Check-in (5 rps), Webhook (20 rps), Default (10 rps) |
| 10 | **Check-in Duplicate Prevention** | Unique index pada `check_ins.order_item_id` + Postgres unique violation handling + double-check di application level |
| 11 | **Self-Healing Tickets** | `GetMyOrderTickets` auto-generate tickets jika order PAID tetapi tickets belum ada (fallback dari webhook failure) |
| 12 | **Background Job** | Cron job setiap menit untuk expired unpaid orders + retry unrestored quota |
| 13 | **QRIS Code Management** | QRIS code di-persist ke DB + dibersihkan setelah paid/expired |
| 14 | **Security Headers** | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |
| 15 | **Input Validation** | Semua request body menggunakan `go-playground/validator/v10` dengan binding tags |
| 16 | **Soft Delete** | Semua entity menggunakan `gorm.DeletedAt` (soft delete) |
| 17 | **Payment Expiration** | 15 menit timeout untuk pembayaran, otomatis dibatalkan oleh cron |

### Frontend
| # | Area | Detail |
|---|------|--------|
| 1 | **Gate Selection** | Gatekeeper auto-select gate jika hanya 1, dropdown jika >1 |
| 2 | **Manual + Camera Scanner** | Support manual input QR code + camera scanner dengan fallback |
| 3 | **Validate → CheckIn Flow** | FE melakukan 2-step: validate dulu, baru check-in — mencegah blind writes |
| 4 | **Auto-Resume** | Scanner auto-resume setelah 2-3 detik setelah check-in sukses/gagal |
| 5 | **Vibrate Feedback** | `navigator.vibrate(200)` saat check-in berhasil — UX improvement |
| 6 | **PDF E-Ticket** | Download PDF dengan jsPDF + html2canvas (dynamic import) |

---

## 🔴 CRITICAL Issues

### 1. ✅ FIXED — **[SECURITY] Webhook Endpoint Tidak Memvalidasi IP Source Midtrans**
**File:** `apps/api/internal/api/routes/order/routes.go` (line 22-26)

Webhook hanya di-rate-limit, tetapi tidak ada whitelist IP Midtrans. Siapapun bisa mengirim forged webhook dengan signature yang valid jika mereka tahu server key.

**Impact:** Potential spoofed payment confirmations  
**Recommendation:**
```go
// Tambahkan IP whitelist middleware sebelum webhook handler
webhookGroup.Use(middleware.MidtransIPWhitelist())
webhookGroup.POST("/webhook", orderHandler.HandlePaymentWebhook)
```
Midtrans IP ranges: `103.208.0.0/22`, `34.101.0.0/16` (sandbox)

### 2. **[SECURITY] QR Code Predictability Rendah — UUID-based**
**File:** `apps/api/internal/domain/order_item/entity.go` (line 55-57)

```go
func generateQRCode() string {
    return "QR-" + uuid.New().String()
}
```

QR code format `QR-{uuid}` menggunakan UUID v4 yang secara kriptografis *cukup* random, tetapi prefix `QR-` bisa dihilangkan untuk mengurangi information leakage tentang format internal.

**Severity:** Medium  
**Recommendation:** Pertimbangkan menggunakan `crypto/rand` + base62 encoding untuk QR code yang lebih pendek dan tidak membocorkan format internal:
```go
func generateQRCode() string {
    b := make([]byte, 18) // 18 bytes = ~144 bits entropy
    crypto_rand.Read(b)
    return base62.Encode(b) // Shorter, no hint about internal format
}
```

### 3. **[LOGIC] GetByIDPublic Tidak Filter ScheduleId/TicketCategory yang Di-return** (Deferred)
**File:** `apps/api/internal/api/handlers/event/handler.go` (line 368-397)

`GetByIDPublic` mengembalikan event response lengkap termasuk schedule dan ticket category. Ini benar secara fungsional, tetapi status event saja yang dicek — schedule yang expired atau ticket category yang sold out masih muncul tanpa indikasi.

**Recommendation:** Tambahkan field `is_available` atau filter schedule yang sudah lewat di service layer.

### 4. ✅ FIXED — **[SECURITY] QRIS Code Leak di Order Response**
**File:** `apps/api/internal/domain/order/entity.go` (line 91)

`OrderResponse` meng-include `QRISCode` di JSON response. Ini adalah payment QRIS code yang bisa diforward/disalahgunakan. Meskipun ada `omitempty`, jika ada QRIS code, ia ikut di-return di `GetMyOrders` list juga.

**Recommendation:** Hanya kembalikan QRIS code di `InitiatePayment` dan `CheckPaymentStatus` response, bukan di order list/detail response.

---

## 🟡 IMPORTANT Issues

### 5. **[PERFORMANCE] N+1 Query pada GetByID (Order Items)**
**File:** `apps/api/internal/service/order/service.go` (line 60-98)

`GetByID` melakukan:
1. `repo.FindByID(id)` → 1 query (dengan Preload User, Schedule.Event)
2. `orderItemRepo.FindByOrderID(id)` → 1 query
3. Untuk setiap order item, `item.Category.ToTicketCategoryResponse()` sudah di-preload? **Perlu diperiksa** apakah `FindByOrderID` melakukan `Preload("Category")`.

**Recommendation:** Pastikan `FindByOrderID` melakukan `Preload("Category")` untuk menghindari N+1 pada setiap item.

### 6. ✅ FIXED — **[PERFORMANCE] Cron Job Tidak Batch-Process**
**File:** `apps/api/internal/job/payment_expiration.go` (line 26-39)

Cron job iterasi satu per satu expired orders. Jika ada spike (misal 10.000 expired orders pada concert), ini bisa sangat lambat.

```go
for _, order := range expiredOrders {
    orderService.CancelExpiredOrder(order.ID)  // 1 query
    orderService.RestoreQuota(order.ID)         // 1 transaction (3+ queries)
}
```

**Impact:** Di peak, 10.000 orders × 4+ queries = 40.000+ queries per minute  
**Recommendation:**
- Batch update `payment_status = 'CANCELED'` dalam satu query
- Proses RestoreQuota dalam goroutine pool (max ~10 concurrent)
- Limitasi jumlah orders yang diproses per cycle (misal 200)

### 7. **[PERFORMANCE] FindByUserID Tanpa Pagination**
**File:** `apps/api/internal/repository/postgres/order/repository.go` (line 54-61)

`FindByUserID` mengembalikan **semua** order user tanpa limit/pagination. User dengan banyak order bisa cause memory issues.

**Note:** Untungnya, `GetMyOrders` handler menggunakan `List()` yang ada pagination. Tetapi fungsi `GetByUserID` masih ada dan bisa dipanggil.

**Recommendation:** Tambahkan limit pada `FindByUserID` atau hapus jika tidak dipakai.

### 8. ✅ FIXED — **[LOGIC] CreateOrder Tidak Validasi Event Status/Schedule Date**
**File:** `apps/api/internal/service/order/service.go` (line 238-376)

`CreateOrder` memvalidasi:
- ✅ User exists
- ✅ TicketCategory exists + quota
- ✅ Schedule exists + remaining seats

Tetapi **TIDAK** memvalidasi:
- ❌ Event status `PUBLISHED` (bisa order tiket dari event DRAFT jika tahu schedule_id)
- ❌ Schedule date belum lewat (bisa order tiket event yang sudah selesai)
- ❌ Ticket category status (bisa order dari category yang di-disable)

**Impact:** User yang mengetahui `schedule_id` dan `ticket_category_id` bisa membeli tiket dari event non-published.  
**Recommendation:**
```go
// Setelah lock schedule, validasi event status
var evt event.Event
if err := tx.Where("id = ?", sched.EventID).First(&evt).Error; err != nil {
    tx.Rollback()
    return nil, errors.New("event not found")
}
if evt.Status != event.EventStatusPublished {
    tx.Rollback()
    return nil, errors.New("event is not available")
}
if sched.StartTime != nil && sched.StartTime.Before(time.Now()) {
    tx.Rollback()
    return nil, errors.New("event schedule has passed")
}
```

### 9. ✅ FIXED — **[SECURITY] CheckPaymentStatus Mengupdate Order Status Tanpa Transaction Lock**
**File:** `apps/api/internal/service/order/service.go` (line 764-773)

```go
if paymentStatus != o.PaymentStatus {
    o.PaymentStatus = paymentStatus
    if err := s.repo.Update(o); err != nil {
        // Log error but continue ← RACE CONDITION
    }
}
```

`CheckPaymentStatus` (dipanggil oleh guest polling) bisa mengupdate order status tanpa lock. Jika webhook dan polling arrive bersamaan, bisa terjadi data race.

**Impact:** Potential inconsistent state  
**Recommendation:** Jangan update status dari polling endpoint — biarkan hanya webhook yang mengubah status. Polling hanya read-only.

### 10. **[SECURITY] Gate Staff Assignment Tidak Divalidasi saat Check-in (FE)**
**File:** `apps/web/src/features/checkin/components/QRCodeScanner.tsx`

FE mengirim `gate_id` sebagai optional field. Tetapi jika gatekeeper mengirim check-in tanpa `gate_id` (atau dengan gate_id palsu), BE (`GateCheckIn`) sudah memvalidasi assignment. ✅ Backend sudah benar.

Tetapi di FE QRCodeScanner, `gateId` bisa undefined jika admin:
```tsx
{isAdmin && <QRCodeScanner />}  // No gateId passed for admin
```
Ini intentional (admin bisa scan di gate manapun).

### 11. **[LOGIC] Webhook Error Handling — Silent Failure**
**File:** `apps/api/internal/service/order/service.go` (line 914-920, 929-936)

```go
// Error restoring quota — silently logged
if err := s.RestoreQuota(o.ID); err != nil {
    // Log error but don't fail webhook processing
}

// Error generating tickets — silently logged
if _, err := s.orderItemService.GenerateTickets(...); err != nil {
    // Log error but don't fail webhook processing
}
```

Sementara approach ini benar (return 200 ke Midtrans), tetapi tidak ada **alerting mechanism** (hanya `log.Printf`). Jika ticket generation gagal, user tidak akan mendapat e-ticket sampai mereka request ulang lewat `GetMyOrderTickets` (self-healing).

**Recommendation:**
- Tambahkan metrics/alert counter untuk failed ticket generation
- Tambahkan retry queue (Redis-based) untuk failed operations
- Kirim notifikasi ke admin jika ticket generation gagal

---

## 🟢 MINOR Issues

### 12. **[FE] jsPDF dan html2canvas Belum Ter-install**
**File:** `apps/web/src/features/events/components/ETicketDisplay.tsx` (line 53-55)

```typescript
const [jsPDF, html2canvas] = await Promise.all([
    import("jspdf").then(m => m.default),
    import("html2canvas").then(m => m.default)
]);
```

Library ini belum berhasil di-install (`EUNSUPPORTEDPROTOCOL` error). PDF download button ada tetapi akan error saat diklik.

**Fix:** `npm install jspdf html2canvas --legacy-peer-deps`

### 13. **[FE] Camera QR Scanner — jsQR Not Integrated**
**File:** `apps/web/src/features/checkin/components/QRCodeScanner.tsx` (line 166-173)

Camera QR code detection disabled, hanya manual input yang berfungsi:
```typescript
// QR code detection will be enabled after installing jsqr library
// const code = jsQR(imageData.data, imageData.width, imageData.height);
```

**Fix:** `npm install jsqr` dan uncomment detection code.

### 14. ✅ FIXED — **[PERFORMANCE] Cron Cleanup Interval Tidak Ada Graceful Shutdown**
**File:** `apps/api/internal/job/payment_expiration.go`

Cron job dimulai tetapi tidak ada mechanism untuk graceful stop. Jika server di-shutdown, cron bisa interrupted mid-transaction.

**Recommendation:**
```go
func StartPaymentExpirationJob(orderService *orderservice.Service) *cron.Cron {
    c := cron.New()
    c.AddFunc(...)
    c.Start()
    return c // Caller can defer c.Stop()
}
```

### 15. **[SECURITY] Body Limit Middleware**
**File:** `apps/api/internal/api/middleware/body_limit.go`

Ada middleware body limit — perlu dipastikan diterapkan pada semua routes terutama webhook.

### 16. ✅ FIXED — **[FE] Error Handling PDF Download**
**File:** `apps/web/src/features/events/components/ETicketDisplay.tsx` (line 86-88)

```typescript
} catch (error) {
    console.error("Failed to generate PDF:", error);
    // Fallback: window.print() if browser allows or just toast error
}
```

Tidak ada user feedback saat PDF gagal di-generate. Harusnya toast/alert ditampilkan.

---

## 📊 Summary Matrix

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Flow Completeness** | ⭐⭐⭐⭐⭐ | End-to-end flow lengkap dari browse → buy → pay → view → scan |
| **Logic Correctness** | ⭐⭐⭐⭐ | Solid overall, perlu fix #8 (event status validation pada order) |
| **Performance** | ⭐⭐⭐⭐ | Good for normal traffic, perlu batch processing untuk spikes (#6) |
| **Security** | ⭐⭐⭐⭐ | Strong foundation, perlu IP whitelist webhook (#1) dan polling isolation (#9) |
| **Error Handling** | ⭐⭐⭐⭐ | Good error codes, perlu alerting untuk silent failures (#11) |
| **Concurrency** | ⭐⭐⭐⭐⭐ | Excellent — SELECT FOR UPDATE, idempotency, unique constraints |
| **Frontend UX** | ⭐⭐⭐⭐ | Good flow, perlu library installation untuk full functionality |

---

## 🎯 Recommended Fix Priority

1. **P0 (Segera):** #8 — Validasi event status + schedule date saat CreateOrder
2. **P0 (Segera):** #1 — IP whitelist untuk Midtrans webhook
3. **P1 (Penting):** #9 — Jangan update status dari polling (read-only)
4. **P1 (Penting):** #4 — Jangan leak QRIS code di order list response
5. **P2 (Improvement):** #6 — Batch processing cron job
6. **P2 (Improvement):** #11 — Alerting untuk silent failures
7. **P3 (Nice-to-have):** #12, #13 — Install jsPDF, html2canvas, jsQR
8. **P3 (Nice-to-have):** #14 — Graceful shutdown cron
