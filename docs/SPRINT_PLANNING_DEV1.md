# Sprint Planning - Developer 1 (Fullstack Developer)

## Ticketing Konser Internasional Platform

**Developer**: Fullstack Developer (Go Backend + Next.js Frontend)  
**Role**: Develop modul-modul ticketing secara fullstack (backend + frontend)  
**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-XX

---

## 📋 Overview

Developer 1 bertanggung jawab untuk:

- **Fullstack Development**: Develop modul-modul yang ditugaskan secara lengkap (backend API + frontend)
- **Backend**: Go (Gin) APIs untuk modul yang ditugaskan
- **Frontend**: Next.js 16 frontend untuk modul yang ditugaskan
- **Database**: Design dan implement database schema untuk modul yang ditugaskan
- **Postman Collection**: Update Postman collection untuk modul yang ditugaskan

**Modul yang ditugaskan ke Dev1**:

1. ✅ Event Management (Fullstack)
2. ✅ Ticket Category Management (Fullstack)
3. ✅ Schedule Management (Fullstack)
4. ✅ Ticket Purchase Flow (Frontend + Backend Integration)
5. ✅ E-Ticket Generation & QR Code (Fullstack)
6. ✅ Email Service Integration (Backend)
7. ✅ Order History & Resend Ticket (Fullstack)
8. ✅ Analytics Dashboard (Fullstack)

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

### Sprint 1: Event Management (Week 2)

**Goal**: Implement event management dengan CRUD lengkap

**Status**: ✅ **BACKEND COMPLETED** | ⏳ **FRONTEND IN PROGRESS**

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

- [x] Create event types (`types/event.d.ts`) - partial (ada di ticket/types, perlu tambah status field)
- [ ] Create event service (`eventService`)
- [ ] Create event list page (`/admin/events`)
- [ ] Create event form component (`EventForm`)
- [ ] Create event detail page (`/admin/events/[id]`)
- [ ] Create public event list page (`/events`)
- [ ] Create public event detail page (`/events/[id]`)
- [ ] Add event search and filter
- [ ] Add event status management UI (draft, published, closed)
- [ ] Add banner image upload component (form-data, max 5MB, JPEG/PNG/WebP)
- [ ] Add event status badge component

**Postman Collection**:

- [x] Add event APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Event CRUD APIs bekerja dengan baik
- ✅ Event status management bekerja (draft, published, closed)
- ✅ Banner image upload bekerja (form-data, max 5MB, JPEG/PNG/WebP)
- ✅ Public APIs hanya menampilkan published events
- ⏳ Frontend terintegrasi dengan backend APIs (pending)
- ⏳ Admin dapat manage events (pending frontend)
- ⏳ Guest dapat melihat event list dan detail (pending frontend)
- ⏳ Form validation comprehensive (pending frontend)
- ⏳ UI/UX modern dan intuitive (pending frontend)
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

**Status**: ✅ **BACKEND COMPLETED** | ⏳ **FRONTEND IN PROGRESS**

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
- [ ] Implement public ticket categories API (`GET /api/v1/events/:event_id/ticket-categories`) - untuk guest
- [ ] Implement public schedules API (`GET /api/v1/events/:event_id/schedules`) - untuk guest (include rundown)
- [x] Add quota management untuk ticket category
- [x] Add remaining seat tracking untuk schedule
- [x] Add validation (price, quota, capacity, date range, artist_name, rundown)
- [x] Add ticket category seeder
- [x] Add schedule seeder dengan rundown contoh

**Frontend Tasks**:

- [x] Create ticket category types (`types/ticket-category.d.ts`)
- [x] Create schedule types (`types/schedule.d.ts`) - include artist_name dan rundown
- [x] Create ticket category service (`ticketCategoryService`)
- [x] Create schedule service (`scheduleService`)
- [x] Create ticket category list page (`/admin/ticket-categories`) - components only
- [ ] Create ticket category form component (`TicketCategoryForm`)
- [x] Create schedule list page (`/admin/schedules`) - components only
- [ ] Create schedule form component (`ScheduleForm`) - include artist_name dan rundown fields
- [ ] Create rundown editor component (`RundownEditor`) - textarea dengan format support (newline untuk line breaks)
- [ ] Create rundown display component (`RundownDisplay`) - untuk menampilkan rundown dengan formatting
- [ ] Add ticket category management di event detail
- [ ] Add schedule management di event detail
- [ ] Add quota display dan management
- [ ] Add remaining seat display
- [ ] Add date picker untuk schedule
- [ ] Add time picker untuk schedule
- [ ] Add artist name input field
- [ ] Add rundown preview di schedule detail
- [ ] Display rundown di public schedule detail untuk guest

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
- ✅ Admin dapat manage ticket categories dan schedules dengan rundown
- ✅ Guest dapat melihat ticket categories dan schedules per event (include rundown)
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

### Sprint 3: Ticket Purchase Flow (Basic) (Week 4)

**Goal**: Implement basic ticket purchase flow (tanpa payment integration)

**Status**: ✅ **BACKEND COMPLETED (Admin APIs)** | ⏳ **FRONTEND IN PROGRESS** | ⏳ **GUEST APIs PENDING**

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
- [x] Add order seeder untuk testing

**Frontend Tasks**:

- [ ] Create order types (`types/order.d.ts`)
- [ ] Create order service (`orderService`)
- [ ] Create ticket purchase page (`/events/[event_id]/purchase`)
- [ ] Create event selection flow (pilih event → pilih schedule → pilih ticket category)
- [ ] Create ticket selection component (`TicketSelection`)
- [ ] Create order summary component (`OrderSummary`)
- [ ] Create order form component (`OrderForm`)
- [ ] Add buyer information form
- [ ] Add order confirmation page
- [ ] Add order status display
- [ ] Create my orders page (`/orders`) - untuk guest
- [ ] Create order detail page (`/orders/[id]`) - untuk guest
- [ ] Create admin order list page (`/admin/orders`)
- [ ] Create admin order detail page (`/admin/orders/[id]`)

**Postman Collection**:

- [x] Add order APIs ke Postman collection (Admin APIs sudah ada)

**Acceptance Criteria**:

- ✅ Order creation APIs bekerja dengan baik
- ✅ Quota decrement otomatis saat order dibuat
- ✅ Frontend purchase flow bekerja dengan baik
- ✅ User dapat select ticket tier dan quantity
- ✅ Order validation bekerja (quota, availability)
- ✅ Order status management bekerja
- ✅ UI/UX mobile-friendly untuk pembeli
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test order creation (backend + frontend)
- Test quota decrement
- Test order validation
- Test mobile-friendly UI

**Estimated Time**: 5-6 days

---

### Sprint 4: E-Ticket Generation & QR Code (Week 5)

**Goal**: Implement E-Ticket generation dengan QR code unik per buyer

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

- [ ] Create ticket types (`types/ticket.d.ts`)
- [ ] Create ticket service (`ticketService`)
- [ ] Create E-Ticket display component (`ETicketDisplay`)
- [ ] Create QR code display component (`QRCodeDisplay`)
- [ ] Create ticket detail page (`/tickets/[id]`)
- [ ] Create ticket list page (`/orders/[id]/tickets`)
- [ ] Add ticket download functionality (PDF/image)
- [ ] Add ticket design template (nama event, seat info, tier)
- [ ] Create ticket preview component

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

**Estimated Time**: 4-5 days

---

### Sprint 5: Email Service & Order History (Week 6)

**Goal**: Implement email service untuk confirmation dan E-ticket delivery, plus order history

**Backend Tasks**:

- [ ] Setup email service (SMTP atau service sederhana)
- [ ] Create email template service
- [ ] Implement email confirmation API (`POST /api/v1/orders/:id/send-confirmation`)
- [ ] Implement E-ticket email delivery API (`POST /api/v1/orders/:id/send-tickets`)
- [ ] Implement resend ticket API (`POST /api/v1/tickets/:id/resend`)
- [ ] Add email template untuk order confirmation
- [ ] Add email template untuk E-ticket delivery
- [ ] Add email queue system (basic, bisa sync untuk MVP)
- [ ] Implement order history API (`GET /api/v1/orders/history`)
- [ ] Add order search dan filter
- [ ] Add pagination untuk order history

**Frontend Tasks**:

- [ ] Create email service types (`types/email.d.ts`)
- [ ] Create email service (`emailService`)
- [ ] Create order history page (`/orders/history`)
- [ ] Create order history component (`OrderHistory`)
- [ ] Add order search dan filter UI
- [ ] Add resend ticket button di order detail
- [ ] Add email status indicator
- [ ] Create email template preview component

**Postman Collection**:

- [ ] Add email APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Email service bekerja dengan baik
- ✅ Order confirmation email terkirim
- ✅ E-ticket email delivery bekerja
- ✅ Resend ticket functionality bekerja
- ✅ Order history APIs bekerja dengan baik
- ✅ Frontend menampilkan order history
- ✅ Search dan filter bekerja optimal
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test email confirmation (backend)
- Test E-ticket email delivery (backend)
- Test resend ticket (backend + frontend)
- Test order history (backend + frontend)
- Test email templates

**Estimated Time**: 4-5 days

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

### Sprint 7: Integration & Testing (Week 8-9)

**Goal**: Integration dengan modul Dev2 dan final testing

**Tasks**:

- [ ] Coordinate dengan Developer 2 untuk integration
- [ ] Test integration antara modul Dev1 dan Dev2
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

**Acceptance Criteria**:

- ✅ Semua modules terintegrasi dengan baik
- ✅ Tidak ada critical bugs
- ✅ Performance acceptable
- ✅ Security audit passed

**Testing**:

- End-to-end testing
- Performance testing
- Security testing

**Estimated Time**: 3-4 days

---

## 📊 Sprint Summary

| Sprint   | Goal                                  | Duration | Status                                 |
| -------- | ------------------------------------- | -------- | -------------------------------------- |
| Sprint 0 | Foundation & Event Setup              | 3-4 days | ✅ Completed                           |
| Sprint 1 | Event Management                      | 4-5 days | ✅ Backend (100%) / ⏳ Frontend (10%)  |
| Sprint 2 | Ticket Category & Schedule Management | 4-5 days | ✅ Backend (100%) / ⏳ Frontend (30%)  |
| Sprint 3 | Ticket Purchase Flow (Basic)          | 5-6 days | ✅ Backend (50% - Admin APIs) / ⏳ ... |
| Sprint 4 | E-Ticket Generation & QR Code         | 4-5 days | ⏳ Pending                             |
| Sprint 5 | Email Service & Order History         | 4-5 days | ⏳ Pending                             |
| Sprint 6 | Analytics Dashboard                   | 4-5 days | ⏳ Pending                             |
| Sprint 7 | Integration & Testing                 | 3-4 days | ⏳ Pending                             |

**Total Estimated Time**: 32-39 days (4.6-5.6 weeks)

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

---

**Dokumen ini akan diupdate sesuai dengan progress development.**
