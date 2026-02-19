# Sprint Gap Analysis — Event System Readiness Check

**Versi**: 1.0  
**Status**: Draft  
**Last Updated**: 2026-02-18  
**Scope**: Audit readiness untuk event kampus (ticket + merchandise, 1.000–3.000 concurrent users)

---

## 📋 Daftar Isi

1. [Executive Summary](#executive-summary)
2. [System Audit — Apa yang Sudah Ada](#system-audit--apa-yang-sudah-ada)
3. [Critical Risks](#1-critical-risks-must-fix)
4. [Medium Risks](#2-medium-risks-should-fix)
5. [Minor Risks](#3-minor-risks-nice-to-have)
6. [Sprint Planning — Required Fix Before Launch](#sprint-planning--required-fix-before-launch)
7. [Readiness Verdict](#readiness-verdict)

---

## Executive Summary

Sistem ticketing saat ini **belum production-ready** untuk event kampus dengan peak 1.000–3.000 concurrent users. Ada beberapa gap kritis terutama di:

1. **Public Purchase Flow** — Tidak ada halaman pembelian tiket & merchandise yang langsung accessible dari landing page tanpa login
2. **Race Condition Protection** — `SELECT FOR UPDATE` sudah ada tapi hanya untuk ticket, belum untuk merchandise
3. **Redis** — Tidak digunakan sama sekali (no seat lock, no distributed rate limit)
4. **Idempotency** — Webhook punya basic check, tapi order creation tidak punya idempotency key
5. **Public API** — Event list require auth, merchandise tidak punya public API sama sekali

### Score

| Metric | Score | Notes |
|--------|-------|-------|
| **Risk Score** | **7/10** | High risk overselling & broken buyer journey |
| **Readiness Score** | **4/10** | Banyak gap kritis di buyer-facing flow |
| **Estimated Safe Concurrent Users** | **~200–500** | Tanpa Redis, tanpa proper rate limit pada order |

---

## System Audit — Apa yang Sudah Ada

### ✅ Yang Sudah Baik

| Area | Status | Detail |
|------|--------|--------|
| **DB Transaction Lock** | ✅ | `SELECT FOR UPDATE` pada `ticket_category` dan `schedule` di `CreateOrder` |
| **Webhook Idempotency (Basic)** | ✅ | Skip jika `transaction_id` sama & status bukan UNPAID |
| **Payment Expiry** | ✅ | 15 menit auto-expire untuk unpaid orders |
| **Quota Restore** | ✅ | Quota di-restore saat order expired/canceled/failed |
| **DB Connection Pooling** | ✅ | MaxOpen=25, MaxIdle=10, configurable via env vars |
| **Rate Limiting Middleware** | ✅ | In-memory, IP-based (10 req/s, burst 20) — tapi hanya dipakai di check-in |
| **Midtrans Integration** | ✅ | Webhook signature verification, QRIS support |
| **Admin CRUD** | ✅ | Event, Ticket Category, Schedule, Merchandise, Order — semua admin API lengkap |
| **Frontend Pages** | ✅ | Events list, Event detail, Purchase page, Payment pages, Order pages, Merchandise page |
| **Auto-Migrate Safety** | ✅ | Production protection untuk drop tables |

### ⚠️ Yang Perlu Diperbaiki

| Area | Status | Detail |
|------|--------|--------|
| **Public Event API** | ⚠️ | Ada tapi **require auth** (`middleware.AuthMiddleware`) — guest tidak bisa lihat event tanpa login |
| **Public Merchandise API** | ❌ | **Tidak ada** — semua merchandise route admin-only |
| **Landing → Purchase Flow** | ⚠️ | Hero CTA "Dapatkan Tiket" → `/events` → require auth → broken journey |
| **Rate Limit pada Order** | ❌ | Rate limit ada tapi **hanya dipakai di check-in**, tidak di order creation |
| **Redis** | ❌ | Tidak ada Redis sama sekali |
| **Idempotency Key** | ❌ | Order creation tidak punya idempotency key |
| **Merchandise Purchase** | ❌ | Tidak ada flow pembelian merchandise (no cart, no order integration) |
| **E-Ticket Generation** | ❌ | OrderItem/ticket generation hanya via webhook callback — belum ada halaman e-ticket |
| **Guest Registration** | ⚠️ | Login page ada, tapi registration flow belum jelas |

---

## 1. Critical Risks (MUST FIX)

### 🔴 CR-1: Guest Cannot Browse Events Without Login

**Problem**: Public event route (`/events`) menggunakan `middleware.AuthMiddleware(jwtManager)` — artinya guest yang belum login tidak bisa melihat event list.

**Impact**: Buyer journey 100% broken. User klik "Dapatkan Tiket" di landing page → harus login dulu → friction tinggi → conversion drop.

**File**: [`routes/event/routes.go`](file:///home/kevin/Documents/GiLabs/sample/ticketing-konser/apps/api/internal/api/routes/event/routes.go#L34-L39)

**Fix**: Hapus `AuthMiddleware` dari public event routes. Buat truly public endpoint tanpa auth.

---

### 🔴 CR-2: No Public Merchandise API

**Problem**: Semua merchandise endpoints ada di `/merchandise` dengan `AuthMiddleware` + `RequirePermission("merchandise.read")` — ini admin-only. Guest tidak bisa melihat merchandise sama sekali.

**Impact**: Merchandise feature 100% unusable untuk buyer.

**File**: [`routes/merchandise/routes.go`](file:///home/kevin/Documents/GiLabs/sample/ticketing-konser/apps/api/internal/api/routes/merchandise/routes.go#L17-L29)

**Fix**: Tambah public routes untuk GET merchandise list dan GET merchandise by ID tanpa auth.

---

### 🔴 CR-3: No Merchandise Purchase Flow

**Problem**: Order system saat ini hanya support tiket (1 `TicketCategoryID` + `ScheduleID`). Tidak ada support untuk:
- Merchandise dalam order
- Cart/multi-item order
- Merchandise inventory deduction

**Impact**: Merchandise tidak bisa dibeli.

**Fix**: Extend order system untuk support merchandise items, atau buat separate merchandise order flow.

---

### 🔴 CR-4: No Rate Limiting on Order Creation

**Problem**: Rate limiting middleware sudah ada tapi **hanya dipakai di check-in routes**. Order creation endpoint (`POST /orders`) tidak punya rate limit.

**Simulation**: 2.000 users clicking "Buy Ticket" dalam 30 detik:
- Semua request masuk tanpa rate limit
- DB `SELECT FOR UPDATE` akan serialize requests → bottleneck
- Connection pool exhaustion (max 25 koneksi, request menumpuk)
- Timeout cascade, user dapat error 500

**File**: [`routes/order/routes.go`](file:///home/kevin/Documents/GiLabs/sample/ticketing-konser/apps/api/internal/api/routes/order/routes.go#L23-L33)

**Fix**: Tambah `RateLimitMiddleware` pada guest/order routes. Gunakan config lebih restrictive (5 req/s per IP, burst 10).

---

### 🔴 CR-5: No Idempotency Key for Order Creation

**Problem**: Jika user double-click "Buy" atau network retry, bisa terjadi duplicate order. `CreateOrder` tidak check apakah request sudah pernah diproses.

**Simulation**: User klik "Beli" → network timeout → frontend auto-retry → 2 order tercipta → quota terpotong 2x → user di-charge 2x.

**Fix**: Tambahkan `Idempotency-Key` header. Store key di DB/Redis. Jika key sudah ada, return existing order instead of creating new one.

---

## 2. Medium Risks (SHOULD FIX)

### 🟡 MR-1: In-Memory Rate Limiter Not Distributed

**Problem**: Rate limiter pakai `sync.Mutex` + in-memory map. Kalau Cloud Run spawn 3+ instances, setiap instance punya rate limiter sendiri → user bisa bypass limit.

**Impact**: Pada multiple instances, rate limit efektif = limit × jumlah instance.

**Fix**: Untuk event kampus (1–3 instances), ini acceptable. Tapi idealnya pakai Redis-backed rate limiter.

---

### 🟡 MR-2: No Redis Seat Lock (Temporary Hold)

**Problem**: Saat ini quota langsung dikurangi saat `CreateOrder` (optimistic). Kalau user tidak bayar dalam 15 menit, quota di-restore via cron job. Tapi:
- Tidak ada temporary seat hold sebelum checkout
- User bisa hold seats tanpa niat bayar (seat squatting)

**Impact**: Seat bisa "terkunci" selama 15 menit oleh user yang tidak bayar → real buyer tidak bisa beli.

**Fix**: Implementasi Redis-based temporary seat lock (5 menit) sebelum order creation. Release otomatis jika user tidak proceed ke payment.

---

### 🟡 MR-3: Connection Pool Might Exhaust Under Spike

**Problem**: Default 25 max open connections. Setiap `CreateOrder` pakai transaction dengan `FOR UPDATE` → connection ditahan sampai commit. Kalau 100+ concurrent orders:
- 25 connections occupied
- Request ke-26+ wait → timeout
- Cloud Run instance timeout → 502/504

**Fix**: 
- Naikkan `DB_MAX_OPEN_CONNS` ke 50–100 untuk spike
- Tambah query timeout pada transaction
- Pertimbangkan PgBouncer untuk Cloud SQL

---

### 🟡 MR-4: Webhook Processing Not Atomic

**Problem**: Di `ProcessPaymentWebhook`:
1. Update order status → `repo.Update(o)`
2. Restore quota → `RestoreQuota(orderID)` 
3. Generate tickets → `orderItemService.GenerateTickets(...)`

Langkah 2 dan 3 bisa fail tanpa di-retry. Comment says "can be retried manually" tapi tidak ada retry mechanism.

**Fix**: 
- Wrap dalam single transaction
- Atau implementasi retry queue (Redis + worker)
- Minimal: log ke dedicated error table untuk manual recovery

---

### 🟡 MR-5: No Guest Self-Registration Flow

**Problem**: Login page ada, tapi PRD menyebutkan guest harus bisa register. Flow registration saat ini unclear — apakah via `/login` page atau ada `/register` page terpisah?

**Impact**: New users tidak bisa membuat akun untuk membeli tiket.

**Fix**: Pastikan registration flow exist dan terintegrasi dengan purchase flow (register → auto-redirect ke checkout).

---

## 3. Minor Risks (NICE TO HAVE)

### 🟢 MNR-1: No Request Queue / Virtual Waiting Room

Untuk event kampus medium scale, ini optional. Tapi kalau sudden spike (flash sale), waiting room bisa prevent server overwhelm.

### 🟢 MNR-2: No Server-Sent Events / WebSocket for Real-Time Quota

Frontend tidak mendapat real-time update quota tersedia. User bisa lihat "5 tiket tersisa" tapi saat checkout sudah habis.

### 🟢 MNR-3: Frontend Double-Click Prevention

Tidak ada disable button saat submit order. User bisa rapid-click dan create multiple orders.

### 🟢 MNR-4: No Comprehensive Error Logging / Alerting

Tidak ada structured error logging, Sentry integration, atau alerting system.

### 🟢 MNR-5: Landing Page → Purchase UX

Saat ini: Landing → `/events` (list) → `/events/:id` (detail) → `/events/:id/purchase`. 
Idealnya untuk single event: Landing → langsung ke purchase page.

---

## Sprint Planning — Required Fix Before Launch

### Sprint X: Public Buyer Journey & Anti-Overselling (Est: 8–10 hari)

> **Goal**: Membuat buyer journey yang lengkap dari landing page sampai e-ticket, dengan anti-overselling protection.

#### A. Public API Routes (Backend) — 2 hari

| Task | Priority | Est |
|------|----------|-----|
| Hapus auth dari public event routes (`GET /events`, `GET /events/detail/:id`) | 🔴 Critical | 2h |
| Tambah public merchandise routes (`GET /public/merchandise`, `GET /public/merchandise/:id`) | 🔴 Critical | 4h |
| Tambah `RateLimitMiddleware` pada `POST /orders` | 🔴 Critical | 2h |
| Tambah rate limit pada `POST /orders/:id/payment` | 🔴 Critical | 1h |
| Tambah `Idempotency-Key` handler pada `POST /orders` | 🔴 Critical | 4h |

#### B. Merchandise Purchase Flow (Backend) — 3 hari

| Task | Priority | Est |
|------|----------|-----|
| Extend domain model: `Order` support merchandise items | 🔴 Critical | 4h |
| Extend `CreateOrder`: support type="merchandise" dengan inventory deduction | 🔴 Critical | 6h |
| `SELECT FOR UPDATE` pada merchandise stock saat order | 🔴 Critical | 2h |
| Webhook handler: support merchandise order (no ticket generation for merch) | 🔴 Critical | 4h |
| Restore inventory saat merchandise order cancelled/expired | 🔴 Critical | 2h |

#### C. Frontend — Public Buyer Journey (Frontend) — 3 hari

| Task | Priority | Est |
|------|----------|-----|
| Update landing page CTA → direct ke `/events` atau combined purchase page | 🔴 Critical | 2h |
| Fix public events page → fetch tanpa auth | 🔴 Critical | 2h |
| Fix public merchandise page → fetch tanpa auth | 🔴 Critical | 2h |
| Build merchandise purchase flow (add to cart, checkout) | 🔴 Critical | 8h |
| Implement double-click prevention on buy/pay buttons | 🟡 Medium | 1h |
| Add idempotency key generation on frontend (UUID per form submission) | 🔴 Critical | 2h |
| Guest registration flow integration with purchase | 🟡 Medium | 4h |

#### D. Resilience & Safety (Backend) — 2 hari

| Task | Priority | Est |
|------|----------|-----|
| Wrap webhook processing in single DB transaction | 🟡 Medium | 4h |
| Increase DB pool config defaults for spike (50 open, 20 idle) | 🟡 Medium | 1h |
| Add transaction timeout (30s) untuk prevent long-held locks | 🟡 Medium | 2h |
| Add request timeout middleware (global 30s) | 🟡 Medium | 2h |
| Test: simulate concurrent order creation (100+ goroutines) | 🟡 Medium | 4h |

---

## Readiness Verdict

### Current State: ⚠️ PARTIALLY READY

| Criteria | Status |
|----------|--------|
| Guest can browse events without login | ✅ Auth middleware removed from public routes |
| Guest can browse merchandise | ✅ Public API `/public/merchandise` implemented |
| Guest can purchase ticket | ✅ Rate limit + idempotency key implemented |
| Guest can purchase merchandise | ❌ Not implemented (backend order flow pending) |
| Anti-overselling (ticket) | ✅ `SELECT FOR UPDATE` + idempotency + snapshot fields |
| Anti-overselling (merchandise) | ❌ Not implemented |
| Webhook idempotent | ⚠️ Basic check, not fully atomic |
| Rate limiting on purchase | ✅ 5 req/s per IP on order creation |
| Supports 1.000–3.000 concurrent users | ⚠️ Pool tuned to 50/20 + 30s timeout, needs load test |

### After Sprint X: ✅ CONDITIONALLY READY

Jika semua item Critical di Sprint X selesai:
- **Estimated Safe Concurrent Users**: 1.000–2.000
- **Risk Score**: 3/10
- **Readiness Score**: 8/10

Untuk push ke 3.000 concurrent users:
- Tambah Redis seat lock
- Pakai PgBouncer / Cloud SQL connection proxy
- Pertimbangkan waiting room

---

## Simulation Results

### Scenario 1: 2.000 users klik "Buy Ticket" dalam 30 detik

**Current State**:
```
❌ No rate limit → semua request masuk
❌ 25 DB connections → bottleneck
❌ SELECT FOR UPDATE serialize → queue panjang
❌ No idempotency → double orders jika retry
→ RESULT: ~500 orders berhasil, ~1.500 timeout/error, potential oversell jika timeout tapi commit berhasil
```

**After Sprint X**:
```
✅ Rate limit 5 req/s per IP → throttle spam
✅ Idempotency key → no duplicate orders
✅ 50 DB connections → better throughput
✅ Transaction timeout → release locks faster
→ RESULT: ~1.500 orders berhasil, ~500 rate-limited, no oversell
```

### Scenario 2: Duplicate Midtrans webhook

**Current State**:
```
✅ Check transaction_id + status → skip jika sudah processed
⚠️ Gap: update + quota_restore + ticket_gen tidak atomic
→ RESULT: Biasanya aman, tapi edge case bisa partial failure
```

### Scenario 3: DB connection pool exhaustion

**Current State**:
```
❌ 25 connections max → habis saat spike
❌ No timeout pada transaction → connection held indefinitely
→ RESULT: Cloud Run instance hang → 502 cascade
```

---

## Checklist Manual Audit Sebelum Launch

- [x] Public event list accessible tanpa login
- [x] Public merchandise list accessible tanpa login
- [x] Rate limit diaktifkan pada order creation
- [x] Idempotency key pada order creation
- [ ] Merchandise order flow lengkap (browse → cart → checkout → pay)
- [x] Double-click prevention pada semua submit buttons
- [ ] Load test: 100 concurrent order creation → no oversell
- [ ] Load test: 500 concurrent page view → response < 2s
- [ ] Webhook duplicate test → no duplicate order items
- [x] Connection pool tuning untuk spike (min 50 max open)
- [x] Payment expiry test → quota restored setelah 15 menit
- [ ] Guest registration → auto-redirect ke checkout
- [ ] Cloud Run max instances cap → prevent cost explosion
- [ ] Midtrans production credentials configured
- [ ] JWT secret production-grade (≥32 chars)
- [ ] SSL/TLS enabled
- [ ] CORS configured properly

---

**Dokumen ini harus di-review dan di-approve sebelum memulai Sprint X.**
