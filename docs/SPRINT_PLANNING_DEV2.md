# Sprint Planning - Developer 2 (Fullstack Developer)

## Ticketing Konser Internasional Platform

**Developer**: Fullstack Developer (Go Backend + Next.js Frontend)  
**Role**: Develop modul-modul ticketing secara fullstack (backend + frontend)  
**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-XX

---

## 📋 Overview

Developer 2 bertanggung jawab untuk:

- **Fullstack Development**: Develop modul-modul yang ditugaskan secara lengkap (backend API + frontend)
- **Backend**: Go (Gin) APIs untuk modul yang ditugaskan
- **Frontend**: Next.js 16 frontend untuk modul yang ditugaskan
- **Database**: Design dan implement database schema untuk modul yang ditugaskan
- **Postman Collection**: Update Postman collection untuk modul yang ditugaskan

**Modul yang ditugaskan ke Dev2**:

1. ⏳ Check-in Scanner System (Fullstack - Mobile-Web)
2. ⏳ Real-time Check-in Status (Fullstack)
3. ⏳ Gate Assignment & Management (Fullstack)
4. ⏳ Admin Dashboard Monitoring (Fullstack)
5. ⏳ Buyer List Export (CSV/Excel) (Backend)

**Modul Frontend yang sudah dibuat (belum ada di sprint planning)**:

1. ✅ **Ticket Management** (Frontend - Components & Types) - `/tickets`
   - Components: TicketCard, TicketList, TicketManagement, RecentOrdersTable
   - Types: Ticket types definitions
   - Status: Frontend UI completed, Backend integration pending

2. ✅ **Merchandise Management** (Frontend - Components & Types) - `/merchandise`
   - Components: MerchandiseInventory, MerchandiseProductCard
   - Types: Merchandise types definitions
   - Status: Frontend UI completed, Backend APIs pending
   - Note: Untuk event limited merchandise (merchandise khusus event)

3. ✅ **Settings Management** (Frontend - Components, Hooks, Schemas & Types) - `/settings`
   - Components: SettingsPage, SettingsSidebar, EventSettingsForm, DangerZone
   - Hooks: useEventSettings
   - Schemas: event-settings.schema.ts (Zod validation)
   - Types: Settings types definitions
   - Status: Frontend completed, Backend APIs pending

4. ✅ **Attendance Management** (Frontend - Components, Hooks, Services & Types) - `/attendance`
   - Components: AttendeeList
   - Hooks: useAttendees
   - Services: attendanceService
   - Types: Attendance types definitions
   - Status: Frontend completed, Backend APIs pending
   - Note: Terkait dengan check-in dan attendee tracking

5. ✅ **Attendees Management** (Frontend - Page) - `/attendees`
   - Status: Page structure completed, Backend integration pending
   - Note: Management page untuk attendees/participants

**Note**: Modul User Management, Role Management, Permission Management, Menu Management, dan Authentication telah dipindahkan ke Dev1 karena sudah dikerjakan sebelumnya.

**Parallel Development Strategy**:

- ✅ **TIDAK bergantung ke Dev1** - bisa dikerjakan paralel (kecuali ticket data di sprint 3+)
- ✅ Setiap modul dikerjakan fullstack sampai selesai
- ✅ **Hackathon mode** - tidak ada unit test intensif
- ✅ Manual testing saja

---

## 🎯 Sprint Details

> **Note**: Sprint 0 dan Sprint 1 (User Management & Access Control) telah dipindahkan ke Dev1 karena sudah dikerjakan sebelumnya. Sprint dimulai dari Check-in Scanner.

### Sprint 0: Foundation & Setup (Week 1)

**Goal**: Setup foundation dan review modul yang akan dikerjakan

**Status**: ✅ **COMPLETED**

**Tasks**:

- [x] Review project structure
- [x] Review authentication flow (sudah ada dari Dev1)
- [x] Review database schema
- [x] Setup basic routing
- [x] Review API standards

**Estimated Time**: 1-2 days

---

### Sprint 1: Check-in Scanner (Mobile-Web) (Week 2-3)

**Goal**: Implement check-in scanner system untuk mobile-web

**Backend Tasks**:

- [ ] Create check-in model dan migration
- [ ] Create check-in repository interface dan implementation
- [ ] Create check-in service
- [ ] Implement QR code validation API (`POST /api/v1/check-in/validate`)
- [ ] Implement check-in API (`POST /api/v1/check-in`)
- [ ] Implement one-scan validation (QR hanya bisa dipakai 1 kali)
- [ ] Implement duplicate detection (anti-fraud)
- [ ] Implement check-in history API (`GET /api/v1/check-ins`)
- [ ] Add gate assignment logic
- [ ] Add check-in timestamp dan location tracking
- [ ] Add validation (ticket status, already used, invalid QR)
- [ ] Add rate limiting untuk check-in endpoint

