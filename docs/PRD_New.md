# 1. EXECUTIVE SUMMARY

Harry Potter Museum Exhibition Ticketing Platform adalah sistem pemesanan tiket berbasis web yang memungkinkan pengguna (Guest) membeli tiket pameran Harry Potter secara online, melakukan pembayaran, serta menerima e-ticket dalam bentuk QR Code yang dapat ditunjukkan kepada Staff Gate untuk proses check-in pada hari acara.

Sistem ini menyertakan dashboard backend dengan role-based access control (RBAC) hanya untuk Admin dan Staff Gate. Guest wajib login untuk membeli tiket, namun tidak memiliki akses dashboard.

Dokumen PRD ini menjelaskan kebutuhan produk secara menyeluruh mulai dari scope, flow, business logic, struktur data, modul backend, detail use case, hingga acceptance criteria.

---

# 2. PROJECT SCOPE

## 2.1 In-Scope

- Sistem tiket online Harry Potter Museum Exhibition
- Pemesanan tiket berbasis tanggal & sesi
- Guest login & registration
- Sistem pembayaran (Midtrans)
- E-ticket dengan QR Unique
- Check-in scanner gate
- Dashboard Admin lengkap
- Role-based access (Admin, Staff Gate, Guest)
- Real-time ticket availability control
- Refund & reschedule rules (optional)
- Email delivery (Success Transaction & E-Ticket)

## 2.2 Out-of-Scope

- Aplikasi mobile
- Multi-event marketplace
- Offline cashier POS
- Seating arrangement

---

# 3. USER ROLES & PERMISSIONS

## 3.1 Admin

Akses penuh terhadap seluruh modul dashboard:

- Manajemen Event
- Manajemen Tiket / Harga
- Manajemen Jadwal / Sesi
- Manajemen Transaksi
- Manajemen Pengguna (Staff Gate)
- Report & Analytics
- Void, Refund, & Reschedule request
- Export Data (CSV/PDF)
- Dashboard overview

## 3.2 Staff Gate

Hanya mendapatkan akses:

- Halaman Gate Scanner
- Scan QR Ticket
- Validasi status tiket
- Melihat histori check-in

Tidak dapat mengakses modul Admin lainnya.

## 3.3 Guest (User Pembeli)

- Wajib login/register untuk pembelian

Bisa melihat:

- Profile (my account)
- Purchase History
- Detail tiket yang dibeli

Tidak dapat:

- Masuk dashboard / backend
- Melakukan scanning

---

# 4. SYSTEM OVERVIEW

Platform terdiri dari dua bagian:

## 4.1 Public Website (Frontend)

- Landing Page
- Event List / Event Selection
- Event Detail
- Ticket Selection
- Guest Login / Register
- Checkout
- Payment Gateway
- E-ticket Delivery (email + halaman "My Tickets")

## 4.2 Dashboard (Backend)

- Hanya Admin & Staff Gate
- Role-based access navigation

---

# 5. HIGH-LEVEL USER FLOW

## 5.1 Guest Flow

```
Landing Page → Event List → Pilih Event → Event Detail → Pilih Tanggal → Pilih Sesi → Pilih Tiket →
Check Login → (Jika belum login → Login/Register → kembali ke checkout) →
Checkout → Payment Midtrans → Success → E-Ticket (QR) → File/My Tickets →
Datang ke Event → Staff Gate Scan QR → Status: Valid → Masuk Gate
```

## 5.2 Admin Flow

```
Login Dashboard → Dashboard Overview → Manage Event → Manage Ticket →
Manage Schedule → View Transactions → Approve Refund/Reschedule →
Manage Staff Gate → Reports
```

## 5.3 Staff Gate Flow

```
Login Dashboard → Gate Scanner Page → Scan QR →
System Validate → Status (Valid / Used / Expired / Invalid)
```

---

# 6. DETAILED BUSINESS LOGIC

## 6.1 Logika Booking

