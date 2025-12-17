# Sprint Planning - Developer 1 (Fullstack Developer)

## Ticketing Konser Internasional Platform

**Developer**: Fullstack Developer (Go Backend + Next.js Frontend)  
**Role**: Develop modul-modul ticketing secara fullstack (backend + frontend)  
**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-15

---

## 📋 Overview

Developer 1 bertanggung jawab untuk:

- **Fullstack Development**: Develop modul-modul yang ditugaskan secara lengkap (backend API + frontend)
- **Backend**: Go (Gin) APIs untuk modul yang ditugaskan
- **Frontend**: Next.js 16 frontend untuk modul yang ditugaskan
- **Database**: Design dan implement database schema untuk modul yang ditugaskan
- **Postman Collection**: Update Postman collection untuk modul yang ditugaskan

**Modul yang ditugaskan ke Dev1**:

1. ✅ User Management & Access Control (Fullstack) - **Dipindahkan dari Dev2**
2. ✅ Role Management (Fullstack) - **Dipindahkan dari Dev2**
3. ✅ Permission Management (Fullstack) - **Dipindahkan dari Dev2**
4. ✅ Menu Management (Fullstack) - **Dipindahkan dari Dev2**
5. ✅ Authentication (Fullstack) - **Dipindahkan dari Dev2**
6. ✅ Event Management (Fullstack)
7. ✅ Ticket Category Management (Fullstack)
8. ✅ Schedule Management (Fullstack)
9. ✅ Ticket Purchase Flow (Frontend + Backend Integration)
10. ✅ E-Ticket Generation & QR Code (Fullstack)
11. ✅ Order History (Fullstack)
12. ✅ Analytics Dashboard (Fullstack)
13. ✅ Mobile APIs untuk Staff Gate (Backend) - **Untuk Mobile App (Dev3)**

**Parallel Development Strategy**:

- ✅ **TIDAK bergantung ke Dev2** - bisa dikerjakan paralel (kecuali auth di sprint awal)
- ✅ Setiap modul dikerjakan fullstack sampai selesai
- ✅ **Hackathon mode** - tidak ada unit test intensif
- ✅ Manual testing saja

---

## 🎯 Sprint Details

### Sprint 0: Foundation & Event Setup (Week 1)

**Goal**: Setup foundation dan basic project structure

**Status**: ✅ **COMPLETED**

**Backend Tasks**:

- [x] Review authentication flow (login, token refresh)
- [x] Setup project structure
- [x] Review database schema
- [x] Setup basic routing
- [x] Review API standards

**Frontend Tasks**:

- [x] Review project structure
- [x] Setup basic layout
- [x] Review authentication flow

**Postman Collection**:

- [x] Review existing Postman collection structure

**Acceptance Criteria**:

- ✅ Project structure setup
- ✅ Development environment ready
- ✅ Basic routing works

**Testing** (Manual testing):

- Test basic setup

**Estimated Time**: 3-4 days

---

### Sprint 0.5: User Management & Access Control (Dipindahkan dari Dev2) (Week 1-2)

**Goal**: Implement user management, role management, permission management, menu management, dan authentication

**Status**: ✅ **BACKEND COMPLETED** | ✅ **FRONTEND COMPLETED**

**Note**: Modul ini dipindahkan dari Dev2 karena sudah dikerjakan sebelumnya.

**Best Practice - Permissions Implementation**:

- **Login Response**: `user.permissions` adalah array of strings (permission codes only) - ringan, cepat, untuk authorization checks
- **Menus-Permissions Endpoint**: Full menu dan permission objects dengan metadata lengkap - untuk UI rendering dan permission management
- **Frontend Strategy**:
  - Simpan `user.permissions` (string array) dari login untuk quick permission checks
  - Fetch `/auth/me/menus-permissions` sekali setelah login untuk UI data (menus, permission details)
  - Cache hasil menus-permissions di TanStack Query (staleTime: 5 minutes)

**Backend Tasks** (✅ **COMPLETED**):

- [x] Review authentication flow (login, token refresh)
- [x] Create user model dan migration
- [x] Create role model dan migration
- [x] Create permission model dan migration
- [x] Create user repository interface dan implementation
- [x] Create role repository interface dan implementation
- [x] Create permission repository interface dan implementation
- [x] Create user service
- [x] Create role service
- [x] Create permission service
- [x] Create menu service
- [x] Implement user CRUD APIs (`GET /api/v1/admin/users`, `POST /api/v1/admin/users`, `PUT /api/v1/admin/users/:id`, `DELETE /api/v1/admin/users/:id`)
- [x] Implement role CRUD APIs (`GET /api/v1/admin/roles`, `POST /api/v1/admin/roles`, `PUT /api/v1/admin/roles/:id`, `DELETE /api/v1/admin/roles/:id`)
- [x] Implement permission CRUD APIs (`GET /api/v1/admin/permissions`, `POST /api/v1/admin/permissions`, `PUT /api/v1/admin/permissions/:id`, `DELETE /api/v1/admin/permissions/:id`)
- [x] Implement role-permission assignment APIs (`PUT /api/v1/admin/roles/:id/permissions`)
- [x] Implement user-role assignment APIs
- [x] Implement menu APIs (`GET /api/v1/admin/menus`, `GET /api/v1/auth/me/menus-permissions`)
- [x] Create middleware untuk role-based access control
- [x] Create middleware untuk permission-based access control
- [x] Implement route protection berdasarkan role
- [x] Implement route protection berdasarkan permission
- [x] Implement user context middleware (untuk get current user)
- [x] Add validation
- [x] Add role seeder (Super Admin, Finance, Gate Staff)
- [x] Add permission seeder untuk ticketing system
- [x] Add menu seeder