**Frontend Tasks**:

- [ ] Create check-in types (`types/check-in.d.ts`)
- [ ] Create check-in service (`checkInService`)
- [ ] Create scanner page (`/scanner`)
- [ ] Create QR code scanner component (`QRCodeScanner`) - menggunakan web camera API
- [ ] Create scanner mode UI (mobile-friendly, fullscreen)
- [ ] Create check-in result component (`CheckInResult`)
- [ ] Create check-in history page (`/check-ins`)
- [ ] Create check-in history component (`CheckInHistory`)
- [ ] Add camera permission handling
- [ ] Add scanner feedback (sound, vibration jika bisa)
- [ ] Add error handling untuk invalid QR
- [ ] Add success/error animations
- [ ] Optimize untuk mobile web (responsive, touch-friendly)

**Postman Collection**:

- [ ] Add check-in APIs ke Postman collection

**Acceptance Criteria**:

- ✅ QR code validation API bekerja dengan baik
- ✅ Check-in API bekerja dengan baik
- ✅ One-scan validation bekerja (QR hanya bisa dipakai 1 kali)
- ✅ Duplicate detection bekerja (anti-fraud)
- ✅ Scanner UI mobile-friendly dan mudah digunakan
- ✅ Camera permission handling bekerja
- ✅ Scanner feedback bekerja (visual, sound jika bisa)
- ✅ Error handling comprehensive
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test QR code validation (backend)
- Test check-in flow (backend + frontend)
- Test one-scan validation
- Test duplicate detection
- Test scanner UI di mobile device
- Test camera permission handling
- Test error handling

**Estimated Time**: 5-6 days

---

### Sprint 2: Real-time Check-in Status (Week 4)

**Goal**: Implement real-time check-in status dashboard

**Backend Tasks**:

- [ ] Create check-in status service
- [ ] Implement check-in statistics API (`GET /api/v1/check-ins/statistics`)
- [ ] Implement real-time check-in feed API (`GET /api/v1/check-ins/realtime`)
- [ ] Implement check-in by gate API (`GET /api/v1/check-ins/by-gate/:gateId`)
- [ ] Implement check-in by ticket tier API (`GET /api/v1/check-ins/by-tier/:tierId`)
- [ ] Add WebSocket support untuk real-time updates (optional, bisa polling untuk MVP)
- [ ] Add check-in aggregation queries
- [ ] Add date range filtering

**Frontend Tasks**:

- [ ] Create check-in status types (`types/check-in-status.d.ts`)
- [ ] Create check-in status service (`checkInStatusService`)
- [ ] Create real-time check-in dashboard page (`/check-ins/realtime`)
- [ ] Create check-in statistics component (`CheckInStatistics`)
- [ ] Create real-time check-in feed component (`RealtimeCheckInFeed`)
- [ ] Create check-in by gate component (`CheckInByGate`)
- [ ] Create check-in by tier component (`CheckInByTier`)
- [ ] Add real-time updates (polling atau WebSocket)
- [ ] Add auto-refresh functionality
- [ ] Add filter UI (by gate, by tier, by date)
- [ ] Create check-in status widgets

**Postman Collection**:

- [ ] Add check-in status APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Check-in statistics API bekerja dengan baik
- ✅ Real-time check-in feed API bekerja
- ✅ Check-in by gate API bekerja
- ✅ Check-in by tier API bekerja
- ✅ Frontend menampilkan real-time check-in status
- ✅ Auto-refresh bekerja
- ✅ Filter bekerja optimal
- ✅ Dashboard responsive dan mudah dibaca
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test check-in statistics (backend + frontend)
- Test real-time feed (backend + frontend)
- Test check-in by gate (backend + frontend)
- Test check-in by tier (backend + frontend)
- Test auto-refresh
- Test filter functionality

**Estimated Time**: 4-5 days

---

### Sprint 3: Gate Assignment & Management (Week 5)

**Goal**: Implement gate assignment dan management system

**Backend Tasks**:

