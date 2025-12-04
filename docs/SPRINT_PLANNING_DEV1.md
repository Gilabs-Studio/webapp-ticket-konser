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

1. ✅ Event & Ticket Tier Management (Fullstack)
2. ✅ Ticket Purchase Flow (Frontend + Backend Integration)
3. ✅ E-Ticket Generation & QR Code (Fullstack)
4. ✅ Email Service Integration (Backend)
5. ✅ Order History & Resend Ticket (Fullstack)
6. ✅ Analytics Dashboard (Fullstack)

**Parallel Development Strategy**:

- ✅ **TIDAK bergantung ke Dev2** - bisa dikerjakan paralel (kecuali auth di sprint awal)
- ✅ Setiap modul dikerjakan fullstack sampai selesai
- ✅ **Hackathon mode** - tidak ada unit test intensif
- ✅ Manual testing saja

---

## 🎯 Sprint Details

### Sprint 0: Foundation & Event Setup (Week 1)

**Goal**: Setup foundation dan event management dasar

**Backend Tasks**:

- [ ] Review authentication flow (login, token refresh)
- [ ] Create event model dan migration
- [ ] Create ticket tier model dan migration
- [ ] Create event repository interface dan implementation
- [ ] Create ticket tier repository interface dan implementation
- [ ] Create event service
- [ ] Create ticket tier service
- [ ] Implement event CRUD APIs (`GET /api/v1/events`, `POST /api/v1/events`, `PUT /api/v1/events/:id`, `DELETE /api/v1/events/:id`)
- [ ] Implement ticket tier CRUD APIs (`GET /api/v1/ticket-tiers`, `POST /api/v1/ticket-tiers`, `PUT /api/v1/ticket-tiers/:id`, `DELETE /api/v1/ticket-tiers/:id`)
- [ ] Implement event detail API dengan ticket tiers
- [ ] Add validation
- [ ] Add event seeder (1 event untuk konser internasional)

**Frontend Tasks**:

- [ ] Create event types (`types/event.d.ts`)
- [ ] Create ticket tier types (`types/ticket-tier.d.ts`)
- [ ] Create event service (`eventService`)
- [ ] Create ticket tier service (`ticketTierService`)
- [ ] Create event list page (`/events`)
- [ ] Create event form component (`EventForm`)
- [ ] Create event detail page (`/events/[id]`)
- [ ] Create ticket tier list component
- [ ] Create ticket tier form component (`TicketTierForm`)
- [ ] Add event search and filter

**Postman Collection**:

- [ ] Add event APIs ke Postman collection
- [ ] Add ticket tier APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Event CRUD APIs bekerja dengan baik
- ✅ Ticket tier CRUD APIs bekerja dengan baik
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Admin dapat manage event dan ticket tiers
- ✅ Form validation comprehensive
- ✅ UI/UX modern dan intuitive
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test event CRUD (backend + frontend)
- Test ticket tier CRUD (backend + frontend)
- Test event-ticket tier relationship

**Estimated Time**: 3-4 days

---

### Sprint 1: Ticket Tier Management (Week 2)

**Goal**: Implement ticket tier management dengan quota tracking

**Backend Tasks**:

- [ ] Create ticket quota model dan migration
- [ ] Create ticket quota repository interface dan implementation
- [ ] Create ticket quota service
- [ ] Implement quota management APIs (`GET /api/v1/ticket-tiers/:id/quota`, `PUT /api/v1/ticket-tiers/:id/quota`)
- [ ] Implement real-time quota checking API (`GET /api/v1/ticket-tiers/:id/quota/check`)
- [ ] Add quota decrement logic (untuk purchase flow nanti)
- [ ] Add quota validation
- [ ] Add quota seeder untuk setiap ticket tier

**Frontend Tasks**:

- [ ] Create ticket quota types (`types/ticket-quota.d.ts`)
- [ ] Create ticket quota service (`ticketQuotaService`)
- [ ] Create quota management component (`QuotaManagement`)
- [ ] Add quota display di ticket tier list
- [ ] Add quota edit functionality
- [ ] Add real-time quota indicator (polling atau websocket sederhana)
- [ ] Create quota dashboard widget

**Postman Collection**:

- [ ] Add quota APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Quota management APIs bekerja dengan baik
- ✅ Real-time quota checking bekerja
- ✅ Frontend menampilkan quota dengan update real-time
- ✅ Admin dapat manage quota per ticket tier
- ✅ Quota validation bekerja
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test quota management (backend + frontend)
- Test real-time quota update
- Test quota validation

**Estimated Time**: 4-5 days

---

### Sprint 2: Ticket Purchase Flow (Basic) (Week 3)

**Goal**: Implement basic ticket purchase flow (tanpa payment integration)

**Backend Tasks**:

- [ ] Create order model dan migration
- [ ] Create order item model dan migration
- [ ] Create order repository interface dan implementation
- [ ] Create order service
- [ ] Implement create order API (`POST /api/v1/orders`)
- [ ] Implement order detail API (`GET /api/v1/orders/:id`)
- [ ] Implement order list API (`GET /api/v1/orders`)
- [ ] Add quota decrement saat order dibuat
- [ ] Add order status management (pending, confirmed, cancelled)
- [ ] Add validation (quota check, tier availability)
- [ ] Add order seeder untuk testing

**Frontend Tasks**:

- [ ] Create order types (`types/order.d.ts`)
- [ ] Create order service (`orderService`)
- [ ] Create ticket purchase page (`/purchase`)
- [ ] Create ticket selection component (`TicketSelection`)
- [ ] Create order summary component (`OrderSummary`)
- [ ] Create order form component (`OrderForm`)
- [ ] Add buyer information form
- [ ] Add order confirmation page
- [ ] Add order status display
- [ ] Create order list page (`/orders`)
- [ ] Create order detail page (`/orders/[id]`)

**Postman Collection**:

- [ ] Add order APIs ke Postman collection

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

### Sprint 3: E-Ticket Generation & QR Code (Week 4)

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

### Sprint 4: Email Service & Order History (Week 5)

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

### Sprint 5: Analytics Dashboard (Week 6)

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

### Sprint 6: Integration & Testing (Week 7-8)

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

- [ ] E-Ticket data untuk Check-in Scanner (Dev2)
- [ ] Order data untuk Admin Dashboard (Dev2)
- [ ] Check-in data untuk Analytics (Dev1)

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

| Sprint   | Goal                              | Duration | Status     |
| -------- | --------------------------------- | -------- | ---------- |
| Sprint 0 | Foundation & Event Setup           | 3-4 days | ⏳ Pending |
| Sprint 1 | Ticket Tier Management            | 4-5 days | ⏳ Pending |
| Sprint 2 | Ticket Purchase Flow (Basic)      | 5-6 days | ⏳ Pending |
| Sprint 3 | E-Ticket Generation & QR Code      | 4-5 days | ⏳ Pending |
| Sprint 4 | Email Service & Order History     | 4-5 days | ⏳ Pending |
| Sprint 5 | Analytics Dashboard               | 4-5 days | ⏳ Pending |
| Sprint 6 | Integration & Testing             | 3-4 days | ⏳ Pending |

**Total Estimated Time**: 27-34 days (3.9-4.9 weeks)

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

### Coordination:

- [ ] Week 1: Coordinate database schema untuk Event, Ticket, Order
- [ ] Week 2: Coordinate API contract untuk integration points
- [ ] Week 4: Mid-sprint review - check integration points
- [ ] Week 6: Pre-integration review
- [ ] Week 7: Final integration testing

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

---

**Dokumen ini akan diupdate sesuai dengan progress development.**