**Frontend Tasks** (✅ **COMPLETED**):

- [x] Create auth guard component (`AuthGuard`)
- [x] Create role guard component (`RoleGuard`)
- [x] Create permission guard component (`PermissionGuard`)
- [x] Implement route protection di Next.js
- [x] Add role-based menu visibility
- [x] Add permission-based button visibility
- [x] Add user context provider
- [x] Add role/permission checking hooks
- [x] Create menu list component (✅ Completed)
- [x] Create authentication flow (Login, Logout) (✅ Completed)
- [x] Create auth guards (AuthGuard, RoleGuard, PermissionGuard) (✅ Completed)
- [x] Create auth hooks (useLogin, useLogout, useAuthGuard) (✅ Completed)
- [x] Create auth service (authService) (✅ Completed)
- [x] Create auth store (useAuthStore) (✅ Completed)
- [x] Create auth types (✅ Completed)
- [x] Implement getMenusPermissions service method (✅ Completed)
- [x] Create useMenus hook untuk fetch menus-permissions (✅ Completed)
- [x] Create useUserPermissions hook untuk fetch full permissions (✅ Completed)
- [x] Implement caching strategy untuk menus-permissions (✅ Completed - menggunakan TanStack Query dengan staleTime)
- [x] Create user types (`types/index.d.ts`) - ✅ Completed
- [x] Create role types (`types/index.d.ts`) - ✅ Completed
- [x] Create permission types (`types/index.d.ts`) - ✅ Completed
- [x] Create user service (`userService`) - ✅ Completed
- [x] Create role service (`roleService`) - ✅ Completed
- [x] Create permission service (`permissionService`) - ✅ Completed
- [x] Create user list page (`/admin/users-management`) - ✅ Completed
- [x] Create user form component (`UserForm`) - ✅ Completed
- [x] Create user detail page (`/admin/users-management/[id]`) dengan tab access role dan permissions - ✅ Completed
- [x] Create role list page (`/admin/roles-management`) - ✅ Completed
- [x] Create permission list page (`/admin/permissions-management`) - ✅ Completed
- [x] Add user search and filter - ✅ Completed
- [x] Create access denied page (`/admin/access-denied`) - ✅ Completed

**Postman Collection**:

- [x] Add user APIs ke Postman collection
- [x] Add role APIs ke Postman collection
- [x] Add permission APIs ke Postman collection
- [x] Add menu APIs ke Postman collection
- [x] Update Postman collection dengan auth headers untuk protected endpoints
- [x] Add detailed documentation untuk Login endpoint (permissions sebagai string array)
- [x] Add detailed documentation untuk Get User Menus and Permissions endpoint (full objects)
- [x] Add best practice notes tentang penggunaan kedua endpoint

**Acceptance Criteria**:

- ✅ User CRUD APIs bekerja dengan baik
- ✅ Role CRUD APIs bekerja dengan baik
- ✅ Permission CRUD APIs bekerja dengan baik
- ✅ Role-permission assignment bekerja
- ✅ User-role assignment bekerja
- ✅ Menu APIs bekerja dengan baik
- ✅ Access control middleware bekerja dengan baik
- ✅ Route protection berdasarkan role bekerja
- ✅ Route protection berdasarkan permission bekerja
- ✅ Frontend route protection bekerja
- ✅ Role-based menu visibility bekerja
- ✅ Permission-based button visibility bekerja
- ✅ Authentication flow bekerja (Login, Logout)
- ✅ Frontend user/role/permission management (completed)
- ✅ Admin dapat manage users, roles, dan permissions (completed)
- ✅ User detail page dengan tab access role dan permissions (completed)
- ✅ Menus-permissions endpoint integration (completed)
- ✅ Best practice implementation: Login permissions (string array) untuk quick checks, Menus-Permissions (full objects) untuk UI rendering (completed)
- ✅ Postman collection updated dengan dokumentasi lengkap tentang perbedaan Login vs Menus-Permissions endpoints

**Testing** (Manual testing):

