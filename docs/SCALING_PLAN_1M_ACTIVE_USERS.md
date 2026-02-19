# Scaling Plan: 1 Juta User Aktif (apps/api)

Tanggal: 2026-01-19

Dokumen ini fokus pada kebutuhan *1 juta user aktif* (bukan berarti 1 juta request/detik). Target utama: sistem tetap stabil saat lonjakan traffic event besar, dengan latensi rendah dan tanpa mengorbankan keamanan.

## 1) Definisi & Asumsi yang Perlu Disepakati

"1 juta user aktif" biasanya berarti 1 juta user yang berinteraksi dalam rentang waktu tertentu (mis. 24 jam). Beban sistem bergantung pada:

- **Peak concurrent users (PCU)**: berapa user yang benar-benar bersamaan pada puncak.
- **RPS puncak**: request per detik pada puncak.
- **Mix traffic**: read-heavy (browse) vs write-heavy (checkout, payment, check-in).

Rule of thumb untuk sizing awal:

- $\text{RPS} \approx \frac{\text{user aktif pada puncak} \times \text{aksi per menit}}{60}$
- Concurrency kira-kira mengikuti $\text{Concurrency} \approx \text{RPS} \times \text{latency (detik)}$

Contoh:
- 1 juta user aktif/hari, puncak 5% aktif bersamaan = 50.000 user.
- Tiap user 1 request/10 detik rata-rata di puncak => 5.000 RPS.
- Latensi P95 200ms => concurrency ~ 1.000 in-flight.

## 2) Prinsip Arsitektur untuk Skala Besar

### 2.1 Pisahkan jalur Read vs Write
- **Read (public)**: event list, event detail, ticket category, schedule.
  - Harus diproteksi oleh **CDN + caching** agar tidak menghantam DB.
- **Write (critical)**: create order, payment callbacks, check-in.
  - Harus kuat di idempotency, locking, dan tidak boleh blok oleh pekerjaan non-kritis.

### 2.2 Scale-out aplikasi + stateless
- Jalankan banyak replica API di belakang Load Balancer.
- Pastikan session/state tidak tersimpan di memory instance (atau kalau ada, harus shared).

### 2.3 DB adalah bottleneck utama
Untuk traffic besar, Postgres biasanya jatuh karena:
- terlalu banyak koneksi langsung
- query tidak terindeks
- lock contention di transaksi write

Solusi umum:
- gunakan **PgBouncer** (transaction pooling)
- optimasi index dan query
- pertimbangkan **read replica** untuk query read-heavy

## 3) Gap yang Terlihat Saat Ini (High Impact)

### 3.1 Rate limiting masih in-memory
Implementasi di [apps/api/internal/api/middleware/rate_limit.go](../apps/api/internal/api/middleware/rate_limit.go) memakai `map + mutex`.

Dampak saat scale-out:
- limit jadi tidak konsisten antar replica (terbagi)
- potensi bottleneck lock/memory saat IP unik tinggi

Rekomendasi:
- Pindahkan rate limit ke **edge** (Cloudflare/WAF/nginx/Ingress) untuk endpoint publik.
- Untuk endpoint sensitif (login/check-in), gunakan **distributed rate limit** (Redis) atau gateway yang mendukung.

### 3.2 Belum ada caching layer (Redis / response cache)
Tanpa cache, 1 juta user aktif akan menekan DB pada endpoint read.

Rekomendasi:
- Tambahkan Redis untuk:
  - caching response read-heavy (TTL pendek)
  - distributed rate limit
  - idempotency keys

### 3.3 Observability untuk capacity belum terlihat
Untuk event besar, wajib ada:
- metrics (RPS, latency p50/p95/p99, error rate)
- DB metrics (connections, slow queries)
- tracing untuk hotspot endpoint

Rekomendasi:
- Prometheus metrics endpoint + dashboard Grafana
- pprof (internal only) untuk CPU/memory profiling

## 4) P0 (Wajib untuk Event Besar) — Tanpa Ini, Risiko Downtime Tinggi

1) **CDN/Cache untuk public GET**
- Cache event list/detail di CDN (atau reverse proxy cache) selama 5–30 detik.
- Pastikan invalidasi yang simpel (TTL-based) untuk MVP.

2) **Edge rate limiting + bot protection**
- Terapkan rate limit di LB/WAF.
- Tambahkan challenge/rules untuk bot scraping.

3) **PgBouncer + DB connection strategy**
- Aplikasi jangan langsung membuka koneksi Postgres terlalu banyak.
- Mulai dengan PgBouncer transaction pooling.

4) **Queue untuk pekerjaan non-kritis**
- Kirim email/WA, generate laporan, dsb lewat background worker.

5) **Load test sebelum event**
- Gunakan k6/Locust untuk simulasi browse → checkout → payment callback → check-in.

## 5) P1 (Sangat Disarankan) — Stabilitas + Biaya

1) **Idempotency untuk endpoint write**
- `POST /orders` harus punya idempotency key untuk mencegah double order saat retry.

2) **Caching server-side (Redis)**
- Cache hasil query yang berat (dashboard/public listing) TTL pendek.

3) **Read replica untuk read-heavy**
- Arahkan query public read ke replica.

4) **Index review berbasis query aktual**
- Aktifkan slow query log / pg_stat_statements.
- Tambahkan index untuk filter yang sering dipakai.

## 6) P2 (Optimisasi Lanjutan)

- Circuit breaker/retry policy untuk Midtrans
- Request shedding (kembalikan 429/503 secara terkontrol saat overload)
- Adaptive concurrency limits

## 7) Checklist Konfigurasi Produksi

- `ENV=production`
- `JWT_SECRET` minimal 32 char (sudah fail-fast)
- `CORS_ALLOW_ORIGINS` diset sesuai domain web
- DB pool env vars dituning sesuai kapasitas DB dan jumlah replica

## 8) Hasil yang Diharapkan

Dengan P0+P1:
- traffic public read sebagian besar terserap CDN/cache
- write path tetap stabil (idempotent, tidak mengunci lama)
- DB tidak jebol oleh koneksi dan query repetitif
- tim bisa memonitor dan melakukan autoscale berbasis metrics
