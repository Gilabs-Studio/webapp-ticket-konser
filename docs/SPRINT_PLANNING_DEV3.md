# Sprint Planning - Developer 3 (Mobile App Developer)

## Ticketing Konser Internasional Platform - Mobile App

**Developer**: Mobile App Developer (Flutter/React Native)  
**Role**: Develop mobile app untuk Staff Gate (QR Scanner & Check-in)  
**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-XX

> **📋 Lihat [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) untuk status implementasi aktual**

---

## 📋 Overview

Developer 3 bertanggung jawab untuk:

- **Mobile App Development**: Develop mobile app untuk Staff Gate
- **Platform**: Flutter (recommended) atau React Native
- **Focus**: QR Code Scanner, Check-in Process, Check-in History
- **Target Users**: Staff Gate (Gate Staff)
- **API Integration**: Integrate dengan Backend APIs dari Dev1

**Modul yang ditugaskan ke Dev3**:

1. ✅ Mobile App Authentication (Login/Logout)
2. ✅ QR Code Scanner (Camera-based)
3. ✅ Check-in Validation & Processing
4. ✅ Check-in History
5. ✅ Profile/User Info
6. ⏳ Offline Support (Optional untuk MVP)

**Development Strategy**:

- ✅ **Mobile-First**: Optimized untuk mobile device (Android & iOS)
- ✅ **Camera-Based Scanner**: Menggunakan native camera untuk scan QR
- ✅ **Real-time Sync**: Real-time sync dengan backend
- ✅ **Offline Support**: Optional untuk MVP (bisa ditambahkan nanti)
- ✅ **Hackathon mode** - tidak ada unit test intensif
- ✅ Manual testing saja

---

## 🎯 Sprint Details

### Sprint 0: Foundation & Setup (Week 1)

**Goal**: Setup mobile app project structure dan authentication

**Status**: ⏳ **PENDING**

**Tasks**:

- [ ] Setup Flutter/React Native project
- [ ] Setup project structure (features, services, models, utils)
- [ ] Setup API client (HTTP client dengan interceptors)
- [ ] Setup state management (Provider/Bloc/Redux)
- [ ] Setup navigation (React Navigation/Flutter Navigation)
- [ ] Setup authentication flow (Login/Logout)
- [ ] Setup secure storage untuk tokens
- [ ] Setup error handling
- [ ] Setup loading states
- [ ] Review API contract dengan Dev1

**API Dependencies** (dari Dev1):

- [x] Login API (`POST /api/v1/auth/login`) - ✅ Ready
- [x] Logout API (`POST /api/v1/auth/logout`) - ✅ Ready
- [x] Get Current User API (`GET /api/v1/auth/me`) - ✅ Ready
- [ ] Get Gate Info API (`GET /api/v1/mobile/gate-info`) - ⏳ **PENDING** (perlu ditambahkan di Dev1)

**Acceptance Criteria**:

- ✅ Project structure setup
- ✅ Development environment ready
- ✅ Authentication flow bekerja (Login/Logout)
- ✅ Token management bekerja (secure storage)
- ✅ API client terintegrasi dengan backend
- ✅ Error handling comprehensive

**Testing** (Manual testing):

- Test login flow
- Test logout flow
- Test token refresh
- Test error handling

**Estimated Time**: 3-4 days

---

### Sprint 1: QR Code Scanner (Week 2)

**Goal**: Implement QR code scanner dengan camera

**Status**: ⏳ **PENDING**

**Tasks**:

- [ ] Setup camera permissions (Android & iOS)
- [ ] Implement QR code scanner screen
- [ ] Implement camera preview
- [ ] Implement QR code detection (menggunakan library: `qr_code_scanner` untuk Flutter atau `react-native-qrcode-scanner` untuk React Native)
- [ ] Implement scanner UI (fullscreen, overlay, focus indicator)
- [ ] Implement scanner feedback (sound, vibration, visual feedback)
- [ ] Implement error handling untuk camera permission denied
- [ ] Implement scanner pause/resume functionality
- [ ] Optimize untuk low-light conditions
- [ ] Add manual QR code input (fallback jika camera tidak bisa)

**API Dependencies** (dari Dev1):

- [ ] Validate QR Code API (`POST /api/v1/mobile/check-in/validate`) - ⏳ **PENDING** (perlu ditambahkan di Dev1)
- [ ] Check-in API (`POST /api/v1/mobile/check-in`) - ⏳ **PENDING** (perlu ditambahkan di Dev1)

**Acceptance Criteria**:

- ✅ Camera permission handling bekerja
- ✅ QR code scanner bekerja dengan baik
- ✅ Scanner UI mobile-friendly dan mudah digunakan
- ✅ Scanner feedback bekerja (sound, vibration, visual)
- ✅ Error handling comprehensive
- ✅ Manual QR input bekerja (fallback)

**Testing** (Manual testing):