- Test user CRUD (backend)
- Test role CRUD (backend)
- Test permission CRUD (backend)
- Test role-permission assignment (backend)
- Test user-role assignment (backend)
- Test access control dengan berbagai roles
- Test access control dengan berbagai permissions
- Test frontend route protection
- Test menu visibility berdasarkan role
- Test button visibility berdasarkan permission
- Test authentication flow

**Estimated Time**: 3-4 days (Backend sudah completed, Frontend completed)

---

### Sprint 1: Event Management (Week 2)

**Goal**: Implement event management dengan CRUD lengkap

**Status**: ✅ **BACKEND COMPLETED** | ⏳ **FRONTEND IN PROGRESS** (Types ✅, Service ✅, Components ✅, Admin Pages ✅, Public Pages ✅)

**Backend Tasks**:

- [x] Create event model dan migration
- [x] Create event repository interface dan implementation
- [x] Create event service
- [x] Implement event CRUD APIs (`GET /api/v1/admin/events`, `POST /api/v1/admin/events`, `PUT /api/v1/admin/events/:id`, `DELETE /api/v1/admin/events/:id`)
- [x] Implement event detail API (`GET /api/v1/admin/events/:id`)
- [x] Implement public event list API (`GET /api/v1/events`) - untuk guest (ListPublic - hanya published events)
- [x] Implement public event detail API (`GET /api/v1/events/:id`) - untuk guest (GetByIDPublic - hanya published events)
- [x] Add event status management (draft, published, closed) - `PATCH /api/v1/admin/events/:id/status`
- [x] Add banner image upload functionality - `POST /api/v1/admin/events/:id/banner` (form-data, max 5MB, JPEG/PNG/WebP)
- [x] Add validation (event name, date range, status)
- [x] Add event seeder untuk testing

**Frontend Tasks**:

- [x] Create event types (`types/event.d.ts`) - ✅ Completed (include status field)
- [x] Create event service (`eventService`) - ✅ Completed
- [x] Create event list page (`/admin/events-management`) - ✅ Completed
- [x] Create event form component (`EventForm`) - ✅ Completed
- [x] Create event detail page (`/admin/events-management/[id]`) - ✅ Completed
- [x] Create public event list page (`/events`) - ✅ Completed
- [x] Create public event detail page (`/events/[id]`) - ✅ Completed
- [x] Add event search and filter - ✅ Completed (di EventList component)
- [x] Add event status management UI (draft, published, closed) - ✅ Completed (di EventForm dan EventDetail)
- [x] Add banner image upload component (form-data, max 5MB, JPEG/PNG/WebP) - ✅ Completed (EventBannerUpload component)
- [x] Add event status badge component - ✅ Completed (EventStatusBadge component)

**Postman Collection**:

- [x] Add event APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Event CRUD APIs bekerja dengan baik
- ✅ Event status management bekerja (draft, published, closed)
- ✅ Banner image upload bekerja (form-data, max 5MB, JPEG/PNG/WebP)
- ✅ Public APIs hanya menampilkan published events
- ✅ Frontend terintegrasi dengan backend APIs (completed)
- ✅ Admin dapat manage events (completed - admin pages ready)
- ✅ Guest dapat melihat event list dan detail (completed - public pages ready)
- ✅ Form validation comprehensive (completed - Zod schemas)
- ✅ UI/UX modern dan intuitive (completed - components ready)
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test event CRUD (backend + frontend)
- Test event status management
- Test banner image upload
- Test public event list dan detail

**Estimated Time**: 4-5 days

---

### Sprint 2: Ticket Category & Schedule Management (Week 3)

**Goal**: Implement ticket category dan schedule management dengan rundown jadwal event

**Status**: ✅ **BACKEND COMPLETED** | ✅ **FRONTEND COMPLETED**

**Backend Tasks**:

- [x] Create ticket category model dan migration
- [x] Create schedule model dan migration (include artist_name dan rundown fields)
- [x] Create ticket category repository interface dan implementation
- [x] Create schedule repository interface dan implementation
- [x] Create ticket category service
- [x] Create schedule service
- [x] Implement ticket category CRUD APIs (`GET /api/v1/admin/ticket-categories`, `POST /api/v1/admin/ticket-categories`, `PUT /api/v1/admin/ticket-categories/:id`, `DELETE /api/v1/admin/ticket-categories/:id`)
- [x] Implement schedule CRUD APIs (`GET /api/v1/admin/schedules`, `POST /api/v1/admin/schedules`, `PUT /api/v1/admin/schedules/:id`, `DELETE /api/v1/admin/schedules/:id`)
- [x] Implement get ticket categories by event API (`GET /api/v1/admin/ticket-categories/event/:event_id`)
- [x] Implement get schedules by event API (`GET /api/v1/admin/schedules/event/:event_id`)
- [x] Implement public ticket categories API (`GET /api/v1/events/:event_id/ticket-categories`) - untuk guest
- [x] Implement public schedules API (`GET /api/v1/events/:event_id/schedules`) - untuk guest (include rundown)
- [x] Add quota management untuk ticket category
- [x] Add remaining seat tracking untuk schedule
- [x] Add validation (price, quota, capacity, date range, artist_name, rundown)
- [x] Add ticket category seeder
- [x] Add schedule seeder dengan rundown contoh