- [ ] Create gate model dan migration
- [ ] Create gate assignment model dan migration
- [ ] Create gate repository interface dan implementation
- [ ] Create gate assignment repository interface dan implementation
- [ ] Create gate service
- [ ] Create gate assignment service
- [ ] Implement gate CRUD APIs (`GET /api/v1/gates`, `POST /api/v1/gates`, `PUT /api/v1/gates/:id`, `DELETE /api/v1/gates/:id`)
- [ ] Implement gate assignment API (`POST /api/v1/gates/:id/assign-ticket`)
- [ ] Implement gate check-in API (`POST /api/v1/gates/:id/check-in`)
- [ ] Implement gate separation logic (Gate A/B/C scanning separation)
- [ ] Implement VIP priority entry system
- [ ] Add gate validation
- [ ] Add gate seeder (Gate A, Gate B, Gate C)

**Frontend Tasks**:

- [ ] Create gate types (`types/gate.d.ts`)
- [ ] Create gate assignment types (`types/gate-assignment.d.ts`)
- [ ] Create gate service (`gateService`)
- [ ] Create gate assignment service (`gateAssignmentService`)
- [ ] Create gate list page (`/gates`)
- [ ] Create gate form component (`GateForm`)
- [ ] Create gate detail page (`/gates/[id]`)
- [ ] Create gate assignment component (`GateAssignment`)
- [ ] Create gate management dashboard (`/gates/management`)
- [ ] Add gate assignment UI
- [ ] Add VIP priority entry indicator
- [ ] Create gate status widget

**Postman Collection**:

- [ ] Add gate APIs ke Postman collection

**Acceptance Criteria**:

- ✅ Gate CRUD APIs bekerja dengan baik
- ✅ Gate assignment API bekerja
- ✅ Gate check-in API bekerja
- ✅ Gate separation logic bekerja (Gate A/B/C)
- ✅ VIP priority entry system bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Admin dapat manage gates
- ✅ Gate assignment UI bekerja
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test gate CRUD (backend + frontend)
- Test gate assignment (backend + frontend)
- Test gate check-in (backend + frontend)
- Test gate separation
- Test VIP priority entry

**Estimated Time**: 4-5 days

---

### Sprint 4: Admin Dashboard Monitoring (Week 6)

**Goal**: Implement admin dashboard untuk monitoring penjualan dan check-in

**Status**: ⏳ **FRONTEND PARTIAL** (Components ✅, Backend APIs ❌)

---

### Sprint 4.5: Additional Frontend Modules (Week 6-7)

**Goal**: Complete backend integration untuk frontend modules yang sudah dibuat

**Status**: ⏳ **FRONTEND COMPLETED** / ⏳ **BACKEND PENDING**

**Backend Tasks**:

- [ ] **Ticket Management APIs**
  - [ ] Implement ticket list API (`GET /api/v1/tickets`)
  - [ ] Implement ticket detail API (`GET /api/v1/tickets/:id`)
  - [ ] Implement ticket status update API (`PUT /api/v1/tickets/:id/status`)
  - [ ] Implement recent orders API (`GET /api/v1/orders/recent`)

- [ ] **Merchandise Management APIs**
  - [ ] Create merchandise model dan migration
  - [ ] Create merchandise repository interface dan implementation
  - [ ] Create merchandise service
  - [ ] Implement merchandise CRUD APIs (`GET /api/v1/merchandise`, `POST /api/v1/merchandise`, `PUT /api/v1/merchandise/:id`, `DELETE /api/v1/merchandise/:id`)
  - [ ] Implement merchandise inventory API (`GET /api/v1/merchandise/inventory`)
  - [ ] Add merchandise seeder (jika diperlukan)

- [ ] **Settings Management APIs**
  - [ ] Create settings model dan migration
  - [ ] Create settings repository interface dan implementation
  - [ ] Create settings service
  - [ ] Implement event settings API (`GET /api/v1/settings/event`, `PUT /api/v1/settings/event`)
  - [ ] Implement system settings API (`GET /api/v1/settings/system`, `PUT /api/v1/settings/system`)

- [ ] **Attendance Management APIs**
  - [ ] Create attendance model dan migration (jika berbeda dari check-in)
  - [ ] Create attendance repository interface dan implementation
  - [ ] Create attendance service
  - [ ] Implement attendees list API (`GET /api/v1/attendees`)
  - [ ] Implement attendance statistics API (`GET /api/v1/attendees/statistics`)
  - [ ] Implement attendance export API (`GET /api/v1/attendees/export`)

**Frontend Tasks** (Already Completed):

- [x] Ticket Management components - ✅ Completed
- [x] Merchandise Management components - ✅ Completed
- [x] Settings Management components, hooks, schemas - ✅ Completed
- [x] Attendance Management components, hooks, services - ✅ Completed
- [ ] Integrate frontend dengan backend APIs - **PENDING** (perlu backend APIs dulu)