- Guest harus login sebelum checkout.
- Jika belum login → redirect ke halaman login/register → kembali ke checkout.
- Sistem akan mengurangi stok seat per sesi setelah pembayaran sukses (webhook).
- Setiap tiket menghasilkan satu QR unik.

## 6.2 Logika QR Ticket

Status QR Ticket:

- **UNPAID** → tidak bisa masuk gate
- **PAID** → valid untuk check-in
- **CHECKED-IN** → tidak bisa di-scan kedua kali
- **CANCELED** → tidak valid
- **REFUNDED** → tidak valid

## 6.3 Logika Payment

- Payment menggunakan Midtrans Snap
- Status transaksi di-update melalui webhook
- Jika payment gagal → order tetap ada dengan status FAILED

## 6.4 Logika Check-in Gate

Staff Gate scan QR → sistem memvalidasi:

- QR exist?
- Status PAID?
- Sudah digunakan?
- Sudah expired?
- Valid untuk tanggal & sesi hari ini?

Jika valid → ubah status ke CHECKED-IN

---

# 7. FUNCTIONAL REQUIREMENTS

## 7.1 Guest Features

### 7.1.1 Registration

- Email unique
- Password minimal 6 karakter
- OTP verification (optional)

### 7.1.2 Login

- Hanya Guest role
- Akses ke:
  - My Account
  - My Tickets
  - Logout

### 7.1.3 Ticket Purchase

- Pilih tanggal → sesi → jumlah tiket
- Maksimal tiket per transaksi dapat diatur Admin
- Harga sesuai kategori

### 7.1.4 Payment

- Redirect ke Midtrans
- Jika sukses → email e-ticket
- Jika fail → transaksi berstatus FAILED

### 7.1.5 My Tickets

Menampilkan:

- QR ticket
- Nama event
- Tanggal & sesi
- Category ticket
- Status (PAID / CHECKED-IN)

## 7.2 Admin Features

### 7.2.1 Dashboard Overview

- Total transaksi
- Total revenue
- Jumlah tiket terjual
- Pending refund request
- Chart daily/weekly revenue

### 7.2.2 Event Management

- Create/Edit/Delete event
- Upload banner image
- Set event date range
- Set event status (draft, published, closed)
- View event details

### 7.2.3 Ticket Category Management

- Set harga
- Limit per purchase
- Quota per kategori

### 7.2.4 Schedule Management

- Buat sesi harian
- Atur kapasitas per sesi
- Atur jam buka–tutup sesi
- Input nama artist/performer
- Input rundown jadwal event (detail acara per waktu)

### 7.2.5 Transaction Management

- Lihat daftar transaksi
- Filter berdasarkan status
- Detail transaksi
- Refund manual / auto
- Reschedule tiket

### 7.2.6 User Management (Staff Gate)

- Create staff gate user
- Reset password staff

### 7.2.7 Reports

- Export tiket terjual
- Export check-in report
- Export pendapatan

## 7.3 Staff Gate Features

### 7.3.1 Gate Scanner

- Input manual code atau kamera scanner
- Validate QR
- Show detailed ticket info:
  - Nama pembeli
  - Tanggal sesi
  - Jam
  - Status
- Update status menjadi CHECKED-IN

### 7.3.2 History Check-in

- Log pengecekan QR
- Filter by date

---

# 8. DATA MODEL STRUCTURE

## 8.1 Users Table

| Field      | Type      | Description            |
| ---------- | --------- | ---------------------- |
| id         | integer   | Primary key            |
| name       | string    | Nama pengguna          |
| email      | string    | Email (unique)         |
| password   | string    | Password (hashed)      |
| role       | enum      | admin/staff_gate/guest |
| created_at | timestamp | Waktu dibuat           |
| updated_at | timestamp | Waktu diupdate         |

## 8.2 Events Table