**Frontend Tasks**:

- [x] Create ticket category types (`types/ticket-category.d.ts`) - ✅ Completed
- [x] Create schedule types (`types/schedule.d.ts`) - include artist_name dan rundown - ✅ Completed
- [x] Create ticket category service (`ticketCategoryService`) - ✅ Completed
- [x] Create schedule service (`scheduleService`) - ✅ Completed
- [x] Create ticket category list page (`/admin/ticket-categories`) - components only - ✅ Completed (ada di `/admin/tickets`)
- [x] Create ticket category form component (`TicketCategoryForm`) - ✅ Completed
- [x] Create schedule list page (`/admin/schedules`) - components only - ✅ Completed (ada di `/admin/tickets`)
- [x] Create schedule form component (`ScheduleForm`) - include artist_name dan rundown fields - ✅ Completed
- [x] Create rundown editor component (`RundownEditor`) - textarea dengan format support (newline untuk line breaks) - ✅ Completed
- [x] Create rundown display component (`RundownDisplay`) - untuk menampilkan rundown dengan formatting - ✅ Completed
- [x] Add ticket category management di event detail - ✅ Completed (tabs di event detail page)
- [x] Add schedule management di event detail - ✅ Completed (tabs di event detail page)
- [x] Add quota display dan management - ✅ Completed (display di TicketCategoryList)
- [x] Add remaining seat display - ✅ Completed (display di ScheduleList dengan badge status)
- [x] Add date picker untuk schedule - ✅ Completed (input type="date")
- [x] Add time picker untuk schedule - ✅ Completed (input type="time")
- [x] Add artist name input field - ✅ Completed (di ScheduleForm)
- [x] Add rundown preview di schedule detail - ✅ Completed (RundownDisplay component)
- [ ] Display rundown di public schedule detail untuk guest - **PENDING** (akan diimplementasikan di public event detail page)

**Postman Collection**:

- [x] Add ticket category APIs ke Postman collection
- [x] Add schedule APIs ke Postman collection (include artist_name dan rundown di request body)

**Acceptance Criteria**:

- ✅ Ticket category CRUD APIs bekerja dengan baik
- ✅ Schedule CRUD APIs bekerja dengan baik (include artist_name dan rundown)
- ✅ Rundown dapat diinput dan disimpan dengan format yang benar
- ✅ Rundown ditampilkan dengan formatting yang baik (line breaks, dll)
- ✅ Quota management bekerja
- ✅ Remaining seat tracking bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Admin dapat manage ticket categories dan schedules dengan rundown (via event detail page tabs)
- ⏳ Guest dapat melihat ticket categories dan schedules per event (include rundown) - Public APIs ready, frontend pending
- ✅ Form validation comprehensive (include rundown validation)
- ✅ UI/UX modern dan intuitive
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test ticket category CRUD (backend + frontend)
- Test schedule CRUD dengan rundown (backend + frontend)
- Test rundown input dan display
- Test quota management
- Test remaining seat tracking
- Test public APIs untuk guest (include rundown)

**Estimated Time**: 4-5 days

---

### Sprint 3: Ticket Purchase Flow dengan Payment Integration (Week 4-5)

**Goal**: Implement complete ticket purchase flow dengan payment integration (Midtrans QRIS)

**Status**: ✅ **BACKEND COMPLETED (Admin APIs)** | ⏳ **FRONTEND BELUM DIMULAI** | ⏳ **GUEST APIs & PAYMENT PENDING**

**Backend Tasks**:

- [x] Create order model dan migration
- [x] Create order item model dan migration
- [x] Create order repository interface dan implementation
- [x] Create order service
- [ ] Implement create order API (`POST /api/v1/orders`) - untuk guest
- [ ] Implement order detail API (`GET /api/v1/orders/:id`) - untuk guest
- [ ] Implement order list API (`GET /api/v1/orders`) - untuk guest (my orders)
- [x] Implement admin order list API (`GET /api/v1/admin/orders`)
- [x] Implement admin order detail API (`GET /api/v1/admin/orders/:id`)
- [ ] Add quota decrement saat order dibuat
- [ ] Add remaining seat decrement saat order dibuat
- [x] Add order status management (UNPAID, PAID, FAILED, CANCELED, REFUNDED)
- [ ] Add validation (quota check, category availability, schedule availability)
- [ ] **NEW**: Setup Midtrans SDK/Client (Go library)
- [ ] **NEW**: Implement Midtrans payment initiation API (`POST /api/v1/orders/:id/payment`) - Create Midtrans transaction
- [ ] **NEW**: Implement Midtrans webhook handler (`POST /api/v1/payments/webhook`) - Handle payment status update dari Midtrans
- [ ] **NEW**: Implement payment status check API (`GET /api/v1/orders/:id/payment-status`) - Check payment status
- [ ] **NEW**: Add QRIS payment method support (via Midtrans)
- [ ] **NEW**: Add payment callback handling (success/failure)
- [ ] **NEW**: Add auto quota restore jika payment failed/timeout
- [ ] **NEW**: Add payment expiration handling
- [x] Add order seeder untuk testing

