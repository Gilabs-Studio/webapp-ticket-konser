# Product Requirements Document (PRD)
## Ticketing Konser Internasional Platform

**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-XX  
**Target Release**: MVP Q1 2025  
**Product Type**: Ticketing System untuk Konser Internasional (1 Event Only)

---

## 📋 Daftar Isi

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Target Users](#target-users)
4. [Business Objectives](#business-objectives)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [User Stories](#user-stories)
8. [Technical Requirements](#technical-requirements)
9. [Success Metrics](#success-metrics)
10. [Timeline & Milestones](#timeline--milestones)
11. [Risks & Mitigation](#risks--mitigation)

---

## Executive Summary

Ticketing Konser Internasional Platform adalah sistem ticketing online yang dirancang khusus untuk **konser internasional (1 event only)** dengan fitur lengkap mulai dari pembelian tiket, generasi E-Ticket dengan QR code unik, hingga check-in on-site menggunakan mobile-web scanner. Platform ini membantu panitia mengelola penjualan tiket, monitoring real-time, dan validasi check-in dengan sistem anti-fraud yang terintegrasi.

### Key Value Propositions

- **Multiple Ticket Tier Management**: Manajemen berbagai tier tiket (Presale, Regular, VIP, VVIP, Meet & Greet) dengan quota tracking real-time
- **Unique E-Ticket dengan QR Code**: Setiap pembeli menerima E-Ticket dengan QR code unik yang hanya bisa digunakan sekali
- **On-site Check-in Scanner**: Mobile-web scanner untuk validasi tiket di lokasi konser tanpa perlu aplikasi native
- **Real-time Monitoring**: Dashboard real-time untuk monitoring penjualan, check-in status, dan analytics
- **Anti-Fraud Protection**: Sistem deteksi duplicate dan screenshot QR untuk mencegah penipuan
- **Access Control**: Role-based access control untuk Super Admin, Finance, dan Gate Staff
- **Mobile-Friendly**: User experience yang optimal untuk pembeli menggunakan mobile device

---

## Product Overview

### Vision

Menjadi platform ticketing terdepan untuk konser internasional yang memungkinkan panitia mengelola penjualan tiket dan check-in dengan efisien, aman, dan user-friendly.

### Mission

Menyediakan solusi ticketing yang komprehensif, mudah digunakan, dan mobile-first untuk membantu panitia konser mengoptimalkan penjualan tiket dan pengalaman check-in.

### Product Goals

1. **Efficient Ticket Management**: Mempermudah panitia dalam mengelola penjualan tiket dengan berbagai tier
2. **Secure Check-in Process**: Memastikan validasi tiket yang aman dan anti-fraud
3. **Real-time Visibility**: Memberikan visibility real-time kepada panitia tentang penjualan dan check-in
4. **Mobile-First Experience**: User experience yang optimal untuk pembeli dan panitia menggunakan mobile device
5. **Scalability**: Mendukung event dengan kapasitas besar (10,000+ tiket)

---

## Target Users

### Primary Users

1. **Buyer / Pembeli Tiket**
   - Membeli tiket konser online
   - Menerima E-Ticket via email
   - Menampilkan E-Ticket dengan QR code untuk check-in
   - Melihat order history
   - Menggunakan mobile device untuk pembelian

2. **Gate Staff / Panitia Check-in**
   - Scan QR code tiket menggunakan mobile-web scanner
   - Validasi tiket dan check-in tamu
   - Melihat status check-in real-time
   - Menggunakan mobile device di lapangan

3. **Super Admin**
   - Mengelola event dan ticket tiers
   - Monitoring penjualan dan analytics
   - Mengelola users dan access control
   - Export buyer list
   - Konfigurasi sistem

4. **Finance Staff**
   - Monitoring penjualan dan revenue
   - Export data untuk laporan keuangan
   - Melihat analytics penjualan

### Secondary Users

1. **Viewer / Read-Only User**
   - Melihat data dan laporan (tanpa edit)
   - Export data untuk analisis

---

## Business Objectives

### Short-term (MVP - 60 hari)

1. **Core Functionality**: Implementasi fitur-fitur inti untuk ticketing dan check-in
2. **Event Support**: Support 1 konser internasional dengan multiple ticket tiers
3. **System Uptime**: Uptime > 99%
4. **Mobile-Friendly**: User experience optimal untuk mobile device
5. **Security**: Sistem anti-fraud dan validasi QR code yang aman

### Medium-term (3-6 bulan)

1. **Payment Integration**: Integrasi dengan Midtrans untuk payment processing
2. **Feature Enhancement**: Penambahan fitur refund, transfer ownership, offline scan buffer
3. **Advanced Analytics**: Advanced analytics dan reporting
4. **Multi-Event Support**: Support untuk multiple events (jika diperlukan)

### Long-term (6+ bulan)

1. **Market Expansion**: Ekspansi ke berbagai jenis event (festival, seminar, dll)
2. **Advanced Features**: Seat numbering, section mapping, advanced fraud detection
3. **Integration**: Integrasi dengan sistem eksternal (marketing, CRM)
4. **AI/ML Integration**: Implementasi AI untuk fraud detection dan recommendation

---

## Functional Requirements

### 1. Authentication & Authorization

#### 1.1 User Authentication
- **FR-1.1.1**: Sistem harus mendukung login dengan email dan password
- **FR-1.1.2**: Sistem harus mendukung password reset via email
- **FR-1.1.3**: Sistem harus mendukung session management dengan token-based authentication (JWT)
- **FR-1.1.4**: Sistem harus mendukung remember me functionality
- **FR-1.1.5**: Buyer tidak perlu login untuk pembelian (guest checkout)

#### 1.2 Role-Based Access Control (RBAC)
- **FR-1.2.1**: Sistem harus mendukung multiple roles (Super Admin, Finance, Gate Staff)
- **FR-1.2.2**: Sistem harus mendukung permission-based access control
- **FR-1.2.3**: Sistem harus mendukung role assignment per user
- **FR-1.2.4**: Sistem harus mendukung audit log untuk semua akses

### 2. Event & Ticket Tier Management

#### 2.1 Event Management
- **FR-2.1.1**: Sistem harus memungkinkan admin membuat event baru (1 event only untuk MVP)
- **FR-2.1.2**: Sistem harus menyimpan informasi event lengkap (nama, tanggal, lokasi, deskripsi)
- **FR-2.1.3**: Sistem harus mendukung custom ticket design (nama event, seat info, tier)
- **FR-2.1.4**: Sistem harus mendukung event status (draft, published, closed)

#### 2.2 Ticket Tier Management
- **FR-2.2.1**: Sistem harus memungkinkan admin membuat multiple ticket tiers (Presale, Regular, VIP, VVIP, Meet & Greet)
- **FR-2.2.2**: Sistem harus menyimpan informasi ticket tier lengkap (nama, harga, quota, deskripsi)
- **FR-2.2.3**: Sistem harus mendukung real-time quota tracking
- **FR-2.2.4**: Sistem harus mendukung quota decrement otomatis saat pembelian
- **FR-2.2.5**: Sistem harus mendukung seat numbering / section mapping (optional untuk festival area)

### 3. Ticket Purchase Flow

#### 3.1 Ticket Selection
- **FR-3.1.1**: Buyer harus dapat melihat semua available ticket tiers
- **FR-3.1.2**: Buyer harus dapat select ticket tier dan quantity
- **FR-3.1.3**: Sistem harus menampilkan real-time quota availability
- **FR-3.1.4**: Sistem harus validasi quota sebelum checkout
- **FR-3.1.5**: UI harus mobile-friendly untuk pembeli

#### 3.2 Order Creation
- **FR-3.2.1**: Buyer harus dapat membuat order dengan informasi lengkap (nama, email, phone)
- **FR-3.2.2**: Sistem harus menyimpan order dengan status (pending, confirmed, cancelled)
- **FR-3.2.3**: Sistem harus decrement quota otomatis saat order dibuat
- **FR-3.2.4**: Sistem harus validasi quota dan availability sebelum order creation
- **FR-3.2.5**: Sistem harus support guest checkout (tanpa login)

#### 3.3 Payment Integration (Future - Tidak termasuk di MVP)
- **FR-3.3.1**: Sistem harus mendukung payment integration dengan Midtrans (Core API/Snap)
- **FR-3.3.2**: Sistem harus mendukung multiple payment methods
- **FR-3.3.3**: Sistem harus mendukung failed payment detection dan auto restore quota

### 4. E-Ticket Generation & QR Code

#### 4.1 E-Ticket Generation
- **FR-4.1.1**: Sistem harus generate unique E-Ticket per buyer setelah order confirmed
- **FR-4.1.2**: Sistem harus generate unique ticket ID (UUID + hash)
- **FR-4.1.3**: Sistem harus menyimpan informasi ticket (nama pembeli, tipe tiket, ID transaksi)
- **FR-4.1.4**: Sistem harus support custom ticket design (nama event, seat info, tier)

#### 4.2 QR Code Generation
- **FR-4.2.1**: Sistem harus generate QR code unik per ticket
- **FR-4.2.2**: QR code harus mengandung ticket ID dan validation data
- **FR-4.2.3**: QR code harus dapat di-scan menggunakan mobile-web scanner
- **FR-4.2.4**: QR code harus dapat di-download sebagai image/PDF

#### 4.3 E-Ticket Display
- **FR-4.3.1**: Buyer harus dapat melihat E-Ticket dengan QR code
- **FR-4.3.2**: E-Ticket harus menampilkan informasi lengkap (nama pembeli, tipe tiket, QR code, ID transaksi)
- **FR-4.3.3**: E-Ticket harus dapat di-download sebagai PDF/image
- **FR-4.3.4**: E-Ticket harus mobile-friendly untuk ditampilkan di mobile device

### 5. Email Service

#### 5.1 Email Confirmation
- **FR-5.1.1**: Sistem harus mengirim email confirmation setelah order dibuat
- **FR-5.1.2**: Email confirmation harus berisi informasi order lengkap
- **FR-5.1.3**: Sistem harus support email template untuk confirmation

#### 5.2 E-Ticket Delivery
- **FR-5.2.1**: Sistem harus mengirim E-Ticket via email setelah order confirmed
- **FR-5.2.2**: Email E-Ticket harus berisi attachment PDF atau link untuk download
- **FR-5.2.3**: Sistem harus support resend ticket functionality
- **FR-5.2.4**: Sistem harus support email template untuk E-Ticket delivery

### 6. Check-in Scanner System

#### 6.1 Mobile-Web Scanner
- **FR-6.1.1**: Gate staff harus dapat scan QR code menggunakan mobile-web scanner
- **FR-6.1.2**: Scanner harus menggunakan web camera API (tidak perlu aplikasi native)
- **FR-6.1.3**: Scanner harus mobile-friendly dan mudah digunakan di lapangan
- **FR-6.1.4**: Scanner harus support camera permission handling

#### 6.2 QR Code Validation
- **FR-6.2.1**: Sistem harus validasi QR code saat di-scan
- **FR-6.2.2**: Sistem harus check ticket status (active, used, cancelled)
- **FR-6.2.3**: Sistem harus implement one-scan validation (QR hanya bisa dipakai 1 kali)
- **FR-6.2.4**: Sistem harus detect duplicate scan (anti-fraud)
- **FR-6.2.5**: Sistem harus detect screenshot QR (basic detection)

#### 6.3 Check-in Process
- **FR-6.3.1**: Sistem harus mark ticket sebagai "checked-in" setelah valid scan
- **FR-6.3.2**: Sistem harus record check-in timestamp dan location
- **FR-6.3.3**: Sistem harus support gate assignment (Gate A/B/C scanning separation)
- **FR-6.3.4**: Sistem harus support VIP priority entry system
- **FR-6.3.5**: Sistem harus implement rate limiting untuk check-in endpoint

### 7. Real-time Check-in Status

#### 7.1 Check-in Dashboard
- **FR-7.1.1**: Sistem harus menampilkan real-time check-in status dashboard
- **FR-7.1.2**: Dashboard harus menampilkan check-in statistics (total, by gate, by tier)
- **FR-7.1.3**: Dashboard harus menampilkan real-time check-in feed
- **FR-7.1.4**: Dashboard harus support auto-refresh (polling atau WebSocket)

#### 7.2 Check-in Analytics
- **FR-7.2.1**: Sistem harus menampilkan check-in by gate
- **FR-7.2.2**: Sistem harus menampilkan check-in by ticket tier
- **FR-7.2.3**: Sistem harus menampilkan check-in timeline
- **FR-7.2.4**: Sistem harus support date range filtering

### 8. Admin Dashboard & Monitoring

#### 8.1 Sales Monitoring
- **FR-8.1.1**: Sistem harus menampilkan sales overview (total revenue, total tickets sold)
- **FR-8.1.2**: Sistem harus menampilkan ticket tier sales breakdown
- **FR-8.1.3**: Sistem harus menampilkan peak hours analytics (jam pembelian tersibuk)
- **FR-8.1.4**: Sistem harus menampilkan sales trend

#### 8.2 Check-in Monitoring
- **FR-8.2.1**: Sistem harus menampilkan check-in overview (total checked-in, by gate, by tier)
- **FR-8.2.2**: Sistem harus menampilkan gate activity
- **FR-8.2.3**: Sistem harus menampilkan real-time check-in feed

#### 8.3 Buyer Management
- **FR-8.3.1**: Sistem harus menampilkan buyer list
- **FR-8.3.2**: Sistem harus support buyer search dan filter
- **FR-8.3.3**: Sistem harus support export buyer list ke CSV/Excel
- **FR-8.3.4**: Sistem harus menampilkan order history per buyer

### 9. Gate Assignment & Management

#### 9.1 Gate Management
- **FR-9.1.1**: Sistem harus memungkinkan admin mengelola gates (Gate A, Gate B, Gate C)
- **FR-9.1.2**: Sistem harus support gate assignment untuk tickets
- **FR-9.1.3**: Sistem harus support gate separation logic (scan hanya valid di gate yang ditentukan)
- **FR-9.1.4**: Sistem harus menampilkan gate activity dan statistics

#### 9.2 VIP Priority Entry
- **FR-9.2.1**: Sistem harus support VIP priority entry system
- **FR-9.2.2**: Sistem harus menampilkan VIP indicator di scanner
- **FR-9.2.3**: Sistem harus support separate gate untuk VIP (optional)

### 10. Order History & Resend Ticket

#### 10.1 Order History
- **FR-10.1.1**: Buyer harus dapat melihat order history
- **FR-10.1.2**: Sistem harus menampilkan order detail dengan ticket information
- **FR-10.1.3**: Sistem harus support order search dan filter

#### 10.2 Resend Ticket
- **FR-10.2.1**: Buyer harus dapat request resend ticket
- **FR-10.2.2**: Admin harus dapat resend ticket untuk buyer
- **FR-10.2.3**: Sistem harus mengirim email dengan E-Ticket saat resend

---

## Non-Functional Requirements

### 1. Performance
- **NFR-1.1**: Sistem harus dapat menangani minimal 1,000 concurrent users
- **NFR-1.2**: Response time untuk ticket purchase < 2 seconds
- **NFR-1.3**: Response time untuk QR code validation < 500ms
- **NFR-1.4**: Response time untuk check-in < 1 second
- **NFR-1.5**: Sistem harus mendukung pagination untuk semua list views

### 2. Security
- **NFR-2.1**: Semua data harus dienkripsi dalam transit (HTTPS)
- **NFR-2.2**: QR code harus menggunakan secure hash untuk validasi
- **NFR-2.3**: Sistem harus implement anti-fraud protection (duplicate detection, screenshot detection)
- **NFR-2.4**: Sistem harus mendukung audit logging untuk semua actions
- **NFR-2.5**: Sistem harus implement rate limiting untuk check-in endpoint

### 3. Availability
- **NFR-3.1**: Sistem harus memiliki uptime > 99% selama event
- **NFR-3.2**: Sistem harus mendukung graceful degradation saat high traffic
- **NFR-3.3**: Sistem harus memiliki disaster recovery plan

### 4. Scalability
- **NFR-4.1**: Sistem harus dapat handle minimal 10,000 tickets per event
- **NFR-4.2**: Database harus dapat handle high concurrent check-in requests
- **NFR-4.3**: Sistem harus dapat scale horizontal jika diperlukan

### 5. Usability
- **NFR-5.1**: UI harus responsive (mobile, tablet, desktop)
- **NFR-5.2**: Mobile-web scanner harus mudah digunakan di lapangan
- **NFR-5.3**: Sistem harus memiliki intuitive navigation
- **NFR-5.4**: Error messages harus user-friendly dan jelas

### 6. Compatibility
- **NFR-6.1**: Sistem harus support modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-6.2**: Sistem harus support mobile browsers (iOS Safari, Chrome Mobile)
- **NFR-6.3**: Web camera API harus support di mobile browsers

---

## User Stories

### Epic 1: Ticket Purchase

**US-1.1**: Sebagai buyer, saya ingin dapat melihat semua available ticket tiers agar dapat memilih tiket yang sesuai.

**US-1.2**: Sebagai buyer, saya ingin dapat membeli tiket dengan mudah menggunakan mobile device agar dapat melakukan pembelian kapan saja dan di mana saja.

**US-1.3**: Sebagai buyer, saya ingin menerima E-Ticket via email dengan QR code agar dapat digunakan untuk check-in.

**US-1.4**: Sebagai buyer, saya ingin dapat melihat order history agar dapat melacak pembelian saya.

### Epic 2: Check-in Process

**US-2.1**: Sebagai gate staff, saya ingin dapat scan QR code tiket menggunakan mobile-web scanner agar dapat validasi tiket dengan cepat.

**US-2.2**: Sebagai gate staff, saya ingin melihat status validasi tiket (valid, already used, invalid) agar dapat memberikan feedback ke tamu.

**US-2.3**: Sebagai gate staff, saya ingin melihat real-time check-in status agar dapat memantau jumlah tamu yang sudah masuk.

**US-2.4**: Sebagai gate staff, saya ingin sistem mencegah duplicate scan agar tidak ada tiket yang digunakan dua kali.

### Epic 3: Admin Management

**US-3.1**: Sebagai super admin, saya ingin dapat mengelola event dan ticket tiers agar dapat setup event dengan benar.

**US-3.2**: Sebagai super admin, saya ingin dapat monitoring penjualan dan analytics agar dapat melihat performance event.

**US-3.3**: Sebagai super admin, saya ingin dapat export buyer list ke CSV/Excel agar dapat melakukan analisis lebih lanjut.

**US-3.4**: Sebagai super admin, saya ingin dapat mengelola gates dan gate assignment agar dapat mengatur check-in dengan efisien.

### Epic 4: Real-time Monitoring

**US-4.1**: Sebagai admin, saya ingin melihat real-time check-in status agar dapat memantau jumlah tamu yang sudah masuk.

**US-4.2**: Sebagai admin, saya ingin melihat analytics penjualan (peak hours, tier paling laku, total revenue) agar dapat memahami pola pembelian.

**US-4.3**: Sebagai admin, saya ingin melihat gate activity agar dapat memantau distribusi check-in per gate.

---

## Technical Requirements

### Technology Stack

#### Web Frontend
- **Framework**: Next.js 16 (App Router, Server Components)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **UI Components**: shadcn/ui v4
- **QR Code Library**: qrcode.js atau similar
- **Charts**: Recharts atau similar

#### Backend
- **Language**: Go
- **Framework**: Gin
- **Database**: PostgreSQL
- **ORM**: GORM
- **QR Code Generation**: go-qrcode atau similar
- **Email Service**: SMTP (basic) atau service sederhana

#### Infrastructure
- **Hosting**: Cloud (AWS/GCP/Azure) atau On-Premise
- **Containerization**: Docker
- **CI/CD**: GitHub Actions (optional)

### API Standards
- Mengikuti API Response Standards yang sudah didefinisikan
- RESTful API design
- API versioning (v1, v2, dll)
- Bilingual error messages (ID & EN)

### Database Design
- Normalized database schema
- Soft delete untuk data penting
- Audit trails untuk compliance
- Indexing untuk performance (terutama untuk QR code validation)

### Security
- JWT-based authentication
- Role-based access control (RBAC)
- Data encryption (at rest & in transit)
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting untuk check-in endpoint

---

## Success Metrics

### User Adoption
- **Target**: 1 event dengan 5,000+ tickets sold dalam 60 hari
- **Metric**: Number of orders, number of tickets sold, number of check-ins

### System Performance
- **Target**: 99% uptime selama event
- **Metric**: System availability, response time, error rate

### User Satisfaction
- **Target**: NPS > 50
- **Metric**: User surveys, feedback, support tickets

### Business Impact
- **Target**: 100% ticket sales untuk event
- **Metric**: Ticket sales rate, check-in completion rate, fraud prevention rate

---

## Timeline & Milestones

### Phase 1: MVP (60 Hari / ~8.5 Minggu)

#### Week 1-2: Foundation & Core Setup
- Authentication & Authorization
- Event & Ticket Tier Management
- User Management & Access Control

#### Week 3-4: Purchase & Check-in
- Ticket Purchase Flow (Basic)
- E-Ticket Generation & QR Code
- Check-in Scanner (Mobile-Web)
- Real-time Check-in Status

#### Week 5-6: Management & Analytics
- Email Service & Order History
- Gate Assignment & Management
- Admin Dashboard Monitoring
- Analytics Dashboard

#### Week 7-8: Integration & Testing
- Integration Testing
- Performance Testing
- Security Testing
- Final Delivery

### Phase 2: Enhancement (Months 3-4)
- Payment Integration (Midtrans)
- Refund Request Handling
- Ticket Transfer Ownership
- Offline Scan Buffer
- Failed Payment Detection

### Phase 3: Advanced Features (Months 5-6)
- Seat Numbering / Section Mapping
- Advanced Analytics
- Multi-Event Support
- Advanced Fraud Detection

---

## Risks & Mitigation

### Technical Risks

**Risk 1**: Performance issues dengan high concurrent check-in requests
- **Mitigation**: Implement proper indexing, caching, rate limiting, dan load testing

**Risk 2**: QR code validation latency saat high traffic
- **Mitigation**: Optimize database queries, implement caching, dan use connection pooling

**Risk 3**: Mobile-web camera API compatibility issues
- **Mitigation**: Test di berbagai mobile browsers, provide fallback options

**Risk 4**: Security vulnerabilities (QR code fraud, duplicate scan)
- **Mitigation**: Implement secure hash, duplicate detection, rate limiting, dan security audits

### Business Risks

**Risk 1**: Low ticket sales
- **Mitigation**: Marketing support, user-friendly purchase flow, mobile-optimized UI

**Risk 2**: Check-in bottleneck saat event
- **Mitigation**: Multiple gates, efficient scanner, real-time monitoring, staff training

**Risk 3**: System downtime saat event
- **Mitigation**: High availability architecture, monitoring, alerting, disaster recovery plan

### Operational Risks

**Risk 1**: Data loss
- **Mitigation**: Regular backups, disaster recovery plan, data redundancy

**Risk 2**: Email delivery issues
- **Mitigation**: Reliable email service, retry mechanism, manual resend functionality

---

## Appendix

### Glossary

- **Ticket Tier**: Kategori tiket (Presale, Regular, VIP, VVIP, Meet & Greet)
- **E-Ticket**: Electronic ticket yang dikirim via email dengan QR code
- **QR Code**: Quick Response code untuk validasi check-in
- **Check-in**: Proses validasi tiket dan entry tamu ke venue
- **Gate**: Pintu masuk dengan scanner terpisah (Gate A, Gate B, Gate C)
- **Quota**: Jumlah tiket yang tersedia untuk setiap tier
- **Order**: Transaksi pembelian tiket oleh buyer

### References

- API Response Standards: `/docs/api-standart/api-response-standards.md`
- API Error Codes: `/docs/api-standart/api-error-codes.md`
- Sprint Planning: `/docs/SPRINT_PLANNING.md`

---

**Dokumen ini akan diupdate sesuai dengan perkembangan development dan feedback dari stakeholders.**