- Test camera permission handling
- Test QR code scanning
- Test scanner feedback
- Test error handling
- Test manual QR input

**Estimated Time**: 4-5 days

---

### Sprint 2: Check-in Validation & Processing (Week 3)

**Goal**: Implement check-in validation dan processing

**Status**: ⏳ **PENDING**

**Tasks**:

- [ ] Implement QR code validation flow
- [ ] Implement check-in API integration
- [ ] Implement check-in result screen (Success/Error)
- [ ] Implement check-in result display:
  - Success: Ticket info, buyer name, ticket tier, check-in time
  - Error: Error message (Invalid QR, Already Used, Wrong Gate, Expired, etc.)
- [ ] Implement check-in status indicators (color-coded)
- [ ] Implement auto-return to scanner setelah check-in
- [ ] Implement check-in sound feedback (success/error)
- [ ] Implement check-in vibration feedback
- [ ] Implement duplicate scan detection (client-side + server-side)
- [ ] Implement gate validation (check gate assignment)
- [ ] Implement VIP priority indicator
- [ ] Add check-in statistics (total checked-in today)

**API Dependencies** (dari Dev1):

- [ ] Validate QR Code API (`POST /api/v1/mobile/check-in/validate`) - ⏳ **PENDING**
- [ ] Check-in API (`POST /api/v1/mobile/check-in`) - ⏳ **PENDING**
- [ ] Get Check-in Statistics API (`GET /api/v1/mobile/check-in/statistics`) - ⏳ **PENDING** (perlu ditambahkan di Dev1)

**Acceptance Criteria**:

- ✅ QR code validation bekerja dengan baik
- ✅ Check-in processing bekerja
- ✅ Check-in result display bekerja (success/error)
- ✅ Error handling comprehensive (Invalid QR, Already Used, Wrong Gate, Expired)
- ✅ Gate validation bekerja
- ✅ VIP priority indicator bekerja
- ✅ Check-in statistics ditampilkan
- ✅ Auto-return to scanner bekerja

**Testing** (Manual testing):

- Test QR code validation
- Test check-in processing
- Test check-in result display
- Test error handling (Invalid QR, Already Used, Wrong Gate, Expired)
- Test gate validation
- Test VIP priority
- Test check-in statistics

**Estimated Time**: 4-5 days

---

### Sprint 3: Check-in History (Week 4)

**Goal**: Implement check-in history screen

**Status**: ⏳ **PENDING**

**Tasks**:

- [ ] Implement check-in history screen
- [ ] Implement check-in history list (with pagination)
- [ ] Implement check-in history item display:
  - Ticket info (buyer name, ticket tier, order code)
  - Check-in time
  - Gate info
  - Status (Success/Error)
- [ ] Implement check-in history filter:
  - By date (today, yesterday, custom date range)
  - By status (success, error)
  - By gate
  - By ticket tier
- [ ] Implement check-in history search (by buyer name, order code, ticket ID)
- [ ] Implement check-in history detail screen
- [ ] Implement pull-to-refresh
- [ ] Implement infinite scroll (pagination)
- [ ] Add export functionality (CSV/Excel) - optional untuk MVP
- [ ] Add statistics summary (total checked-in, success rate, error rate)

**API Dependencies** (dari Dev1):

- [ ] Get Check-in History API (`GET /api/v1/mobile/check-in/history`) - ⏳ **PENDING** (perlu ditambahkan di Dev1)
- [ ] Get Check-in Detail API (`GET /api/v1/mobile/check-in/:id`) - ⏳ **PENDING** (perlu ditambahkan di Dev1)

**Acceptance Criteria**:

- ✅ Check-in history list bekerja dengan baik
- ✅ Check-in history filter bekerja (by date, status, gate, tier)
- ✅ Check-in history search bekerja
- ✅ Check-in history detail screen bekerja
- ✅ Pull-to-refresh bekerja
- ✅ Infinite scroll bekerja (pagination)
- ✅ Statistics summary ditampilkan

**Testing** (Manual testing):

- Test check-in history list
- Test filter functionality
- Test search functionality
- Test pull-to-refresh
- Test infinite scroll
- Test statistics summary

**Estimated Time**: 3-4 days

---

### Sprint 4: Profile & Settings (Week 5)

**Goal**: Implement profile dan settings screen

**Status**: ⏳ **PENDING**

**Tasks**:

- [ ] Implement profile screen
- [ ] Implement user info display (name, email, role, gate assignment)
- [ ] Implement gate info display (gate name, gate location)
- [ ] Implement settings screen
- [ ] Implement logout functionality
- [ ] Implement change password (optional untuk MVP)
- [ ] Implement app version display
- [ ] Implement about screen
- [ ] Implement help/FAQ screen (optional untuk MVP)
- [ ] Add app icon dan splash screen
- [ ] Add app metadata (name, description, version)

**API Dependencies** (dari Dev1):

