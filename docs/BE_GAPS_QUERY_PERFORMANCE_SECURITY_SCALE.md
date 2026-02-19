# Backend Gaps: Query, Performance, Security, dan Kesiapan Skala (1 Juta User Aktif)

Tanggal: 2026-01-19

Dokumen ini merangkum **semua kekurangan (gap)** yang relevan untuk backend `apps/api` dari sisi:
- Query / data-access
- Performance & scalability
- Security
- Kesiapan operasional untuk **event besar** dengan target **1 juta user aktif**

Catatan: beberapa perbaikan P0/P1/P2 sudah diimplementasi sebelumnya (lihat referensi), namun dokumen ini fokus pada **gap yang masih tersisa** dan apa yang perlu dilakukan agar aman dipakai untuk event besar.

## Referensi Dokumen Terkait
- Audit awal (temuan + sebagian sudah diimplementasi): [docs/BE_AUDIT_QUERY_PERFORMANCE_SECURITY.md](BE_AUDIT_QUERY_PERFORMANCE_SECURITY.md)
- Rencana skala 1 juta user aktif: [docs/SCALING_PLAN_1M_ACTIVE_USERS.md](SCALING_PLAN_1M_ACTIVE_USERS.md)

---

## 1) Konteks Skala: “1 Juta User Aktif”

1 juta user aktif **bukan** berarti 1 juta request/detik. Yang menentukan desain adalah:
- Peak concurrent users (PCU)
- RPS puncak
- Rasio read vs write (browse vs checkout vs check-in)

Estimasi sederhana:
- $\text{RPS} \approx \frac{\text{user aktif pada puncak} \times \text{aksi per menit}}{60}$
- $\text{Concurrency} \approx \text{RPS} \times \text{P95 latency (detik)}$

Tujuan sistem event besar:
- traffic read-heavy diserap cache/CDN
- jalur write (order, payment callback, check-in) tetap stabil dan idempotent
- DB tidak menjadi single point of failure

---

## 2) Ringkasan Prioritas (P0/P1/P2)

### P0 — Wajib sebelum event besar (risiko downtime tinggi)
1) **Caching/CDN untuk endpoint public read-heavy**
- Tanpa cache, DB akan jadi bottleneck pertama.
- Minimal TTL 5–30 detik sering sudah sangat membantu.

2) **Rate limiting & bot protection di edge (bukan di app memory)**
- Rate limiter in-memory per instance tidak konsisten saat scale-out.
- Bot scraping saat event bisa “menghabiskan” kapasitas.

3) **DB connection strategy: PgBouncer + batas koneksi per replica**
- Pool tuning saja sering tidak cukup pada lonjakan besar.

4) **Idempotency untuk endpoint write (order/checkout/check-in)**
- Menghindari duplicate order saat retry/timeout.

5) **Observability minimal untuk capacity (metrics + dashboard + alert)**
- Tanpa metrics, sulit melakukan autoscale, dan sulit menemukan bottleneck.

### Status implementasi di repo (2026-01)
- ✅ Redis-backed caching (TTL pendek) untuk sebagian endpoint read-heavy.
- ✅ Distributed rate limiting (Redis token-bucket) untuk endpoint check-in (fallback ke in-memory bila Redis off).
- ✅ Idempotency-Key middleware (Redis-backed) untuk endpoint POST kritikal (order/payment/check-in).
- ✅ Metrics endpoint `GET /metrics` (Prometheus) + optional `GET /debug/pprof/*` (token-protected).
- ⚠️ CDN/WAF/edge rate limit, PgBouncer, read-replica, dan pg_stat_statements masih termasuk ranah infra/ops (perlu setup di lingkungan deploy).

### P1 — Sangat disarankan (stabilitas, biaya, dan latency)
1) **Redis sebagai shared state untuk cache + distributed rate limit + idempotency keys**
2) **Read replica untuk traffic baca**
3) **Slow query visibility (pg_stat_statements) + index review berbasis data**
4) **Job queue untuk tugas non-kritis** (email/WA/notification/report)

### P2 — Optimisasi lanjutan
- Circuit breaker / retry policy yang disiplin untuk integrasi (Midtrans)
- Request shedding (429/503) terukur saat overload
- Adaptive concurrency limit

---

## 3) Query & Data-Access Gaps

### 3.1 Index coverage belum tervalidasi untuk pola traffic event besar
Masalah umum:
- listing dengan filter (search/status/date/event_id) tanpa index yang tepat
- join yang sering tanpa index FK

Rekomendasi:
- Aktifkan `pg_stat_statements` dan kumpulkan top queries saat load test.
- Tambahkan index berdasarkan pola query aktual (bukan asumsi).

### 3.2 Read path masih berpotensi menghantam DB berulang
Walau beberapa query dashboard sudah dioptimasi, traffic terbesar biasanya bukan dashboard, tapi:
- event list/detail
- ticket category
- schedule

Rekomendasi:
- caching response (Redis) + CDN caching untuk public GET.

### 3.3 Write path concurrency & lock contention (belum diaudit mendalam)
Risiko pada event besar:
- overselling quota (race condition)
- deadlock/lock contention
- retry client menciptakan duplikasi

Rekomendasi:
- idempotency key di endpoint `POST` penting
- transaksi dengan pola yang aman (mis. optimistic locking / row-level locking terukur)

---

## 4) Performance & Scalability Gaps

### 4.1 Rate limiting masih in-memory per instance
Lokasi: [apps/api/internal/api/middleware/rate_limit.go](../apps/api/internal/api/middleware/rate_limit.go)