| Field        | Type      | Description            |
| ------------ | --------- | ---------------------- |
| id           | integer   | Primary key            |
| event_name   | string    | Nama event             |
| description  | text      | Deskripsi event        |
| banner_image | string    | URL gambar banner      |
| start_date   | date      | Tanggal mulai event    |
| end_date     | date      | Tanggal akhir event    |
| status       | enum      | draft/published/closed |
| created_at   | timestamp | Waktu dibuat           |
| updated_at   | timestamp | Waktu diupdate         |

## 8.3 Ticket Categories Table

| Field          | Type    | Description              |
| -------------- | ------- | ------------------------ |
| id             | integer | Primary key              |
| event_id       | integer | Foreign key ke Events    |
| category_name  | string  | Nama kategori tiket      |
| price          | decimal | Harga tiket              |
| quota          | integer | Kuota tiket              |
| limit_per_user | integer | Batas pembelian per user |

## 8.4 Schedules Table

| Field          | Type    | Description           |
| -------------- | ------- | --------------------- |
| id             | integer | Primary key           |
| event_id       | integer | Foreign key ke Events |
| date           | date    | Tanggal sesi          |
| session_name   | string  | Nama sesi             |
| start_time     | time    | Jam mulai             |
| end_time       | time    | Jam selesai           |
| capacity       | integer | Kapasitas total       |
| remaining_seat | integer | Sisa kursi tersedia   |

## 8.5 Orders Table

| Field                   | Type      | Description                          |
| ----------------------- | --------- | ------------------------------------ |
| id                      | integer   | Primary key                          |
| user_id                 | integer   | Foreign key ke Users                 |
| order_code              | string    | Kode order (unique)                  |
| schedule_id             | integer   | Foreign key ke Schedules             |
| total_amount            | decimal   | Total pembayaran                     |
| payment_status          | enum      | UNPAID/PAID/FAILED/CANCELED/REFUNDED |
| payment_method          | string    | Metode pembayaran                    |
| midtrans_transaction_id | string    | ID transaksi Midtrans                |
| created_at              | timestamp | Waktu dibuat                         |
| updated_at              | timestamp | Waktu diupdate                       |

## 8.6 Order Items Table

| Field         | Type      | Description                              |
| ------------- | --------- | ---------------------------------------- |
| id            | integer   | Primary key                              |
| order_id      | integer   | Foreign key ke Orders                    |
| category_id   | integer   | Foreign key ke Ticket Categories         |
| qr_code       | string    | QR code unique                           |
| status        | enum      | UNPAID/PAID/CHECKED-IN/CANCELED/REFUNDED |
| check_in_time | timestamp | Waktu check-in (nullable)                |
| created_at    | timestamp | Waktu dibuat                             |
| updated_at    | timestamp | Waktu diupdate                           |

---

# 9. ACCEPTANCE CRITERIA

## 9.1 Guest Login

- [PASS] Guest tidak bisa akses dashboard
- [PASS] Guest yang belum login tidak dapat melakukan checkout
- [PASS] Setelah login, kembali ke checkout otomatis

## 9.2 Admin Access

- [PASS] Admin dapat mengakses semua modul
- [PASS] Staff Gate tidak dapat melihat modul Admin

## 9.3 Purchase Process

- [PASS] Stok sesi tidak berkurang sebelum pembayaran sukses
- [PASS] Webhook mengupdate status transaksi

## 9.4 QR Ticket

- [PASS] Tiket hanya dapat di-scan sekali
- [PASS] Tiket dari tanggal berbeda → invalid

---

# 10. NON-FUNCTIONAL REQUIREMENTS

## 10.1 Performance

- Checkout < 2s response
- QR scan validation < 1s

## 10.2 Security

- JWT authentication
- Password hashing (bcrypt/argon2)
- Anti-rescan protection
- Webhook signature validation

## 10.3 Scalability

- Mendukung hingga 10.000 transaksi/hari
- Mendukung 5–10 gate scanning simultan
