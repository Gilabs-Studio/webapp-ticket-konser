# Postman Collection - WebApp Ticketing API

Dokumentasi Postman collection untuk WebApp Ticketing API.

## Setup

1. **Import Collection**
   - Buka Postman
   - Klik Import
   - Pilih file `WebApp-Ticketing-API.postman_collection.json`

2. **Setup Environment Variables**
   - Buat environment baru dengan nama "WebApp Ticketing - Local"
   - Set variable:
     - `base_url`: `http://localhost:8080`
   - Set variable:
     - `token`: (akan di-set otomatis setelah login)
     - `refresh_token`: (akan di-set otomatis setelah login)
     - `user_id`: (akan di-set otomatis setelah login)

## Usage

### 1. Health Check
- Jalankan request "Health" atau "Ping" untuk memastikan API berjalan

### 2. Login
- Jalankan request "Login" dengan credentials:
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```
- Token akan otomatis disimpan di environment variable setelah login berhasil

### 3. Authenticated Requests
- Semua request yang memerlukan authentication akan otomatis menggunakan token dari environment variable
- Token akan di-set di header `Authorization: Bearer {{token}}`

## Collection Structure

### Authentication
- **Login**: POST `/api/v1/auth/login`
  - Response includes `user.permissions` as array of strings (permission codes only)
  - Lightweight format for quick authorization checks
  - Use for: route guards, permission validation
- **Get User Menus and Permissions**: GET `/api/v1/auth/me/menus-permissions`
  - Response includes full menu and permission objects with complete metadata
  - Complete format for UI rendering and management
  - Use for: navigation menu, permission management UI
- **Refresh Token**: POST `/api/v1/auth/refresh`
- **Logout**: POST `/api/v1/auth/logout`

#### Understanding Permissions in Login vs Menus-Permissions

**Login Response (`POST /api/v1/auth/login`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "admin@example.com",
      "permissions": ["ticket.read", "ticket.create", "event.read"]
    },
    "token": "...",
    "refresh_token": "..."
  }
}
```
- `permissions` adalah **array of strings** (codes only)
- **Ringan** (~100 bytes untuk 20 permissions)
- **Cepat** untuk authorization checks
- **Gunakan untuk**: Route guards, permission validation, quick checks

**Menus-Permissions Response (`GET /api/v1/auth/me/menus-permissions`):**
```json
{
  "success": true,
  "data": {
    "menus": [
      {
        "id": "menu-uuid",
        "code": "dashboard",
        "label": "Dashboard",
        "icon": "home",
        "path": "/dashboard",
        "permission_code": "dashboard.read",
        "children": [...]
      }
    ],
    "permissions": [
      {
        "id": "permission-uuid",
        "code": "ticket.read",
        "name": "Read Ticket",
        "description": "Permission untuk membaca data ticket",
        "resource": "ticket",
        "action": "read"
      }
    ]
  }
}
```
- `menus` dan `permissions` adalah **full objects** dengan semua metadata
- **Lengkap** (~2-5 KB untuk 20 permissions)
- **Gunakan untuk**: Build navigation menu, display permission details, permission management UI

**Best Practice:**
1. Setelah login, simpan `user.permissions` (string array) untuk quick checks
2. Fetch `/auth/me/menus-permissions` sekali setelah login untuk UI data
3. Cache hasil di frontend store untuk menghindari re-fetch

### Health Check
- **Health**: GET `/health`
- **Ping**: GET `/ping`

## Response Format

Semua response mengikuti format standar:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:45+07:00",
  "request_id": "req_abc123xyz"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "timestamp": "2024-01-15T10:30:45+07:00",
  "request_id": "req_abc123xyz"
}
```

## Notes

- Collection ini akan terus diupdate sesuai dengan perkembangan API
- Untuk detail lengkap, lihat dokumentasi di `/docs/api-standart/`