- [x] Get Current User API (`GET /api/v1/auth/me`) - ✅ Ready
- [ ] Get Gate Info API (`GET /api/v1/mobile/gate-info`) - ⏳ **PENDING**

**Acceptance Criteria**:

- ✅ Profile screen bekerja
- ✅ User info ditampilkan dengan benar
- ✅ Gate info ditampilkan dengan benar
- ✅ Settings screen bekerja
- ✅ Logout functionality bekerja
- ✅ App icon dan splash screen ada

**Testing** (Manual testing):

- Test profile screen
- Test settings screen
- Test logout functionality

**Estimated Time**: 2-3 days

---

### Sprint 5: Polish & Testing (Week 6)

**Goal**: Polish UI/UX dan final testing

**Status**: ⏳ **PENDING**

**Tasks**:

- [ ] UI/UX polish (animations, transitions, loading states)
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Memory leak fixes
- [ ] Battery optimization (camera usage)
- [ ] Network error handling (offline detection)
- [ ] App icon dan splash screen finalization
- [ ] App store preparation (screenshots, description, metadata)
- [ ] End-to-end testing
- [ ] Device testing (various Android & iOS versions)
- [ ] Camera testing (various devices)
- [ ] Performance testing
- [ ] Security testing

**Acceptance Criteria**:

- ✅ UI/UX polished dan intuitive
- ✅ Performance optimal
- ✅ Error handling comprehensive
- ✅ App ready untuk production
- ✅ All tests passed

**Testing**:

- End-to-end testing
- Device testing
- Performance testing
- Security testing

**Estimated Time**: 3-4 days

---

## 📊 Sprint Summary

| Sprint   | Goal                          | Duration | Status       | Notes            |
| -------- | ----------------------------- | -------- | ------------ | ---------------- |
| Sprint 0 | Foundation & Setup            | 3-4 days | ⏳ Pending   | -                |
| Sprint 1 | QR Code Scanner               | 4-5 days | ⏳ Pending   | -                |
| Sprint 2 | Check-in Validation & Processing | 4-5 days | ⏳ Pending   | -                |
| Sprint 3 | Check-in History              | 3-4 days | ⏳ Pending   | -                |
| Sprint 4 | Profile & Settings            | 2-3 days | ⏳ Pending   | -                |
| Sprint 5 | Polish & Testing             | 3-4 days | ⏳ Pending   | -                |

**Total Estimated Time**: 19-25 days (2.7-3.6 weeks)

---

## 🔗 Coordination dengan Dev1

### API Requirements untuk Mobile App

**Authentication APIs** (✅ Ready dari Dev1):
- [x] `POST /api/v1/auth/login` - Login
- [x] `POST /api/v1/auth/logout` - Logout
- [x] `GET /api/v1/auth/me` - Get Current User

**Mobile-Specific APIs** (⏳ Perlu ditambahkan di Dev1):

1. **Gate Info API**:
   - `GET /api/v1/mobile/gate-info` - Get gate info untuk current user (staff gate)

2. **Check-in APIs**:
   - `POST /api/v1/mobile/check-in/validate` - Validate QR code sebelum check-in
   - `POST /api/v1/mobile/check-in` - Process check-in
   - `GET /api/v1/mobile/check-in/statistics` - Get check-in statistics (today)
   - `GET /api/v1/mobile/check-in/history` - Get check-in history (with filters)
   - `GET /api/v1/mobile/check-in/:id` - Get check-in detail

### Integration Points:

- [ ] Authentication APIs (Dev1) → Mobile App (Dev3)
- [ ] Check-in APIs (Dev1) → Mobile App (Dev3)
- [ ] Gate Info API (Dev1) → Mobile App (Dev3)
- [ ] E-Ticket Data (Dev1) → Check-in Validation (Dev3)

### Coordination:

- [ ] Week 1: Coordinate API contract untuk mobile endpoints
- [ ] Week 2: Coordinate QR code format dan validation logic
- [ ] Week 3: Coordinate check-in flow dan error handling
- [ ] Week 4: Coordinate check-in history format
- [ ] Week 5: Pre-release review
- [ ] Week 6: Final integration testing

---

## 📝 Notes

1. **Mobile-First**: App harus optimized untuk mobile device (Android & iOS)
2. **Camera-Based Scanner**: Menggunakan native camera untuk scan QR code
3. **Real-time Sync**: Real-time sync dengan backend (no offline support untuk MVP)
4. **Hackathon Mode**: Tidak ada unit test intensif, manual testing saja
5. **Code Review**: Lakukan code review sebelum merge
6. **Documentation**: Update documentation setelah setiap sprint
7. **API Integration**: Coordinate dengan Dev1 untuk API contract
8. **Offline Support**: Optional untuk MVP, bisa ditambahkan nanti
9. **Battery Optimization**: Optimize camera usage untuk battery life
10. **Network Error Handling**: Handle network errors gracefully

---

**Dokumen ini akan diupdate sesuai dengan progress development.**

