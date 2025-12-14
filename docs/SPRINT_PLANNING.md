# Sprint Planning - Master

## Ticketing Konser Internasional Platform

**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-XX  
**Product Type**: Ticketing System untuk Konser Internasional (Multiple Events)

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Team Structure](#team-structure)
3. [Sprint Overview](#sprint-overview)
4. [Developer Sprint Plans](#developer-sprint-plans)
5. [Coordination & Dependencies](#coordination--dependencies)
6. [Timeline](#timeline)
7. [Sprint Checklist](#sprint-checklist)
8. [Dependencies](#dependencies)

---

## Overview

Dokumen ini adalah **master planning** untuk development Ticketing Konser Platform dengan **3 developers**:

- **Developer 1**: Fullstack Developer (Go Backend + Next.js Frontend)
- **Developer 2**: Fullstack Developer (Go Backend + Next.js Frontend)
- **Developer 3**: Mobile App Developer (Flutter/React Native)

Setiap developer memiliki sprint planning terpisah yang detail.

### Product Scope

**Ticketing System untuk Konser Internasional (Multiple Events)** dengan fitur:

- Event Management (Create/Edit/Delete Event, Event Status Management)
- Multiple Ticket Category Management (Presale, Regular, VIP, VVIP, Meet & Greet)
- Schedule Management (Sesi harian per event dengan rundown jadwal dan artist name)
- Real-time Ticket Quota Management
- Unique E-Ticket Generation dengan QR/Barcode
- Email Confirmation & E-ticket Delivery
- On-site Check-in Scanner (Mobile-Web)
- Real-time Check-in Status Dashboard
- Admin Dashboard untuk Monitoring Penjualan
- Access Control Roles (Admin, Staff Gate, Guest)
- Gate Assignment (Gate A/B/C scanning separation)
- Order History Function
- Analytics Penjualan
- Mobile-friendly User Experience

### Technology Stack

- **Backend**: Go (Gin framework)
- **Web Frontend**: Next.js 16 (App Router, Server Components)
- **Database**: PostgreSQL
- **State Management (Web)**: Zustand
- **Styling (Web)**: Tailwind CSS v4
- **UI Components (Web)**: shadcn/ui v4
- **QR Code Generation**: Library Go/JavaScript
- **Email Service**: Tidak digunakan - E-ticket langsung ditampilkan di halaman setelah pembayaran

---

## Team Structure

### Developer 1: Fullstack Developer

- **Focus**: Fullstack development (Go Backend + Next.js Frontend)
- **Responsibilities**:
  - Develop modul-modul yang ditugaskan secara fullstack
  - Backend APIs + Frontend untuk modul yang ditugaskan
  - Database design dan migration
  - Update Postman collection
- **Modul yang ditugaskan**:
  - User Management & Access Control (Fullstack) - **Dipindahkan dari Dev2**
  - Role Management (Fullstack) - **Dipindahkan dari Dev2**
  - Permission Management (Fullstack) - **Dipindahkan dari Dev2**
  - Menu Management (Fullstack) - **Dipindahkan dari Dev2**
  - Authentication (Fullstack) - **Dipindahkan dari Dev2**
  - Event Management (Fullstack)
  - Ticket Category Management (Fullstack)
  - Schedule Management (Fullstack)
  - Ticket Purchase Flow (Frontend + Backend Integration)
  - E-Ticket Generation & QR Code (Fullstack)
  - Order History (Fullstack)
  - Analytics Dashboard (Fullstack)
- **Sprint Planning**: [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md)

### Developer 2: Fullstack Developer

- **Focus**: Fullstack development (Go Backend + Next.js Frontend)
- **Responsibilities**:
  - Develop modul-modul yang ditugaskan secara fullstack
  - Backend APIs + Frontend untuk modul yang ditugaskan
  - Database design dan migration
  - Update Postman collection
- **Modul yang ditugaskan**:
  - Check-in Scanner System (Fullstack - Mobile-Web)
  - Real-time Check-in Status (Fullstack)
  - Gate Assignment & Management (Fullstack)
  - Admin Dashboard Monitoring (Fullstack)
  - Buyer List Export (CSV/Excel) (Backend)

**Note**: User Management, Role Management, Permission Management, Menu Management, dan Authentication telah dipindahkan ke Dev1.

- **Sprint Planning**: [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md)

### Developer 3: Mobile App Developer

- **Focus**: Mobile app development (Flutter/React Native)
- **Responsibilities**:
  - Develop mobile app untuk Staff Gate
  - QR Code Scanner dengan camera
  - Check-in Process
  - Check-in History
- **Modul yang ditugaskan**:
  - Mobile App Authentication
  - QR Code Scanner
  - Check-in Validation & Processing
  - Check-in History
  - Profile & Settings
- **Sprint Planning**: [`SPRINT_PLANNING_DEV3.md`](./SPRINT_PLANNING_DEV3.md)

---

## Sprint Overview

### Master Timeline (65-70 Hari / ~9.3-10 Minggu)

| Week | Developer 1 (Fullstack)               | Developer 2 (Fullstack)       | Developer 3 (Mobile App)         |
| ---- | ------------------------------------- | ----------------------------- | -------------------------------- |
| 1    | Foundation & Event Setup              | Foundation & User Management  | Foundation & Setup               |
| 2    | Event Management                      | Access Control & Roles        | QR Code Scanner                  |
| 3    | Ticket Category & Schedule Management | Check-in Scanner (Mobile-Web) | Check-in Validation & Processing |
| 4-5  | Ticket Purchase Flow dengan Payment   | Real-time Check-in Status     | Check-in History                 |
| 5    | E-Ticket Generation & QR              | Gate Assignment & Management  | Profile & Settings               |
| 6    | Order History                         | Admin Dashboard Monitoring    | Polish & Testing                 |
| 7    | Analytics Dashboard                   | Integration & Testing         | -                                |
| 7-8  | Mobile APIs untuk Staff Gate          | -                             | Integration Testing              |
| 8    | Integration & Testing                 | Polish & Final Testing        | -                                |
| 9    | Polish & Final Testing                | -                             | -                                |

---

## Developer Sprint Plans

### Developer 1: Fullstack Developer

📄 **Detail Sprint Planning**: [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md)

**Sprint Summary**:

- Sprint 0: Foundation & Event Setup (3-4 days) - ✅ **Completed**
- Sprint 0.5: User Management & Access Control (3-4 days) - ✅ **Backend Completed** / ⏳ **Frontend Partial** (Auth & Menu Completed) - **Dipindahkan dari Dev2**
- Sprint 1: Event Management (4-5 days) - ✅ **Backend Completed** / ⏳ **Frontend In Progress**
- Sprint 2: Ticket Category & Schedule Management (4-5 days) - ✅ **Backend Completed** / ⏳ **Frontend In Progress**
- Sprint 3: Ticket Purchase Flow dengan Payment (7-8 days) - ✅ **Backend (Admin APIs) Completed** / ⏳ **Guest APIs, Payment & Frontend Pending**
- Sprint 4: E-Ticket Generation & QR Code (4-5 days) - ⏳ **Pending**
- Sprint 5: Order History (3-4 days) - ⏳ **Pending** (Email service dihapus)
- Sprint 6: Analytics Dashboard (4-5 days) - ⏳ **Pending**
- Sprint 7: Integration & Testing (3-4 days) - ⏳ **Pending**

**Total**: 35-43 days (5-6.1 weeks)

**Modul yang dikerjakan**:

- ✅ User Management & Access Control (✅ Backend / ⏳ Frontend - Auth & Menu Completed) - **Dipindahkan dari Dev2**
- ✅ Role Management (✅ Backend / ⏳ Frontend) - **Dipindahkan dari Dev2**
- ✅ Permission Management (✅ Backend / ⏳ Frontend) - **Dipindahkan dari Dev2**
- ✅ Menu Management (✅ Backend / ✅ Frontend) - **Dipindahkan dari Dev2**
- ✅ Authentication (✅ Backend / ✅ Frontend) - **Dipindahkan dari Dev2**
- ✅ Event Management (✅ Backend / ⏳ Frontend)
- ✅ Ticket Category Management (✅ Backend / ⏳ Frontend - Components only)
- ✅ Schedule Management (✅ Backend / ⏳ Frontend - Components only)
- ⏳ Ticket Purchase Flow (✅ Backend Admin APIs / ⏳ Guest APIs, Payment Integration & Frontend)
- ⏳ E-Ticket Generation & QR Code (⏳ Pending)
- ⏳ Order History (⏳ Pending)
- ⏳ Analytics Dashboard (⏳ Pending)

### Developer 2: Fullstack Developer

📄 **Detail Sprint Planning**: [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md)

**Sprint Summary**:

- Sprint 0: Foundation & Setup (1-2 days) - ✅ **Completed**
- Sprint 1: Check-in Scanner (Mobile-Web) (5-6 days) - ⏳ **Pending**
- Sprint 2: Real-time Check-in Status (4-5 days) - ⏳ **Pending**
- Sprint 3: Gate Assignment & Management (4-5 days) - ⏳ **Pending**
- Sprint 4: Admin Dashboard Monitoring (4-5 days) - ⏳ **Frontend Partial** (Components ✅, Backend APIs ❌)
- Sprint 5: Integration & Testing (3-4 days) - ⏳ **Pending**

**Total**: 21-27 days (3-3.9 weeks)

**Modul yang dikerjakan**:

- ⏳ Check-in Scanner System (⏳ Pending)
- ⏳ Real-time Check-in Status (⏳ Pending)
- ⏳ Gate Assignment & Management (⏳ Pending)
- ⏳ Admin Dashboard Monitoring (⏳ Frontend Partial - Components ✅, Backend APIs ❌)
- ⏳ Buyer List Export (CSV/Excel) (⏳ Pending)

**Note**: User Management, Role Management, Permission Management, Menu Management, dan Authentication telah dipindahkan ke Dev1.

---

## Coordination & Dependencies

### Parallel Development Strategy

1. **Developer 1 & Developer 2**: Bekerja paralel dengan dependencies minimal
   - Setiap developer mengerjakan modul secara fullstack (backend + frontend)
   - Integration points diidentifikasi di awal
   - Integration dilakukan di akhir (Week 7-8)

2. **Integration Points** (Week 7-8):
   - Check-in Scanner (Dev2) perlu data dari E-Ticket (Dev1) - ⏳ Pending
   - Admin Dashboard (Dev2) perlu data dari Analytics (Dev1) - ⏳ Pending
   - Admin Dashboard (Dev2) perlu data dari Order (Dev1) - ✅ Ready (Admin Order APIs sudah ada)
   - Admin Dashboard (Dev2) perlu data dari Event (Dev1) - ✅ Ready (Event APIs sudah ada)
   - Gate Assignment (Dev2) perlu data dari Ticket Purchase (Dev1) - ⏳ Pending
   - Order History (Dev1) perlu data dari Check-in Status (Dev2) - ⏳ Pending

3. **Shared Resources**:
   - Database schema untuk Event, Ticket, Order, Check-in
   - API response standards
   - Authentication & Authorization (Dev2 setup, Dev1 consume)

### Coordination Points

1. **Week 1**: Kickoff meeting - align scope, database schema, dan timeline
2. **Week 2**: API design review - present API design untuk integration points
3. **Week 4**: Mid-sprint review - check progress dan blockers
4. **Week 6**: Pre-integration review - plan integration testing
5. **Week 7**: Integration testing - test semua integration points
6. **Week 8**: Integration & polish - continue integration dan polish
7. **Week 9**: Final review - final testing dan delivery

### API Design Coordination

- **Developer 1 & Developer 2** design APIs untuk modul masing-masing
- Semua APIs harus mengikuti API response standards
- Coordinate integration points di Week 2 dan Week 6
- Postman collection harus terpisah untuk modul masing-masing

---

## Timeline

### Overall Timeline (60 Hari)

**Week 1**: Foundation & Setup

- Developer 1: Foundation & Event Setup
- Developer 2: Foundation & User Management

**Week 2**: Event & Access Control

- Developer 1: Event Management
- Developer 2: Access Control & Roles

**Week 3**: Ticket & Scanner

- Developer 1: Ticket Category & Schedule Management
- Developer 2: Check-in Scanner (Mobile-Web)

**Week 4**: Purchase & Check-in

- Developer 1: Ticket Purchase Flow dengan Payment
- Developer 2: Real-time Check-in Status

**Week 5**: Ticket Generation & Gate

- Developer 1: E-Ticket Generation & QR Code
- Developer 2: Gate Assignment & Management

**Week 6**: Order History & Monitoring

- Developer 1: Order History
- Developer 2: Admin Dashboard Monitoring

**Week 7**: Analytics & Integration

- Developer 1: Analytics Dashboard
- Developer 2: Integration & Testing

**Week 8**: Integration & Polish

- Developer 1: Integration & Testing
- Developer 2: Polish & Final Testing

**Week 9**: Final Delivery

- Developer 1: Polish & Final Testing
- All Developers: Final Review, Documentation

---

## Sprint Details

> **Note**: Detail sprint untuk setiap developer ada di file terpisah:
>
> - [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md) - Developer 1 (9 sprints)
> - [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md) - Developer 2 (6 sprints)
> - [`SPRINT_PLANNING_DEV3.md`](./SPRINT_PLANNING_DEV3.md) - Developer 3 (6 sprints)

---

## Sprint Checklist

### Before Starting Sprint

- [ ] Review sprint goal dan tasks
- [ ] Check dependencies dari previous sprints
- [ ] Coordinate dengan developers lain
- [ ] Setup development environment
- [ ] Create feature branch

### During Sprint

- [ ] Follow coding standards
- [ ] Write tests untuk new features (manual testing)
- [ ] Update documentation
- [ ] Commit frequently dengan clear messages
- [ ] Coordinate dengan developers lain jika ada blockers

### After Sprint

- [ ] Test all acceptance criteria
- [ ] Code review
- [ ] Update sprint status
- [ ] Deploy to staging (jika applicable)
- [ ] Demo ke stakeholders

---

## Dependencies

### Sprint Dependency Graph

```
Sprint 0 (Foundation) ✅
    ↓
┌─────────────────────────────────────────┐
│  PARALLEL DEVELOPMENT (Minimal Deps)    │
└─────────────────────────────────────────┘
    ↓                    ↓
Dev1:                 Dev2:
- Event Management     - User Management
- Ticket Category      - Access Control
- Schedule Management  - Check-in Scanner
- Purchase Flow        - Check-in Status
- E-Ticket & QR        - Gate Assignment
- Email & Order        - Admin Dashboard
- Analytics
    ↓                    ↓
┌─────────────────────────────────────────┐
│  Integration & Testing (Week 7-8)        │
└─────────────────────────────────────────┘
```

### Key Dependencies

1. **Database Schema**: Harus didefinisikan di Week 1 (shared)
2. **Authentication**: Dev2 setup, Dev1 consume
3. **E-Ticket Data**: Dev1 generate, Dev2 consume untuk check-in
4. **Check-in Data**: Dev2 generate, Dev1 consume untuk analytics

---

## Estimated Timeline

- **Total Duration**: 65-70 hari (~9.3-10 minggu)
- **Team Size**: 3 developers
  - Developer 1 (Fullstack): 38-47 days (5.4-6.7 weeks)
  - Developer 2 (Fullstack): 21-27 days (3-3.9 weeks)
  - Developer 3 (Mobile App): 19-25 days (2.7-3.6 weeks)

---

## Notes

1. **Flexibility**: Sprint dapat di-adjust sesuai kebutuhan
2. **Parallel Work**: Beberapa sprints dapat dikerjakan parallel jika tidak ada dependency
3. **Testing**: Setiap sprint harus include manual testing
4. **Documentation**: Update documentation setelah setiap sprint
5. **Code Review**: Lakukan code review sebelum merge
6. **Coordination**: Coordinate dengan developers lain untuk dependencies
7. **Payment Integration**: Midtrans integration akan dilakukan di sprint berikutnya (tidak termasuk di sprint awal)
8. **Refund & Transfer**: Fitur refund dan transfer ownership akan dilakukan di sprint berikutnya

---

**Dokumen ini adalah master planning. Untuk detail sprint, lihat:**

- [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md) - Developer 1
- [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md) - Developer 2
- [`SPRINT_PLANNING_DEV3.md`](./SPRINT_PLANNING_DEV3.md) - Developer 3

---

**Dokumen ini akan diupdate sesuai dengan progress development.**