**Frontend Tasks**:

- [ ] Create order types (`types/order.d.ts`)
- [ ] Create order service (`orderService`)
- [ ] Create ticket purchase page (`/events/[event_id]/purchase`)
- [ ] Create event selection flow (pilih event → pilih schedule → pilih ticket category)
- [ ] Create ticket selection component (`TicketSelection`)
- [ ] Create order summary component (`OrderSummary`)
- [ ] Create order form component (`OrderForm`)
- [ ] Add buyer information form - **PENDING**
- [ ] **NEW**: Create payment page (`/orders/[id]/payment`) - **PENDING**
- [ ] **NEW**: Create Midtrans payment integration (Snap/QRIS)
- [ ] **NEW**: Display QRIS barcode untuk payment
- [ ] **NEW**: Add payment status polling (check payment status secara real-time)
- [ ] **NEW**: Create payment success page (`/orders/[id]/success`)
- [ ] **NEW**: Create payment failure page (`/orders/[id]/failed`)
- [ ] **NEW**: Add payment timeout handling
- [ ] Add order confirmation page
- [ ] Add order status display
- [ ] Create my orders page (`/orders`) - untuk guest
- [ ] Create order detail page (`/orders/[id]`) - untuk guest (include payment status)
- [ ] Create admin order list page (`/admin/orders`)
- [ ] Create admin order detail page (`/admin/orders/[id]`)

**Postman Collection**:

- [x] Add order APIs ke Postman collection (Admin APIs sudah ada)
- [ ] Add payment APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Order creation APIs bekerja dengan baik
- ✅ Quota decrement otomatis saat order dibuat
- ✅ Frontend purchase flow bekerja dengan baik
- ✅ User dapat select ticket tier dan quantity
- ✅ Order validation bekerja (quota, availability)
- ✅ Order status management bekerja
- ✅ **Midtrans payment integration bekerja (QRIS)**
- ✅ **QRIS barcode ditampilkan untuk payment**
- ✅ **Payment webhook handler bekerja**
- ✅ **Payment status update otomatis setelah pembayaran**
- ✅ **Auto quota restore jika payment failed**
- ✅ UI/UX mobile-friendly untuk pembeli
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test order creation (backend + frontend)
- Test quota decrement
- Test order validation
- **Test Midtrans payment initiation**
- **Test QRIS payment flow**
- **Test payment webhook handling**
- **Test payment status update**
- **Test payment timeout handling**
- **Test auto quota restore jika payment failed**
- Test mobile-friendly UI

**Estimated Time**: 7-8 days (ditambah 2 hari untuk payment integration)

---

### Sprint 4: E-Ticket Generation & QR Code (Week 5)

**Goal**: Implement E-Ticket generation dengan QR code unik per buyer

**Status**: ⏳ **PENDING**

**Note**: Fitur ini masuk ke dalam admin area. E-Ticket dapat di-generate setelah order payment success, dan dapat dilihat/di-download dari admin order detail page dan admin ticket management page.

**Backend Tasks**:

- [ ] Create ticket model dan migration (link ke order)
- [ ] Create ticket repository interface dan implementation
- [ ] Create ticket service
- [ ] Implement ticket generation API (`POST /api/v1/orders/:id/generate-tickets`)
- [ ] Implement QR code generation (gunakan library Go)
- [ ] Implement unique ticket ID generation (UUID + hash)
- [ ] Implement ticket detail API (`GET /api/v1/tickets/:id`)
- [ ] Implement ticket list API (`GET /api/v1/orders/:id/tickets`)
- [ ] Add ticket status (active, used, cancelled)
- [ ] Add ticket validation logic
- [ ] Add ticket seeder untuk testing

**Frontend Tasks**:

