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

1. ✅ User Management & Access Control (Fullstack)
2. ✅ Check-in Scanner System (Fullstack - Mobile-Web)
3. ✅ Real-time Check-in Status (Fullstack)
4. ✅ Gate Assignment & Management (Fullstack)
5. ✅ Admin Dashboard Monitoring (Fullstack)
6. ✅ Buyer List Export (CSV/Excel) (Backend)

**Parallel Development Strategy**:

- ✅ **TIDAK bergantung ke Dev1** - bisa dikerjakan paralel (kecuali ticket data di sprint 3+)
- ✅ Setiap modul dikerjakan fullstack sampai selesai
- ✅ **Hackathon mode** - tidak ada unit test intensif
- ✅ Manual testing saja

---

## 🎯 Sprint Details

### Sprint 0: Foundation & User Management (Week 1)

**Goal**: Setup foundation dan user management dengan access control

**Backend Tasks**:

- [ ] Review authentication flow (login, token refresh)
- [ ] Create user model dan migration (jika belum ada)
- [ ] Create role model dan migration
- [ ] Create permission model dan migration
- [ ] Create user repository interface dan implementation
- [ ] Create role repository interface dan implementation
- [ ] Create permission repository interface dan implementation
- [ ] Create user service
- [ ] Create role service
- [ ] Create permission service
- [ ] Implement user CRUD APIs (`GET /api/v1/users`, `POST /api/v1/users`, `PUT /api/v1/users/:id`, `DELETE /api/v1/users/:id`)
- [ ] Implement role CRUD APIs (`GET /api/v1/roles`, `POST /api/v1/roles`, `PUT /api/v1/roles/:id`, `DELETE /api/v1/roles/:id`)
- [ ] Implement permission CRUD APIs (`GET /api/v1/permissions`, `POST /api/v1/permissions`, `PUT /api/v1/permissions/:id`, `DELETE /api/v1/permissions/:id`)
- [ ] Implement role-permission assignment APIs
- [ ] Implement user-role assignment APIs
- [ ] Add validation
- [ ] Add role seeder (Super Admin, Finance, Gate Staff)
- [ ] Add permission seeder untuk ticketing system

**Frontend Tasks**:

- [ ] Create user types (`types/user.d.ts`)
- [ ] Create role types (`types/role.d.ts`)
- [ ] Create permission types (`types/permission.d.ts`)
- [ ] Create user service (`userService`)
- [ ] Create role service (`roleService`)
- [ ] Create permission service (`permissionService`)
- [ ] Create user list page (`/users`)
- [ ] Create user form component (`UserForm`)
- [ ] Create user detail page (`/users/[id]`)
- [ ] Create role list page (`/roles`)
- [ ] Create role form component (`RoleForm`)
- [ ] Create permission assignment component (`PermissionAssignment`)
- [ ] Add user search and filter
- [ ] Add role-permission assignment UI

**Postman Collection**:

- [ ] Add user APIs ke Postman collection
- [ ] Add role APIs ke Postman collection
- [ ] Add permission APIs ke Postman collection

**Acceptance Criteria**:

- ✅ User CRUD APIs bekerja dengan baik
- ✅ Role CRUD APIs bekerja dengan baik
- ✅ Permission CRUD APIs bekerja dengan baik
- ✅ Role-permission assignment bekerja
- ✅ User-role assignment bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Admin dapat manage users, roles, dan permissions
- ✅ Form validation comprehensive
- ✅ UI/UX modern dan intuitive
- ✅ Postman collection updated

**Testing** (Manual testing):

- Test user CRUD (backend + frontend)
- Test role CRUD (backend + frontend)
- Test permission CRUD (backend + frontend)
- Test role-permission assignment
- Test user-role assignment

**Estimated Time**: 3-4 days

---

### Sprint 1: Access Control & Roles (Week 2)

**Goal**: Implement access control dengan role-based permissions

**Backend Tasks**:

- [ ] Create middleware untuk role-based access control
- [ ] Create middleware untuk permission-based access control
- [ ] Implement route protection berdasarkan role
- [ ] Implement route protection berdasarkan permission
- [ ] Add role checking untuk ticketing endpoints
- [ ] Add permission checking untuk ticketing endpoints
- [ ] Implement user context middleware (untuk get current user)
- [ ] Add audit logging untuk access control
- [ ] Test semua protected endpoints

**Frontend Tasks**:

- [ ] Create auth guard component (`AuthGuard`)
- [ ] Create role guard component (`RoleGuard`)
- [ ] Create permission guard component (`PermissionGuard`)
- [ ] Implement route protection di Next.js
- [ ] Add role-based menu visibility
- [ ] Add permission-based button visibility
- [ ] Create access denied page (`/access-denied`)
- [ ] Add user context provider
- [ ] Add role/permission checking hooks

**Postman Collection**:

- [ ] Update Postman collection dengan auth headers untuk protected endpoints

**Acceptance Criteria**:

- ✅ Access control middleware bekerja dengan baik
- ✅ Route protection berdasarkan role bekerja
- ✅ Route protection berdasarkan permission bekerja
- ✅ Frontend route protection bekerja
- ✅ Role-based menu visibility bekerja
- ✅ Permission-based button visibility bekerja
- ✅ Access denied page ditampilkan untuk unauthorized access
- ✅ Postman collection updated dengan auth

**Testing** (Manual testing):

- Test access control dengan berbagai roles
- Test access control dengan berbagai permissions
- Test frontend route protection
- Test menu visibility berdasarkan role
- Test button visibility berdasarkan permission

**Estimated Time**: 3-4 days

---

### Sprint 2: Check-in Scanner (Mobile-Web) (Week 3)

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

### Sprint 3: Real-time Check-in Status (Week 4)

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

### Sprint 4: Gate Assignment & Management (Week 5)

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

### Sprint 5: Admin Dashboard Monitoring (Week 6)

**Goal**: Implement admin dashboard untuk monitoring penjualan dan check-in

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

- [ ] Create admin dashboard types (`types/admin-dashboard.d.ts`)
- [ ] Create admin dashboard service (`adminDashboardService`)
- [ ] Create admin dashboard page (`/admin/dashboard`)
- [ ] Create sales monitoring component (`SalesMonitoring`)
- [ ] Create check-in monitoring component (`CheckInMonitoring`)
- [ ] Create ticket quota monitoring component (`QuotaMonitoring`)
- [ ] Create gate activity component (`GateActivity`)
- [ ] Create buyer list component (`BuyerList`)
- [ ] Create buyer export component (`BuyerExport`)
- [ ] Add date range picker
- [ ] Add charts untuk monitoring (recharts atau similar)
- [ ] Create dashboard widgets
- [ ] Add real-time updates untuk dashboard

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

### Sprint 6: Integration & Testing (Week 7-8)

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

- [ ] E-Ticket data dari Dev1 untuk Check-in Scanner
- [ ] Order data dari Dev1 untuk Admin Dashboard
- [ ] Check-in data ke Analytics Dev1

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
| Sprint 0 | Foundation & User Management      | 3-4 days | ⏳ Pending |
| Sprint 1 | Access Control & Roles            | 3-4 days | ⏳ Pending |
| Sprint 2 | Check-in Scanner (Mobile-Web)     | 5-6 days | ⏳ Pending |
| Sprint 3 | Real-time Check-in Status         | 4-5 days | ⏳ Pending |
| Sprint 4 | Gate Assignment & Management      | 4-5 days | ⏳ Pending |
| Sprint 5 | Admin Dashboard Monitoring        | 4-5 days | ⏳ Pending |
| Sprint 6 | Integration & Testing             | 3-4 days | ⏳ Pending |

**Total Estimated Time**: 26-33 days (3.7-4.7 weeks)

---

## 🔗 Coordination dengan Dev1

### Modul yang dikerjakan Dev1 (untuk referensi):

- Event & Ticket Tier Management (Fullstack)
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