**Postman Collection**:

- [ ] Add ticket management APIs ke Postman collection
- [ ] Add merchandise APIs ke Postman collection
- [ ] Add settings APIs ke Postman collection
- [ ] Add attendance APIs ke Postman collection

**Menu & Permissions**:

- [ ] Add Ticket Management menu to menu seeder
- [ ] Add Merchandise Management menu to menu seeder
- [ ] Add Settings menu to menu seeder
- [ ] Add Attendance menu to menu seeder
- [ ] Add corresponding permissions to permission seeder

**Acceptance Criteria**:

- ✅ Ticket Management APIs bekerja dengan baik
- ✅ Merchandise Management APIs bekerja dengan baik
- ✅ Settings Management APIs bekerja dengan baik
- ✅ Attendance Management APIs bekerja dengan baik
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test ticket management APIs (backend + frontend integration)
- Test merchandise management APIs (backend + frontend integration)
- Test settings APIs (backend + frontend integration)
- Test attendance APIs (backend + frontend integration)

**Estimated Time**: 5-7 days

**Note**: Modul-modul ini sudah dibuat di frontend sebelumnya, sekarang perlu backend integration untuk melengkapi functionality.

**Backend Tasks**:

- [ ] Create admin dashboard service
- [ ] Implement sales monitoring API (`GET /api/v1/admin/dashboard/sales`)
- [ ] Implement check-in monitoring API (`GET /api/v1/admin/dashboard/check-ins`)
- [ ] Implement ticket quota monitoring API (`GET /api/v1/admin/dashboard/quota`)
- [ ] Implement gate activity API (`GET /api/v1/admin/dashboard/gates`)
- [ ] Implement buyer list API (`GET /api/v1/admin/buyers`)
- [ ] Implement buyer export API (`GET /api/v1/admin/buyers/export`) - CSV/Excel
- [ ] Add date range filtering
- [ ] Add aggregation queries untuk dashboard

**Frontend Tasks**:

- [x] Create admin dashboard types (`types/admin-dashboard.d.ts`) - ✅ Completed
- [x] Create admin dashboard service (`adminDashboardService`) - ✅ Completed
- [x] Create admin dashboard page (`/admin/dashboard`) - ✅ Completed
- [x] Create sales monitoring component (`SalesMonitoring`) - ✅ Completed
- [x] Create check-in monitoring component (`CheckInMonitoring`) - ✅ Completed
- [x] Create ticket quota monitoring component (`QuotaMonitoring`) - ✅ Completed
- [x] Create gate activity component (`GateActivity`) - ✅ Completed
- [x] Create buyer list component (`BuyerList`) - ✅ Completed
- [x] Create admin stats component (`AdminStats`) - ✅ Completed
- [x] Create recent sales component (`RecentSales`) - ✅ Completed
- [x] Create storefront preview component (`StorefrontPreview`) - ✅ Completed
- [x] Create quick actions component (`QuickActions`) - ✅ Completed
- [x] Create dashboard widgets - ✅ Completed
- [ ] Create buyer export component (`BuyerExport`) - **PENDING** (perlu backend API dulu)
- [ ] Add date range picker - **PENDING** (perlu backend API dulu)
- [ ] Add charts untuk monitoring (recharts atau similar) - **PENDING** (perlu backend API dulu)
- [ ] Add real-time updates untuk dashboard - **PENDING** (perlu backend API dulu)

**Postman Collection**:

- [ ] Add admin dashboard APIs ke Postman collection

**Menu & Permissions**:

- [ ] Add Admin Dashboard menu to menu seeder
- [ ] Add Admin Dashboard permissions to permission seeder

**Acceptance Criteria**:

- ✅ Admin dashboard APIs bekerja dengan baik
- ✅ Sales monitoring ditampilkan dengan benar
- ✅ Check-in monitoring ditampilkan dengan benar
- ✅ Ticket quota monitoring ditampilkan dengan benar
- ✅ Gate activity ditampilkan dengan benar
- ✅ Buyer list ditampilkan dengan benar
- ✅ Buyer export bekerja (CSV/Excel)
- ✅ Charts dan graphs ditampilkan dengan benar
- ✅ Real-time updates bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test admin dashboard data loading (backend + frontend)
- Test sales monitoring (backend + frontend)
- Test check-in monitoring (backend + frontend)
- Test ticket quota monitoring (backend + frontend)
- Test gate activity (backend + frontend)
- Test buyer list (backend + frontend)
- Test buyer export (backend)