- [ ] Create E-Ticket types (`src/features/tickets/types/index.d.ts`) - extend existing types dengan E-Ticket fields (ticket_id, qr_code, status, order_id, buyer_info)
- [ ] Extend ticket service (`src/features/tickets/services/ticketService.ts`) - add methods: `generateTickets(orderId)`, `getTicketById(id)`, `getTicketsByOrderId(orderId)`, `downloadTicket(id, format)`
- [ ] Create E-Ticket display component (`src/features/tickets/components/ETicketDisplay.tsx`) - display E-Ticket dengan design template (nama event, seat info, tier, buyer info)
- [ ] Create QR code display component (`src/features/tickets/components/QRCodeDisplay.tsx`) - display QR code dari ticket data (gunakan library seperti `qrcode.react` atau `react-qr-code`)
- [ ] Create admin ticket detail page (`app/[locale]/(admin)/tickets-management/[id]/page.tsx`) - display ticket detail dengan QR code dan download option
- [ ] Create admin ticket list page (`app/[locale]/(admin)/tickets-management/page.tsx`) - extend existing dengan filter by order, status, dan search
- [ ] Add ticket download functionality (PDF/image) - implement download button di ticket detail page (gunakan library seperti `jspdf` atau `html2canvas` untuk PDF generation)
- [ ] Add ticket design template component (`src/features/tickets/components/TicketTemplate.tsx`) - reusable template untuk E-Ticket design (nama event, seat info, tier, buyer info, QR code)
- [ ] Create ticket preview component (`src/features/tickets/components/TicketPreview.tsx`) - preview E-Ticket sebelum download
- [ ] Add ticket generation trigger di admin order detail page (`app/[locale]/(admin)/orders/[id]/page.tsx`) - button untuk generate tickets setelah payment success
- [ ] Add ticket list display di admin order detail page - show list of tickets untuk order tersebut

**Postman Collection**:

- [ ] Add ticket APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Ticket generation APIs bekerja dengan baik
- ✅ QR code generation bekerja dan unique per ticket
- ✅ E-Ticket display bekerja dengan baik
- ✅ Ticket design template bekerja (nama event, tier info)
- ✅ Ticket download bekerja (PDF/image)
- ✅ Frontend menampilkan E-Ticket dengan QR code
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test ticket generation (backend + frontend)
- Test QR code generation dan uniqueness
- Test E-Ticket display
- Test ticket download
- **Test QR code scan untuk check-in (menggunakan mobile app atau scanner)**
- **Test check-in validation dengan QR code dari E-ticket**
- **Test check-in flow end-to-end (dari purchase → payment → E-ticket → scan QR → check-in)**
- **Test QR code scan untuk check-in (menggunakan mobile app atau scanner)**
- **Test check-in validation dengan QR code dari E-ticket**
- **Test check-in flow end-to-end (dari purchase → payment → E-ticket → scan QR → check-in)**

**Estimated Time**: 4-5 days

---

### Sprint 5: Order History (Week 6)

**Goal**: Implement order history untuk user melihat history pembelian mereka

**Note**: Email service dihapus - E-ticket langsung ditampilkan di halaman setelah pembayaran sukses.

**Backend Tasks**:

- [ ] Implement order history API (`GET /api/v1/orders/history`) - untuk guest (my orders)
- [ ] Implement order history API (`GET /api/v1/admin/orders`) - untuk admin (sudah ada, mungkin perlu enhancement)
- [ ] Add order search dan filter (by date, status, event, schedule)
- [ ] Add pagination untuk order history
- [ ] Add order detail API dengan tickets (`GET /api/v1/orders/:id`) - include tickets list

**Frontend Tasks**:

- [ ] Create order history page (`/orders/history`) - untuk guest
- [ ] Create order history component (`OrderHistory`)
- [ ] Create my orders page (`/orders`) - untuk guest
- [ ] Create order detail page (`/orders/[id]`) - untuk guest (include tickets list)
- [ ] Add order search dan filter UI
- [ ] Add order status display
- [ ] Add order date range filter
- [ ] Display E-ticket di order detail (dengan QR code)

**Postman Collection**:

- [ ] Add order history APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Order history APIs bekerja dengan baik
- ✅ Frontend menampilkan order history untuk guest
- ✅ Frontend menampilkan order detail dengan tickets
- ✅ Search dan filter bekerja optimal
- ✅ E-ticket dapat dilihat langsung di order detail (tanpa email)
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test order history (backend + frontend)
- Test order detail dengan tickets (backend + frontend)
- Test search dan filter
- Test E-ticket display di order detail

**Estimated Time**: 3-4 days

---

### Sprint 6: Analytics Dashboard (Week 7)

**Goal**: Implement analytics dashboard untuk monitoring penjualan

**Backend Tasks**:

- [ ] Create analytics service
- [ ] Implement sales overview API (`GET /api/v1/analytics/sales-overview`)
- [ ] Implement ticket tier sales API (`GET /api/v1/analytics/tier-sales`)
- [ ] Implement peak hours API (`GET /api/v1/analytics/peak-hours`)
- [ ] Implement revenue API (`GET /api/v1/analytics/revenue`)
- [ ] Implement sales trend API (`GET /api/v1/analytics/sales-trend`)
- [ ] Add date range filtering
- [ ] Add aggregation queries untuk analytics

**Frontend Tasks**:

- [ ] Create analytics types (`types/analytics.d.ts`)
- [ ] Create analytics service (`analyticsService`)
- [ ] Create analytics dashboard page (`/analytics`)
- [ ] Create sales overview component (`SalesOverview`)
- [ ] Create ticket tier sales chart component (`TierSalesChart`)
- [ ] Create peak hours chart component (`PeakHoursChart`)
- [ ] Create revenue chart component (`RevenueChart`)
- [ ] Create sales trend chart component (`SalesTrendChart`)
- [ ] Add date range picker
- [ ] Add charts menggunakan recharts atau similar
- [ ] Create analytics export functionality (CSV/Excel)

