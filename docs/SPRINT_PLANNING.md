# Sprint Planning - Master
## Ticketing Konser Internasional Platform

**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-XX  
**Product Type**: Ticketing System untuk Konser Internasional (1 Event Only)

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

Dokumen ini adalah **master planning** untuk development Ticketing Konser Platform dengan **2 developers**:
- **Developer 1**: Fullstack Developer (Go Backend + Next.js Frontend)
- **Developer 2**: Fullstack Developer (Go Backend + Next.js Frontend)

Setiap developer memiliki sprint planning terpisah yang detail.

### Product Scope

**Ticketing System untuk Konser Internasional (1 Event Only)** dengan fitur:
- Multiple Ticket Tier Management (Presale, Regular, VIP, VVIP, Meet & Greet)
- Real-time Ticket Quota Management
- Unique E-Ticket Generation dengan QR/Barcode
- Email Confirmation & E-ticket Delivery
- On-site Check-in Scanner (Mobile-Web)
- Real-time Check-in Status Dashboard
- Admin Dashboard untuk Monitoring Penjualan
- Access Control Roles (Super Admin, Finance, Gate Staff)
- Gate Assignment (Gate A/B/C scanning separation)
- Order History & Resend Ticket Function
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
- **Email Service**: SMTP (basic) atau service sederhana

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
  - Event & Ticket Tier Management (Fullstack)
  - Ticket Purchase Flow (Frontend + Backend Integration)
  - E-Ticket Generation & QR Code (Fullstack)
  - Email Service Integration (Backend)
  - Order History & Resend Ticket (Fullstack)
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
  - User Management & Access Control (Fullstack)
  - Check-in Scanner System (Fullstack - Mobile-Web)
  - Real-time Check-in Status (Fullstack)
  - Gate Assignment & Management (Fullstack)
  - Admin Dashboard Monitoring (Fullstack)
  - Buyer List Export (CSV/Excel) (Backend)
- **Sprint Planning**: [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md)

---

## Sprint Overview

### Master Timeline (60 Hari / ~8.5 Minggu)

| Week | Developer 1 (Fullstack) | Developer 2 (Fullstack) |
|------|-------------------------|------------------------|
| 1 | Foundation & Event Setup | Foundation & User Management |
| 2 | Ticket Tier Management | Access Control & Roles |
| 3 | Ticket Purchase Flow (Basic) | Check-in Scanner (Mobile-Web) |
| 4 | E-Ticket Generation & QR | Real-time Check-in Status |
| 5 | Email Service & Order History | Gate Assignment & Management |
| 6 | Analytics Dashboard | Admin Dashboard Monitoring |
| 7 | Integration & Testing | Integration & Testing |
| 8 | Polish & Final Testing | Polish & Final Testing |

---

## Developer Sprint Plans

### Developer 1: Fullstack Developer
📄 **Detail Sprint Planning**: [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md)

**Sprint Summary**:
- Sprint 0: Foundation & Event Setup (3-4 days)
- Sprint 1: Ticket Tier Management (4-5 days)
- Sprint 2: Ticket Purchase Flow (Basic) (5-6 days)
- Sprint 3: E-Ticket Generation & QR Code (4-5 days)
- Sprint 4: Email Service & Order History (4-5 days)
- Sprint 5: Analytics Dashboard (4-5 days)
- Sprint 6: Integration & Testing (3-4 days)

**Total**: 27-34 days (3.9-4.9 weeks)

**Modul yang dikerjakan**:
- ✅ Event & Ticket Tier Management (Backend + Frontend)
- ✅ Ticket Purchase Flow (Frontend + Backend Integration)
- ✅ E-Ticket Generation & QR Code (Backend + Frontend)
- ✅ Email Service Integration (Backend)
- ✅ Order History & Resend Ticket (Backend + Frontend)
- ✅ Analytics Dashboard (Backend + Frontend)

### Developer 2: Fullstack Developer
📄 **Detail Sprint Planning**: [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md)

**Sprint Summary**:
- Sprint 0: Foundation & User Management (3-4 days)
- Sprint 1: Access Control & Roles (3-4 days)
- Sprint 2: Check-in Scanner (Mobile-Web) (5-6 days)
- Sprint 3: Real-time Check-in Status (4-5 days)
- Sprint 4: Gate Assignment & Management (4-5 days)
- Sprint 5: Admin Dashboard Monitoring (4-5 days)
- Sprint 6: Integration & Testing (3-4 days)

**Total**: 26-33 days (3.7-4.7 weeks)

**Modul yang dikerjakan**:
- ✅ User Management & Access Control (Backend + Frontend)
- ✅ Check-in Scanner System (Backend + Frontend - Mobile-Web)
- ✅ Real-time Check-in Status (Backend + Frontend)
- ✅ Gate Assignment & Management (Backend + Frontend)
- ✅ Admin Dashboard Monitoring (Backend + Frontend)
- ✅ Buyer List Export (CSV/Excel) (Backend)

---

## Coordination & Dependencies

### Parallel Development Strategy

1. **Developer 1 & Developer 2**: Bekerja paralel dengan dependencies minimal
   - Setiap developer mengerjakan modul secara fullstack (backend + frontend)
   - Integration points diidentifikasi di awal
   - Integration dilakukan di akhir (Week 7-8)

2. **Integration Points** (Week 7-8):
   - Check-in Scanner (Dev2) perlu data dari E-Ticket (Dev1)
   - Admin Dashboard (Dev2) perlu data dari Analytics (Dev1)
   - Gate Assignment (Dev2) perlu data dari Ticket Purchase (Dev1)
   - Order History (Dev1) perlu data dari Check-in Status (Dev2)

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
6. **Week 8**: Final review - final testing dan delivery

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

**Week 2**: Core Features Setup
- Developer 1: Ticket Tier Management
- Developer 2: Access Control & Roles

**Week 3**: Purchase & Scanner
- Developer 1: Ticket Purchase Flow (Basic)
- Developer 2: Check-in Scanner (Mobile-Web)

**Week 4**: Ticket & Check-in
- Developer 1: E-Ticket Generation & QR Code
- Developer 2: Real-time Check-in Status

**Week 5**: Management Features
- Developer 1: Email Service & Order History
- Developer 2: Gate Assignment & Management

**Week 6**: Dashboard & Monitoring
- Developer 1: Analytics Dashboard
- Developer 2: Admin Dashboard Monitoring

**Week 7**: Integration
- All Developers: Integration, Testing, Bug Fixes

**Week 8**: Final Delivery
- All Developers: Final Testing, Polish, Documentation

---

## Sprint Details

> **Note**: Detail sprint untuk setiap developer ada di file terpisah:
> - [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md) - Developer 1 (7 sprints)
> - [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md) - Developer 2 (7 sprints)

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
- Event & Ticket Tier - User Management
- Purchase Flow        - Access Control
- E-Ticket & QR        - Check-in Scanner
- Email & Order        - Check-in Status
- Analytics            - Gate Assignment
                        - Admin Dashboard
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

- **Total Duration**: 60 hari (~8.5 minggu)
- **Team Size**: 2 developers
  - Developer 1 (Fullstack): 27-34 days (3.9-4.9 weeks)
  - Developer 2 (Fullstack): 26-33 days (3.7-4.7 weeks)

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

---

**Dokumen ini akan diupdate sesuai dengan progress development.**

