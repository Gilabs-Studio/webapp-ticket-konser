# Backend Audit: Query, Performance, Security

**Project**: WebApp Ticket Konser Platform (apps/api)

**Tanggal**: 2026-01-19

## Tujuan
Dokumen ini merangkum kekurangan (gap) backend dari sisi:
- Query/data-access
- Performance & scalability
- Security controls

Fokus dokumen ini adalah temuan yang terlihat dari codebase saat ini, beserta rekomendasi perbaikan yang paling berdampak.

## Ringkasan Prioritas

### P0 (High Risk / Harus segera)
1) **JWT secret fallback default (insecure)**
- Jika `JWT_SECRET` kosong, sistem fallback ke string default.
- Dampak: jika environment production lupa set secret, token dapat dipalsukan.
- File: [apps/api/internal/config/config.go](../apps/api/internal/config/config.go)

2) **Upload filename tidak disanitasi**
- Filename mengandung `file.Filename` dari client; berisiko path traversal/karakter aneh/overwrite edge-case.
- Dampak: potensi write ke lokasi tak diinginkan atau file collision.
- File:
  - [apps/api/internal/api/handlers/merchandise/handler.go](../apps/api/internal/api/handlers/merchandise/handler.go)
  - [apps/api/internal/api/handlers/event/handler.go](../apps/api/internal/api/handlers/event/handler.go)

### P1 (Medium / Stabilitas & biaya)
3) **HTTP server tanpa timeouts eksplisit**
- Start server menggunakan `router.Run()` sehingga tidak ada `ReadHeaderTimeout/ReadTimeout/WriteTimeout/IdleTimeout`.
- Dampak: rawan slowloris, connection hang, tail latency buruk.
- File: [apps/api/cmd/server/main.go](../apps/api/cmd/server/main.go)

4) **N+1 query pada dashboard quota overview**
- `GetQuotaOverview`: ambil semua kategori lalu loop dan `Count()` per kategori.
- Dampak: DB roundtrip membengkak linear terhadap jumlah kategori.
- File: [apps/api/internal/repository/postgres/dashboard/repository.go](../apps/api/internal/repository/postgres/dashboard/repository.go)

5) **Webhook signature check “case-insensitive” tetapi implementasi case-sensitive**
- Komentar menyebut case-insensitive, namun perbandingan string dilakukan langsung.
- Dampak: webhook valid bisa dianggap invalid jika casing berbeda → availability issue.
- File: [apps/api/internal/integration/midtrans/client.go](../apps/api/internal/integration/midtrans/client.go)

### P2 (Nice-to-have / Optimisasi bertahap)
6) **Query serial untuk statistik**
- `GetSalesOverview` melakukan beberapa `Count()` terpisah pada base query yang sama.
- Dampak: overhead query & latency dashboard.
- File: [apps/api/internal/repository/postgres/dashboard/repository.go](../apps/api/internal/repository/postgres/dashboard/repository.go)

7) **CORS hanya localhost + AllowCredentials**
- Konfigurasi saat ini hanya allow localhost dan `AllowCredentials=true`.
- Catatan: ini aman untuk dev, tapi perlu strategi env-based untuk production.
- File: [apps/api/internal/api/middleware/cors.go](../apps/api/internal/api/middleware/cors.go)

---

## Temuan Detail

## 1) Query / Data Access

### 1.1 N+1 query: Quota overview
- Lokasi: [apps/api/internal/repository/postgres/dashboard/repository.go](../apps/api/internal/repository/postgres/dashboard/repository.go)
- Pola saat ini:
  - `Find(categories)`
  - loop `categories`:
    - `Count()` sold per kategori
- Risiko:
  - ketika jumlah kategori naik, query count naik linear → makin lambat dan mahal.

Rekomendasi:
- Ubah menjadi 1 query agregasi sold count per kategori, misalnya:
  - `SELECT category_id, COUNT(*) FROM order_items WHERE status IN (...) GROUP BY category_id`
  - lalu map hasilnya ke slice kategori.
- Pastikan index:
  - `order_items(category_id, status)`

### 1.2 Statistik dashboard: query serial yang repetitif
- Lokasi: [apps/api/internal/repository/postgres/dashboard/repository.go](../apps/api/internal/repository/postgres/dashboard/repository.go)
- Pola:
  - beberapa `Count()` untuk status berbeda.
- Rekomendasi:
  - gunakan conditional aggregation:
    - `SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END)`
  - ini mengurangi roundtrip DB dan latency.

### 1.3 Filter event via join schedules
- Beberapa overview melakukan join `orders -> schedules` untuk filter `event_id`.
- Rekomendasi:
  - pastikan ada index pada:
    - `orders(schedule_id)`
    - `schedules(event_id)`
  - bila filtering sering berdasarkan rentang waktu, index timestamp relevan.

---

## 2) Performance & Scalability

