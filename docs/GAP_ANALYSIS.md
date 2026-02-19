# Gap Analysis & Technical Recommendations
**Project:** Webapp Ticket Konser (Gilabs Studio)
**Date:** February 18, 2026

## 1. Executive Summary
Analisis ini mencakup evaluasi mendalam terhadap arsitektur backend, pengalaman pengguna frontend, keamanan, dan performa sistem. Secara keseluruhan, sistem memiliki fondasi yang sangat kuat (Production Ready) namun memerlukan beberapa peningkatan pada aspek skalabilitas, integritas data tingkat lanjut, dan stabilitas operasional di lapangan.

---

## 2. Backend (API) Gap Analysis

### 2.1 Audit & Compliance
*   **Gap:** Belum adanya sistem **Audit Logs**.
*   **Dampak:** Kesulitan dalam melacak perubahan sensitif (misal: siapa yang mengubah harga tiket atau memberikan akses admin kepada user tertentu).
*   **Rekomendasi:** Implementasikan tabel `audit_logs` untuk mencatat aksi: `user_id`, `action`, `resource`, `old_value`, `new_value`, dan `ip_address`.

### 2.2 Kelola Stok & Transaksi
*   **Gap:** Kurangnya logic **Refund & Reversal** otomatis.
*   **Dampak:** Proses pembatalan transaksi berbayar harus dilakukan manual di database/dashboard Midtrans tanpa sinkronisasi otomatis ke inventori tiket.
*   **Gap:** Belum mendukung **Multi-Currency atau Tax/Admin Fee** yang dinamis.
*   **Rekomendasi:** Tambahkan field `tax_amount` dan `platform_fee` pada skema order untuk transparansi biaya.

### 2.3 Modul Check-in (Penting)
*   **Gap:** Ketiadaan mekanisme **Offline/Sync-later**.
*   **Dampak:** Jika koneksi internet di lokasi konser terputus, proses check-in akan berhenti total.
*   **Rekomendasi:** Gunakan pendekatan *hybrid* (Local Cache di perangkat scanner) dengan syncing berkala ke pusat.

### 2.4 Performance & Query Quality
*   **Gap:** Query pencarian menggunakan `ILIKE` tanpa indeks pendukung.
*   **Dampak:** Penurunan performa saat data event dan user mencapai puluhan ribu record.
*   **Rekomendasi:** Tambahkan ekstensi `pg_trgm` pada Postgres dan buat GIN index pada kolom pencarian.

---

## 3. Frontend (Web) Gap Analysis

### 3.1 User Experience (UX)
*   **Gap:** Transisi loading masih menggunakan spinner standar.
*   **Dampak:** Aplikasi terasa kurang premium dan "patah" saat berpindah halaman data padat.
*   **Rekomendasi:** Gunakan **Skeleton Screens** untuk semua tabel dan list data.
*   **Gap:** Kurangnya **Optimistic Updates** pada fitur CRUD sederhana.

### 3.2 Fitur Member
*   **Gap:** Tidak ada opsi **Download E-Ticket PDF**.
*   **Dampak:** User harus login dan memiliki internet hanya untuk menunjukkan QR code saat masuk gate.
*   **Rekomendasi:** Integrasikan library PDF generator di sisi server untuk mengirim attachment tiket via email.

### 3.3 Dashboard Admin
*   **Gap:** Ketiadaan fitur **Export Data (CSV/Excel)**.
*   **Dampak:** Kesulitan bagi tim finance dan operasional untuk merekap data pengunjung pasca-event.
*   **Rekomendasi:** Tambahkan tombol export pada tabel Orders dan Attendance.

---

## 4. Security & Infrastructure

### 4.1 Keamanan Lanjutan
*   **Gap:** Kebijakan password masih minimalis.
*   **Rekomendasi:** Implementasikan *complexity checker* (huruf besar, angka, simbol) dan proteksi *brute force* yang lebih ketat di level middleware.
*   **Gap:** Sesi JWT tidak bisa di-revoke sebelum expired.
*   **Rekomendasi:** Gunakan Redis untuk menyimpan `token_blocklist`.

### 4.2 Skalabilitas Infrastruktur
*   **Gap:** Background processing dilakukan secara sinkron.
*   **Dampak:** API request menjadi lambat saat harus mengirim email atau generate tiket banyak sekaligus.
*   **Rekomendasi:** Implementasikan **Message Queue** (Redis + Asynq atau RabbitMQ).

---

## 5. Roadmap Rekomendasi Teknis

| Priority | Feature | Category | Goal |
| :--- | :--- | :--- | :--- |
| **High** | Audit Logs Implementation | Compliance | Tracing perubahan data admin |
| **High** | Search Optimization (GIN Index) | Performance | Menjaga kecepatan pencarian data |
| **Medium** | PDF Ticket Generator | User Experience | Memberikan akses offline bagi penonton |
| **Medium** | Export Data (CSV/Excel) | Operational | Mempermudah pelaporan pasca event |
| **Low** | Structured Logging (Zap/Slog) | Observability | Monitoring error yang lebih detail |

---
