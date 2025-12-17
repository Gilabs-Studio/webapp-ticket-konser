# Midtrans Setup Guide

Panduan lengkap untuk setup Midtrans payment gateway di aplikasi WebApp Ticketing.

---

## 📋 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Mendapatkan Credentials dari Midtrans](#mendapatkan-credentials-dari-midtrans)
3. [Environment Variables](#environment-variables)
4. [Setup Development (Sandbox)](#setup-development-sandbox)
5. [Setup Production](#setup-production)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

1. **Akun Midtrans**
   - Daftar di [Midtrans Dashboard](https://dashboard.midtrans.com/)
   - Verifikasi email dan lengkapi profil

2. **Akses ke Environment Variables**
   - File `.env` untuk development
   - Environment variables di production server

---

## Mendapatkan Credentials dari Midtrans

### 1. Login ke Midtrans Dashboard

- Buka: https://dashboard.midtrans.com/
- Login dengan akun Midtrans Anda

### 2. Pilih Environment

**Untuk Development:**

- Pilih **Sandbox** environment (default untuk testing)

**Untuk Production:**

- Pilih **Production** environment (setelah akun di-approve)

### 3. Ambil Credentials

1. Klik **Settings** → **Access Keys**
2. Copy credentials berikut:
   - **Server Key**: Digunakan untuk backend API calls
   - **Client Key**: Digunakan untuk frontend (jika diperlukan)
   - **Merchant ID**: Merchant identifier

**⚠️ PENTING:**

- **Server Key** adalah **SENSITIVE** - jangan pernah commit ke repository
- **Client Key** bisa digunakan di frontend (public)
- Simpan credentials dengan aman

---

## Environment Variables

### Required Variables

Tambahkan environment variables berikut ke file `.env` di `apps/api/`:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=your-server-key-here
MIDTRANS_CLIENT_KEY=your-client-key-here
MIDTRANS_MERCHANT_ID=your-merchant-id-here
MIDTRANS_IS_PRODUCTION=false
```

### Variable Descriptions

| Variable                 | Description                                    | Required | Example               |
| ------------------------ | ---------------------------------------------- | -------- | --------------------- |
| `MIDTRANS_SERVER_KEY`    | Server key untuk backend API calls             | ✅ Yes   | `SB-Mid-server-xxxxx` |
| `MIDTRANS_CLIENT_KEY`    | Client key untuk frontend (optional)           | ✅ Yes   | `SB-Mid-client-xxxxx` |
| `MIDTRANS_MERCHANT_ID`   | Merchant identifier                            | ✅ Yes   | `G123456789`          |
| `MIDTRANS_IS_PRODUCTION` | `true` untuk production, `false` untuk sandbox | ✅ Yes   | `false`               |

---

## Setup Development (Sandbox)

### 1. Buat File `.env`

Di folder `apps/api/`, buat file `.env` (jika belum ada):

```bash
cd apps/api
touch .env
```

### 2. Tambahkan Midtrans Credentials

Edit file `.env` dan tambahkan:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ticketing_app
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-minimum-32-characters-long
JWT_ACCESS_TTL=24
JWT_REFRESH_TTL=7

# Server Configuration
PORT=8083
ENV=development

# Midtrans Configuration (Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxxx
MIDTRANS_MERCHANT_ID=G123456789
MIDTRANS_IS_PRODUCTION=false
```

### 3. Verifikasi Setup

Jalankan aplikasi dan cek log:

```bash
cd apps/api
go run cmd/server/main.go
```

**Expected Output:**

```
Server starting on port 8083
```

**Jika credentials tidak di-set, akan muncul warning:**

```
WARNING: MIDTRANS_SERVER_KEY is not set. Payment features will not work.
WARNING: MIDTRANS_CLIENT_KEY is not set. Payment features will not work.
WARNING: MIDTRANS_MERCHANT_ID is not set. Payment features will work.
```

### 4. Test Payment Flow

1. Buat order melalui API atau frontend
2. Initiate payment
3. QRIS code akan muncul
4. Gunakan **Midtrans Testing Tools** untuk simulate payment

---

## Setup Production

### 1. Request Production Access

1. Login ke Midtrans Dashboard
2. Pilih **Production** environment
3. Lengkapi **Business Information**:
   - Company name
   - Business type
   - Website URL
   - Business address
   - Contact information
4. Submit untuk review
5. Tunggu approval dari Midtrans (biasanya 1-3 hari kerja)

### 2. Update Environment Variables

Setelah production access di-approve:

```env
# Midtrans Configuration (Production)
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxxxxxxxxx
MIDTRANS_MERCHANT_ID=G123456789
MIDTRANS_IS_PRODUCTION=true
```

**⚠️ PENTING:**

- Pastikan `MIDTRANS_IS_PRODUCTION=true` untuk production
- APIBaseURL akan otomatis di-set ke `https://api.midtrans.com`
- Jangan gunakan sandbox credentials di production

### 3. Setup Webhook URL

Lihat section [Webhook Configuration](#webhook-configuration) di bawah.

---

## Webhook Configuration

### 1. Setup Webhook URL di Midtrans Dashboard

1. Login ke Midtrans Dashboard
2. Pilih environment (Sandbox atau Production)
3. Klik **Settings** → **Configuration**
4. Scroll ke **Payment Notification URL**
5. Masukkan webhook URL:
   ```
   https://your-domain.com/api/v1/payments/webhook
   ```
6. Klik **Save**

### 2. Webhook Security

**✅ Sudah Diimplementasikan:**

- Webhook signature verification (SHA512)
- Payment amount validation
- Idempotency check

**Webhook Signature Verification:**

- Signature dihitung sebagai: `SHA512(order_id + status_code + gross_amount + server_key)`
- Semua webhook request akan di-verify sebelum diproses
- Invalid signature akan di-reject dengan status 401

### 3. Testing Webhook

**Menggunakan Midtrans Dashboard:**

1. Klik **Settings** → **Configuration**
2. Scroll ke **Payment Notification URL**
3. Klik **Test Notification**
4. Pilih transaction untuk test
5. Klik **Send Test Notification**

**Menggunakan Postman:**

- Lihat collection: `Payment Webhook → Midtrans Payment Webhook`
- Pastikan signature_key dihitung dengan benar

### 4. Webhook Payload Example

```json
{
  "transaction_time": "2025-01-15 10:35:00",
  "transaction_status": "settlement",
  "transaction_id": "midtrans-transaction-id",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "signature-hash-here",
  "payment_type": "qris",
  "order_id": "ORD-20250115-abc123",
  "merchant_id": "G123456789",
  "gross_amount": "500000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

---

## Testing

### 1. Test Payment Initiation

**Endpoint:** `POST /api/v1/orders/:id/payment`

**Request:**

```json
{
  "payment_method": "qris"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "order_id": "order-uuid",
    "transaction_id": "midtrans-transaction-id",
    "payment_type": "qris",
    "qris_code": "00020101021226650013ID.CO.QRIS.WWW...",
    "payment_url": "https://app.sandbox.midtrans.com/...",
    "expires_at": "2025-01-15T10:45:00+07:00",
    "status": "pending"
  }
}
```

### 2. Test Payment Status Check

**Endpoint:** `GET /api/v1/orders/:id/payment-status`

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "order_id": "order-uuid",
    "payment_status": "PAID",
    "payment_method": "qris",
    "transaction_id": "midtrans-transaction-id",
    "paid_at": "2025-01-15T10:35:00+07:00",
    "expires_at": null,
    "is_expired": false
  }
}
```

### 3. Test Webhook

**Endpoint:** `POST /api/v1/payments/webhook`

**Request:** (dari Midtrans)

```json
{
  "transaction_time": "2025-01-15 10:35:00",
  "transaction_status": "settlement",
  "transaction_id": "midtrans-transaction-id",
  "status_code": "200",
  "signature_key": "calculated-signature",
  "payment_type": "qris",
  "order_id": "ORD-20250115-abc123",
  "merchant_id": "G123456789",
  "gross_amount": "500000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Expected Response:**

```json
{
  "status": "ok"
}
```

### 4. Test dengan Midtrans Testing Tools

**QRIS Testing:**

1. Generate QRIS code melalui payment initiation
2. Scan QRIS code dengan aplikasi e-wallet (GoPay, ShopeePay, Dana, dll)
3. Gunakan **Midtrans Testing Tools** untuk simulate payment:
   - Login ke Dashboard
   - Klik **Transactions** → Pilih transaction
   - Klik **Actions** → **Simulate Payment**
   - Pilih status: `settlement`, `expire`, `cancel`, `deny`

---

## Troubleshooting

### Problem: Payment initiation gagal

**Error:** `MIDTRANS_ERROR` atau `502 Bad Gateway`

**Solutions:**

1. ✅ Cek `MIDTRANS_SERVER_KEY` sudah benar
2. ✅ Cek `MIDTRANS_IS_PRODUCTION` sesuai environment
3. ✅ Cek koneksi internet ke Midtrans API
4. ✅ Cek log error untuk detail lebih lanjut

### Problem: Webhook tidak diterima

**Error:** Webhook tidak dipanggil oleh Midtrans

**Solutions:**

1. ✅ Cek webhook URL sudah di-set di Midtrans Dashboard
2. ✅ Pastikan webhook URL accessible dari internet (tidak localhost)
3. ✅ Gunakan HTTPS untuk production
4. ✅ Cek firewall/security group allow incoming requests
5. ✅ Test webhook menggunakan "Test Notification" di Dashboard

### Problem: Webhook signature verification gagal

**Error:** `Invalid webhook signature`

**Solutions:**

1. ✅ Pastikan `MIDTRANS_SERVER_KEY` sama dengan yang di Dashboard
2. ✅ Cek signature calculation (SHA512)
3. ✅ Pastikan payload tidak di-modify sebelum verification
4. ✅ Cek log untuk melihat signature yang dihitung vs yang diterima

### Problem: Payment amount mismatch

**Error:** `Payment amount mismatch`

**Solutions:**

1. ✅ Pastikan `gross_amount` dari webhook sama dengan `total_amount` di order
2. ✅ Cek currency conversion (jika ada)
3. ✅ Cek floating point precision (tolerance 0.01 sudah di-handle)

### Problem: Order tidak update setelah payment success

**Error:** Order tetap UNPAID setelah webhook settlement

**Solutions:**

1. ✅ Cek webhook handler log untuk error
2. ✅ Cek order status di database
3. ✅ Cek apakah OrderItem generation berhasil
4. ✅ Cek idempotency (jika webhook dipanggil multiple times)

### Problem: QRIS code tidak muncul

**Error:** QRIS code kosong atau null

**Solutions:**

1. ✅ Cek response dari Midtrans API
2. ✅ Cek `qr_string` field di response
3. ✅ Pastikan payment method = "qris"
4. ✅ Cek log untuk error dari Midtrans

---

## Security Best Practices

### ✅ Sudah Diimplementasikan

1. **Webhook Signature Verification**
   - SHA512 hash verification
   - Prevent webhook spoofing

2. **Payment Amount Validation**
   - Verify amount dari webhook dengan order amount
   - Prevent amount manipulation

3. **Secure Credential Storage**
   - Environment variables (tidak hardcoded)
   - Docker secrets untuk production

4. **Idempotency Check**
   - Prevent duplicate payment processing
   - Check transaction ID sebelum process

### ⚠️ Recommendations untuk Production

1. **IP Whitelist (Optional)**
   - Whitelist Midtrans IP addresses
   - Tambahkan middleware untuk IP filtering

2. **Rate Limiting**
   - Limit webhook requests per IP
   - Prevent webhook spam

3. **Logging & Monitoring**
   - Log semua payment transactions
   - Setup alerting untuk payment failures
   - Monitor webhook delivery

4. **HTTPS Only**
   - Pastikan webhook URL menggunakan HTTPS
   - Valid SSL certificate

---

## Quick Reference

### Environment Variables Template

```env
# Development (Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxxx
MIDTRANS_MERCHANT_ID=G123456789
MIDTRANS_IS_PRODUCTION=false

# Production
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxxxxxxxxx
MIDTRANS_MERCHANT_ID=G123456789
MIDTRANS_IS_PRODUCTION=true
```

### API Endpoints

- **Payment Initiation:** `POST /api/v1/orders/:id/payment`
- **Payment Status Check:** `GET /api/v1/orders/:id/payment-status`
- **Webhook Handler:** `POST /api/v1/payments/webhook`

### Midtrans Dashboard Links

- **Sandbox Dashboard:** https://dashboard.sandbox.midtrans.com/
- **Production Dashboard:** https://dashboard.midtrans.com/
- **Documentation:** https://docs.midtrans.com/

---

## Support

Jika mengalami masalah:

1. **Cek Dokumentasi Midtrans:** https://docs.midtrans.com/
2. **Cek Log Aplikasi:** Cari error messages di console
3. **Cek Midtrans Dashboard:** Lihat transaction details
4. **Contact Midtrans Support:** support@midtrans.com

---

**Last Updated:** 2025-01-17  
**Version:** 1.0.0