### 2.1 HTTP server timeouts tidak dikontrol
- Lokasi: [apps/api/cmd/server/main.go](../apps/api/cmd/server/main.go)
- Temuan:
  - server start dengan `router.Run()`.
- Risiko:
  - request lambat/hanging dapat menahan goroutine dan koneksi.

Rekomendasi:
- Gunakan `http.Server{ ReadHeaderTimeout, ReadTimeout, WriteTimeout, IdleTimeout }` dan panggil `ListenAndServe()`.
- Pertimbangkan graceful shutdown dengan context + signal handling.

### 2.2 DB connection pooling tidak terlihat eksplisit
- Temuan:
  - tidak terlihat set pool (mis. `SetMaxOpenConns`).
- Risiko:
  - default pool bisa tidak optimal (terlalu kecil/terlalu besar tergantung driver), menyebabkan bottleneck atau kehabisan koneksi di Postgres.

Rekomendasi:
- Setelah memperoleh `sqlDB, _ := db.DB()`, set:
  - `SetMaxOpenConns`, `SetMaxIdleConns`, `SetConnMaxLifetime`, `SetConnMaxIdleTime`.

### 2.3 Cron payment expiration jalan tiap 1 menit
- Temuan:
  - job berjalan periodik untuk cancel order expired.
- Risiko:
  - jika table besar, query periodik bisa menimbulkan spikes.

Rekomendasi:
- Pastikan query expired memakai index (mis. `payment_status`, `expires_at/expired_at` atau kolom waktu yang dipakai).
- Pertimbangkan batch processing (limit) bila volume sangat besar.

---

## 3) Security

### 3.1 JWT secret fallback default (P0)
- Lokasi: [apps/api/internal/config/config.go](../apps/api/internal/config/config.go)
- Temuan:
  - jika `JWT_SECRET` kosong, default ke string statis.
- Risiko:
  - production yang salah konfigurasi menjadi rentan.

Rekomendasi:
- Jika `ENV=production` dan JWT secret kosong atau masih default, **fail-fast** (stop startup).
- Minimal panjang 32 karakter sudah baik, tetapi sebaiknya gunakan secret random kuat.

### 3.2 Upload filename sanitization (P0)
- Lokasi:
  - [apps/api/internal/api/handlers/merchandise/handler.go](../apps/api/internal/api/handlers/merchandise/handler.go)
  - [apps/api/internal/api/handlers/event/handler.go](../apps/api/internal/api/handlers/event/handler.go)
- Temuan:
  - filename mengandung `file.Filename` (input user).

Rekomendasi:
- Gunakan `filepath.Base(file.Filename)` dan whitelist karakter (mis. `[a-zA-Z0-9._-]`).
- Buat filename berdasarkan UUID/random + ekstensi yang ditentukan server (bukan dari user), misalnya `.jpg/.png/.webp`.
- Pastikan file disimpan di folder yang fixed dan tidak mengandung `..`.

### 3.3 Webhook signature check casing mismatch (P1)
- Lokasi: [apps/api/internal/integration/midtrans/client.go](../apps/api/internal/integration/midtrans/client.go)
- Temuan:
  - komentar mengatakan case-insensitive, implementasi case-sensitive.

Rekomendasi:
- Normalisasi dengan `strings.EqualFold(expected, payload.SignatureKey)` atau lower-case kedua sisi.
- Tambahkan logging terukur (tanpa membocorkan server_key) saat signature mismatch.

### 3.4 Static uploads dipublish
- Lokasi: [apps/api/cmd/server/main.go](../apps/api/cmd/server/main.go)
- Temuan:
  - `/uploads` diserve statically.

Rekomendasi:
- Pastikan hanya konten yang memang publik yang berada di folder itu.
- Jika ada file sensitif, pisahkan folder atau gunakan endpoint yang protected.

### 3.5 Middleware duplication / logging noise
- Lokasi: [apps/api/cmd/server/main.go](../apps/api/cmd/server/main.go)
- Temuan:
  - `gin.Default()` sudah memasang logger & recovery middleware; kemudian menambahkan middleware logger lagi.

Rekomendasi:
- Pastikan tidak ada double logging.
- Evaluasi agar log tidak berisi data sensitif.

---

## Rekomendasi Implementasi (Quick Wins)
1) **Fail-fast JWT secret di production**
- Kondisi: `ENV=production` dan `JWT_SECRET` kosong atau default → `Load()` return error.

2) **Sanitasi upload filename + server-controlled extension**
- Implement helper `sanitizeFilename` + gunakan UUID.

3) **Refactor N+1 dashboard quota**
- Ubah jadi agregasi `GROUP BY` satu query.

4) **Tambah HTTP server timeouts**
- Replace `router.Run()` dengan `http.Server` + timeouts.

---

## Catatan Scope
Dokumen ini adalah audit berbasis kode yang terlihat sekarang; beberapa rekomendasi (misalnya index) perlu diverifikasi dengan skema DB aktual dan pattern traffic produksi.