**Postman Collection**:

- [ ] Add analytics APIs ke Postman collection

**Menu & Permissions**:

- [ ] Add Analytics menu to menu seeder
- [ ] Add Analytics permissions to permission seeder

**Acceptance Criteria**:

- ✅ Analytics APIs bekerja dengan baik
- ✅ Dashboard menampilkan key metrics
- ✅ Charts dan graphs ditampilkan dengan benar
- ✅ Date range filtering bekerja
- ✅ Analytics export bekerja (CSV/Excel)
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test analytics data loading (backend + frontend)
- Test date range filtering
- Test chart rendering
- Test analytics export

**Estimated Time**: 4-5 days

---

### Sprint 6.5: Mobile APIs untuk Staff Gate (Week 7-8)

**Goal**: Implement mobile APIs untuk mobile app (Dev3)

**Status**: ⏳ **PENDING**

**Note**: API ini diperlukan untuk mobile app yang dikembangkan oleh Dev3.

**Backend Tasks**:

- [ ] Create mobile check-in model dan migration (jika belum ada dari Dev2)
- [ ] Create mobile check-in repository interface dan implementation
- [ ] Create mobile check-in service
- [ ] Implement mobile gate info API (`GET /api/v1/mobile/gate-info`) - Get gate info untuk current user (staff gate)
- [ ] Implement mobile check-in validate API (`POST /api/v1/mobile/check-in/validate`) - Validate QR code sebelum check-in
- [ ] Implement mobile check-in API (`POST /api/v1/mobile/check-in`) - Process check-in dari mobile app
- [ ] Implement mobile check-in statistics API (`GET /api/v1/mobile/check-in/statistics`) - Get today's check-in statistics
- [ ] Implement mobile check-in history API (`GET /api/v1/mobile/check-in/history`) - Get check-in history dengan filters (date, status, gate, tier)
- [ ] Implement mobile check-in detail API (`GET /api/v1/mobile/check-in/:id`) - Get check-in detail
- [ ] Add mobile-specific response format (optimized untuk mobile)
- [ ] Add mobile error handling (mobile-friendly error messages)
- [ ] Add rate limiting untuk mobile endpoints
- [ ] Add validation untuk mobile requests

**Postman Collection**:

- [ ] Add mobile APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Mobile gate info API bekerja dengan baik
- ✅ Mobile check-in validate API bekerja dengan baik
- ✅ Mobile check-in API bekerja dengan baik
- ✅ Mobile check-in statistics API bekerja dengan baik
- ✅ Mobile check-in history API bekerja dengan baik (filters, pagination)
- ✅ Mobile check-in detail API bekerja dengan baik
- ✅ Mobile response format optimized untuk mobile app
- ✅ Mobile error handling comprehensive
- ✅ Rate limiting bekerja
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test mobile gate info API
- Test mobile check-in validate API
- Test mobile check-in API
- Test mobile check-in statistics API
- Test mobile check-in history API (dengan filters)
- Test mobile check-in detail API
- **Test scan QR code dari E-ticket untuk check-in (end-to-end testing)**
- **Test check-in validation dengan berbagai skenario:**
  - Valid QR code (PAID status)
  - Already used QR code (CHECKED-IN status)
  - Invalid QR code
  - Expired ticket
  - Wrong gate assignment
  - VIP priority entry
- Test rate limiting
- Test error handling

**Estimated Time**: 3-4 days

---

### Sprint 7: Integration & Testing (Week 8-9)

**Goal**: Integration dengan modul Dev2, Dev3 dan final testing

**Tasks**:

- [ ] Coordinate dengan Developer 2 untuk integration
- [ ] Coordinate dengan Developer 3 untuk mobile app integration
- [ ] Test integration antara modul Dev1 dan Dev2
- [ ] Test integration antara modul Dev1 dan Dev3 (mobile app)
- [ ] Fix integration issues
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Final bug fixes
- [ ] Documentation update

**Integration Points**:

- [ ] E-Ticket data untuk Check-in Scanner (Dev2) - Pending (E-Ticket belum diimplementasikan)
- [x] Order data untuk Admin Dashboard (Dev2) - ✅ Ready (Admin Order APIs sudah ada)
- [ ] Check-in data untuk Analytics (Dev1) - Pending (Check-in belum diimplementasikan)
- [x] Event data untuk Admin Dashboard (Dev2) - ✅ Ready (Event APIs sudah ada)
- [ ] Mobile Check-in APIs (Dev1) → Mobile App (Dev3) - Pending (Mobile APIs belum diimplementasikan)

**Acceptance Criteria**:

- ✅ Semua modules terintegrasi dengan baik
- ✅ Tidak ada critical bugs
- ✅ Performance acceptable
- ✅ Security audit passed