Dampak:
- tidak konsisten saat multi-replica (limit “terbagi”)
- map+mutex bisa menjadi hot lock saat IP unik besar

Rekomendasi:
- rate limit + bot protection di edge (WAF/LB)
- atau distributed limiter (Redis) untuk endpoint tertentu

Implementasi saat ini:
- ✅ Jika Redis aktif (`REDIS_ENABLED=true`), limiter memakai Redis (token bucket) sehingga konsisten antar-replica.
- ✅ Jika Redis non-aktif, tetap fallback ke limiter in-memory (untuk dev/local), namun untuk event besar disarankan Redis/edge.

### 4.2 Belum ada caching layer (Redis) untuk load besar
Dampak:
- read-heavy traffic memukul Postgres

Rekomendasi:
- Redis caching (TTL pendek)
- CDN untuk public content

Implementasi saat ini:
- ✅ Middleware cache response (Redis) sudah ditambahkan untuk beberapa endpoint read-heavy:
	- `GET /api/v1/events/:event_id/ticket-categories` (TTL 15s)
	- `GET /api/v1/events/:event_id/schedules` (TTL 15s)
	- `GET /api/v1/events` dan `GET /api/v1/events/detail/:id` (TTL 5s, cache di-scope per user)
- ⚠️ CDN caching (edge) belum di-setup di repo dan tetap perlu konfigurasi di layer infra.

### 4.3 Observability untuk scaling belum ada
Gap:
- belum terlihat metrics endpoint (Prometheus)
- belum ada tracing
- belum ada pprof (internal)

Rekomendasi minimal:
- metrics: latency p50/p95/p99 per route + RPS + error rate
- DB metrics: connections, slow query
- alerting: error rate tinggi, P95 latency naik, DB connections mendekati limit

Implementasi saat ini:
- ✅ Metrics Prometheus tersedia di `GET /metrics` (aktif jika `METRICS_ENABLED=true`).
- ✅ pprof tersedia di `/debug/pprof/*` jika `PPROF_ENABLED=true`.
	- Jika `DEBUG_TOKEN` di-set, akses harus menyertakan header `X-Debug-Token: <token>`.
	- Di production, jika `DEBUG_TOKEN` kosong maka endpoint debug akan ditolak.

### 4.4 Autoscaling readiness belum ada
Gap:
- tanpa metrics yang jelas, autoscale jadi “blind”

Rekomendasi:
- HPA berdasarkan CPU + custom metrics (RPS/latency) jika tersedia

---

## 5) Security Gaps

### 5.1 Edge protections (WAF) belum didefinisikan
Untuk event besar:
- bot scraping
- credential stuffing
- traffic spike abusive

Rekomendasi:
- WAF rules: rate limit, bot protection
- allowlist/denylist untuk webhook callback

### 5.2 Session/token abuse & brute force
Walau JWT secret sudah diperketat, masih perlu:
- rate limit login di edge
- lockout policy / progressive delay

### 5.3 Uploads: kontrol akses & publikasi
Walau filename sudah aman, masih perlu:
- memastikan folder publik hanya berisi file publik
- jika ada file sensitif, pindah ke private storage + signed URL

### 5.4 Secrets management
Gap yang umum:
- pastikan secret tidak tertulis di log
- gunakan secret manager (Docker secrets/K8s secrets/Vault)

---

## 6) Reliability untuk Event Besar

### 6.1 Idempotency end-to-end
Yang perlu:
- idempotency key untuk create order
- dedupe untuk webhook callback

Implementasi saat ini:
- ✅ Middleware `Idempotency-Key` (Redis-backed) sudah dipasang pada:
	- `POST /api/v1/orders`
	- `POST /api/v1/orders/:id/payment`
	- `POST /api/v1/check-in`
	- `POST /api/v1/gates/:id/check-in`
- ✅ Webhook Midtrans sudah memiliki dedupe sederhana di service (skip bila transaksi sama dan status sudah diproses).

### 6.2 Background jobs & queue
Gap:
- pekerjaan non-kritis masih cenderung inline (berisiko memperlambat request)

Rekomendasi:
- gunakan queue (Redis-backed) dan worker

### 6.3 Graceful degradation (shed load)
Saat overload, sistem sebaiknya:
- menolak request non-kritis cepat (429/503)
- menjaga jalur payment/check-in tetap hidup

---

## 7) Checklist Eksekusi (Action Items)

**P0 (sebelum event besar)**
- Implement caching/CDN untuk public GET
- Pindahkan rate limit ke edge + bot protection
- Pasang PgBouncer + batasi koneksi DB per replica
- Tambah idempotency untuk endpoint write
- Pasang metrics + dashboard + alert minimal

Catatan repo (yang sudah diimplementasi):
- Caching Redis (TTL pendek) + header `Cache-Control` untuk hint CDN.
- Distributed rate limiting via Redis.
- Idempotency-Key middleware.
- Metrics endpoint `/metrics` + optional pprof.

**P1 (sesudah stabil)**
- Redis untuk cache + distributed rate limit + idempotency
- Read replica
- pg_stat_statements + index review
- Queue/worker untuk tugas non-kritis

---

## 8) Catatan Implementasi yang Sudah Dilakukan (Baseline)

Beberapa perbaikan yang sudah ada (ringkas):
- HTTP server timeouts + graceful shutdown
- DB pool tuning via env
- Dashboard query: agregasi + hilangkan N+1
- JWT secret fail-fast di production
- Upload filename server-controlled

Detailnya lihat: [docs/BE_AUDIT_QUERY_PERFORMANCE_SECURITY.md](BE_AUDIT_QUERY_PERFORMANCE_SECURITY.md)