**Estimated Time**: 4-5 days

---

### Sprint 5: Integration & Testing (Week 7-8)

**Goal**: Integration dengan modul Dev1 dan final testing

**Tasks**:

- [ ] Coordinate dengan Developer 1 untuk integration
- [ ] Test integration antara modul Dev2 dan Dev1
- [ ] Fix integration issues
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Final bug fixes
- [ ] Documentation update

**Integration Points**:

- [ ] E-Ticket data dari Dev1 untuk Check-in Scanner - Pending (E-Ticket belum diimplementasikan)
- [x] Order data dari Dev1 untuk Admin Dashboard - ✅ Ready (Admin Order APIs sudah ada)
- [ ] Check-in data ke Analytics Dev1 - Pending (Check-in belum diimplementasikan)
- [x] Event data untuk Admin Dashboard - ✅ Ready (Event APIs sudah ada)

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

| Sprint   | Goal                          | Duration | Status                           | Notes                                    |
| -------- | ----------------------------- | -------- | -------------------------------- | ---------------------------------------- |
| Sprint 0 | Foundation & Setup            | 1-2 days | ✅ Completed                     | -                                        |
| Sprint 1 | Check-in Scanner (Mobile-Web) | 5-6 days | ⏳ Pending                       | Belum dikerjakan                         |
| Sprint 2 | Real-time Check-in Status     | 4-5 days | ⏳ Pending                       | Belum dikerjakan                         |
| Sprint 3 | Gate Assignment & Management  | 4-5 days | ⏳ Pending                       | Belum dikerjakan                         |
| Sprint 4 | Admin Dashboard Monitoring    | 4-5 days | ⏳ Frontend (60%) / Backend (0%) | Frontend: Components ✅, Backend APIs ❌ |
| Sprint 4.5 | Additional Frontend Modules | 5-7 days | ⏳ Frontend (100%) / Backend (0%) | Frontend: Completed ✅, Backend APIs ❌ |
| Sprint 5 | Integration & Testing         | 3-4 days | ⏳ Pending                       | Belum dikerjakan                         |

**Total Estimated Time**: 29-38 days (4.1-5.4 weeks)

**Note**: Sprint 4.5 ditambahkan untuk melengkapi backend integration untuk modul-modul frontend yang sudah dibuat sebelumnya (Ticket Management, Merchandise, Settings, Attendance).

**Note**: Sprint 0 dan Sprint 1 (User Management & Access Control) telah dipindahkan ke Dev1.

**📋 Status Detail**: Lihat [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) untuk detail lengkap setiap modul

---

## 🔗 Coordination dengan Dev1

### Modul yang dikerjakan Dev1 (untuk referensi):

- Event Management (Fullstack)
- Ticket Category Management (Fullstack)
- Schedule Management (Fullstack)
- Ticket Purchase Flow (Frontend + Backend Integration)
- E-Ticket Generation & QR Code (Fullstack)
- Email Service Integration (Backend)
- Order History & Resend Ticket (Fullstack)
- Analytics Dashboard (Fullstack)

### Integration Points:

- E-Ticket data (Dev1) → Check-in Scanner (Dev2)
- Order data (Dev1) → Admin Dashboard (Dev2)
- Check-in data (Dev2) → Analytics (Dev1)

### Coordination:

- [ ] Week 1: Coordinate database schema untuk User, Role, Permission, Check-in, Gate
- [ ] Week 2: Coordinate API contract untuk integration points
- [ ] Week 4: Mid-sprint review - check integration points
- [ ] Week 6: Pre-integration review
- [ ] Week 7: Final integration testing

---

## 📝 Notes

1. **Fullstack Development**: Setiap modul dikerjakan fullstack sampai selesai
2. **No Dependencies**: Tidak bergantung ke Dev1, bisa dikerjakan paralel (kecuali ticket data di sprint 3+)
3. **Hackathon Mode**: Tidak ada unit test intensif, manual testing saja
4. **Code Review**: Lakukan code review sebelum merge
5. **Documentation**: Update documentation setelah setiap sprint
6. **Postman Collection**: Update Postman collection untuk setiap modul
7. **Mobile-Web Scanner**: Scanner harus mobile-friendly dan mudah digunakan di lapangan
8. **Real-time Updates**: Bisa menggunakan polling untuk MVP, WebSocket bisa ditambahkan nanti
9. **Offline Scan Buffer**: Fitur offline scan buffer akan dilakukan di sprint berikutnya (tidak termasuk di sprint awal)

---

**Dokumen ini akan diupdate sesuai dengan progress development.**