**Testing**:

- End-to-end testing
- **End-to-end ticket purchase flow testing:**
  - Event selection → Schedule selection → Ticket selection → Order creation
  - Payment flow (Midtrans QRIS) → Payment success → E-ticket generation
  - E-ticket display → QR code generation
  - **Scan QR code untuk check-in (menggunakan mobile app Dev3)**
  - **Check-in validation → Check-in success**
  - **Check-in history**
- Mobile app integration testing
- Performance testing
- Security testing

**Estimated Time**: 3-4 days

---

## 📊 Sprint Summary

| Sprint     | Goal                                  | Duration | Status                                 | Notes                                                                          |
| ---------- | ------------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| Sprint 0   | Foundation & Event Setup              | 3-4 days | ✅ Completed                           | -                                                                              |
| Sprint 0.5 | User Management & Access Control      | 3-4 days | ✅ Backend (100%) / ✅ Frontend (100%) | Frontend: Auth & Guards ✅, User/Role/Permission pages ✅                      |
| Sprint 1   | Event Management                      | 4-5 days | ✅ Backend (100%) / ✅ Frontend (100%) | Frontend: types ✅, service ✅, components ✅, admin pages ✅, public pages ✅ |
| Sprint 2   | Ticket Category & Schedule Management | 4-5 days | ✅ Backend (100%) / ✅ Frontend (100%) | Frontend: types ✅, services ✅, forms ✅, event detail integration ✅         |
| Sprint 3   | Ticket Purchase Flow dengan Payment   | 7-8 days | ✅ Backend (50% - Admin) / ⏳ Frontend | Backend: Admin APIs only, Guest APIs & Payment pending                         |
| Sprint 4   | E-Ticket Generation & QR Code         | 4-5 days | ⏳ Pending                             | Belum dikerjakan. Fitur masuk ke admin area.                                   |
| Sprint 5   | Order History                         | 3-4 days | ⏳ Pending                             | Belum dikerjakan (Email service dihapus)                                       |
| Sprint 6   | Analytics Dashboard                   | 4-5 days | ⏳ Pending                             | Belum dikerjakan                                                               |
| Sprint 6.5 | Mobile APIs untuk Staff Gate          | 3-4 days | ⏳ Pending                             | Backend APIs untuk mobile app (Dev3)                                           |
| Sprint 7   | Integration & Testing                 | 3-4 days | ⏳ Pending                             | Belum dikerjakan                                                               |

**Total Estimated Time**: 42-52 days (6-7.4 weeks)

---

## 🔗 Coordination dengan Dev2

### Modul yang dikerjakan Dev2 (untuk referensi):

- User Management & Access Control (Fullstack)
- Check-in Scanner System (Fullstack - Mobile-Web)
- Real-time Check-in Status (Fullstack)
- Gate Assignment & Management (Fullstack)
- Admin Dashboard Monitoring (Fullstack)
- Buyer List Export (CSV/Excel) (Backend)

### Integration Points:

- E-Ticket data (Dev1) → Check-in Scanner (Dev2)
- Order data (Dev1) → Admin Dashboard (Dev2)
- Check-in data (Dev2) → Analytics (Dev1)
- Event data (Dev1) → Admin Dashboard (Dev2)

### Coordination:

- [ ] Week 1: Coordinate database schema untuk Event, Ticket Category, Schedule, Ticket, Order
- [ ] Week 2: Coordinate API contract untuk integration points
- [ ] Week 4: Mid-sprint review - check integration points
- [ ] Week 6: Pre-integration review
- [ ] Week 7-8: Final integration testing

---

## 📝 Notes

1. **Fullstack Development**: Setiap modul dikerjakan fullstack sampai selesai
2. **No Dependencies**: Tidak bergantung ke Dev2, bisa dikerjakan paralel (kecuali auth di sprint awal)
3. **Hackathon Mode**: Tidak ada unit test intensif, manual testing saja
4. **Code Review**: Lakukan code review sebelum merge
5. **Documentation**: Update documentation setelah setiap sprint
6. **Postman Collection**: Update Postman collection untuk setiap modul
7. **Payment Integration**: Midtrans integration akan dilakukan di sprint berikutnya (tidak termasuk di sprint awal)
8. **Mobile-Friendly**: Pastikan semua purchase flow mobile-friendly untuk pembeli
9. **Event Management**: Event Management adalah modul pertama yang dikerjakan setelah foundation
10. **Multiple Events**: Sistem mendukung multiple events, bukan hanya satu event
11. **Permissions Best Practice**:
    - Login response: `user.permissions` (string array) untuk quick authorization checks
    - Menus-Permissions endpoint: Full objects untuk UI rendering dan management
    - Frontend: Cache menus-permissions dengan TanStack Query, gunakan login permissions untuk route guards

---

**Dokumen ini akan diupdate sesuai dengan progress development.**
