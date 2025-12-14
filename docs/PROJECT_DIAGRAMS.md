# Project Diagrams - Ticketing Konser
## Ticketing Konser Internasional Platform

**Versi**: 1.0  
**Last Updated**: 2025-01-XX  
**Purpose**: Visualisasi scope, fitur, dan user flow untuk Developer 1 dan Developer 2

---

## 📋 Daftar Isi

1. [Project Scope Overview](#project-scope-overview)
2. [Feature Modules Diagram](#feature-modules-diagram)
3. [User Flow Diagrams](#user-flow-diagrams)
4. [Input/Output Diagrams](#inputoutput-diagrams)
5. [System Architecture Diagram](#system-architecture-diagram)

---

## Project Scope Overview

### Platform & Technology Stack

```mermaid
graph TB
    subgraph "Platform"
        WEB[Web Application<br/>Next.js 16]
        BACKEND[Backend API<br/>Go + Gin]
        DB[(PostgreSQL<br/>Database)]
    end
    
    subgraph "Users"
        BUYER[Buyer / Pembeli]
        GATE_STAFF[Gate Staff]
        ADMIN[Super Admin]
        FINANCE[Finance Staff]
    end
    
    BUYER --> WEB
    GATE_STAFF --> WEB
    ADMIN --> WEB
    FINANCE --> WEB
    
    WEB --> BACKEND
    BACKEND --> DB
    
    style WEB fill:#3b82f6
    style BACKEND fill:#f59e0b
    style DB fill:#8b5cf6
```

### Core Modules Overview

```mermaid
graph LR
    subgraph "Core Modules"
        AUTH[Authentication<br/>& Authorization]
        USER[User Management]
        EVENT[Event Management]
    end
    
    subgraph "Ticketing Modules"
        TIER[Ticket Tier<br/>Management]
        PURCHASE[Ticket Purchase<br/>Flow]
        ETICKET[E-Ticket Generation<br/>& QR Code]
        EMAIL[Email Service]
    end
    
    subgraph "Check-in Modules"
        SCANNER[Check-in Scanner<br/>Mobile-Web]
        CHECKIN[Check-in<br/>Management]
        GATE[Gate Assignment<br/>& Management]
    end
    
    subgraph "Analytics & Management"
        DASHBOARD[Admin Dashboard]
        ANALYTICS[Analytics<br/>& Reports]
        TICKETS[Ticket Management]
        MERCHANDISE[Merchandise<br/>Management]
        SETTINGS[Settings<br/>Management]
        ATTENDANCE[Attendance<br/>Management]
    end
    
    AUTH --> TIER
    AUTH --> PURCHASE
    AUTH --> SCANNER
    AUTH --> DASHBOARD
    EVENT --> TIER
    TIER --> PURCHASE
    PURCHASE --> ETICKET
    ETICKET --> EMAIL
    ETICKET --> SCANNER
    SCANNER --> CHECKIN
    CHECKIN --> GATE
    PURCHASE --> DASHBOARD
    CHECKIN --> DASHBOARD
    DASHBOARD --> ANALYTICS
    PURCHASE --> TICKETS
    EVENT --> MERCHANDISE
    DASHBOARD --> SETTINGS
    CHECKIN --> ATTENDANCE
    TICKETS --> ATTENDANCE
    
    style AUTH fill:#ef4444
    style TIER fill:#3b82f6
    style PURCHASE fill:#10b981
    style ETICKET fill:#f59e0b
    style SCANNER fill:#8b5cf6
    style DASHBOARD fill:#ec4899
    style TICKETS fill:#06b6d4
    style MERCHANDISE fill:#84cc16
    style SETTINGS fill:#f97316
    style ATTENDANCE fill:#a855f7
```

---

## Feature Modules Diagram

### Module Features & Capabilities

```mermaid
mindmap
  root((Ticketing System<br/>Features))
    Authentication
      Login/Logout
      Token Management
      Role-Based Access
    Event Management
      Create Event
      Event Details
      Custom Ticket Design
    Ticket Tier Management
      Multiple Tiers
      Quota Tracking
      Real-time Availability
    Ticket Purchase
      Select Tier
      Guest Checkout
      Order Creation
      Quota Decrement
    E-Ticket Generation
      Unique Ticket ID
      QR Code Generation
      Custom Design
      PDF/Image Export
    Email Service
      Order Confirmation
      E-Ticket Delivery
      Resend Ticket
    Check-in Scanner
      Mobile-Web Scanner
      QR Code Validation
      One-Scan Validation
      Anti-Fraud Detection
    Check-in Management
      Real-time Status
      Gate Assignment
      VIP Priority Entry
      Check-in History
    Admin Dashboard
      Sales Monitoring
      Check-in Monitoring
      Gate Activity
      Buyer List
    Ticket Management
      Ticket List
      Ticket Status
      Recent Orders
    Merchandise Management
      Product Inventory
      Product Cards
      Event Limited Items
    Settings Management
      Event Settings
      System Settings
      Danger Zone
    Attendance Management
      Attendee List
      Attendance Tracking
      Statistics
    Analytics
      Sales Overview
      Peak Hours
      Tier Sales
      Revenue Tracking
```

### Feature Matrix by Role

| Feature | Buyer | Gate Staff | Finance | Super Admin | Backend API |
|---------|-------|------------|---------|-------------|-------------|
| **Authentication** | ❌ (Guest) | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Event View** | ✅ View | ✅ View | ✅ View | ✅ Full (CRUD) | ✅ Full |
| **Ticket Purchase** | ✅ Full | ❌ | ❌ | ❌ | ✅ Full |
| **E-Ticket View** | ✅ Own Tickets | ❌ | ❌ | ✅ All Tickets | ✅ Full |
| **Check-in Scanner** | ❌ | ✅ Full | ❌ | ✅ Full | ✅ Full |
| **Check-in Status** | ❌ | ✅ View | ✅ View | ✅ Full | ✅ Full |
| **Gate Management** | ❌ | ❌ | ❌ | ✅ Full | ✅ Full |
| **Sales Monitoring** | ❌ | ❌ | ✅ View | ✅ Full | ✅ Full |
| **Analytics** | ❌ | ❌ | ✅ View | ✅ Full | ✅ Full |
| **Buyer List** | ❌ | ❌ | ✅ Export | ✅ Full | ✅ Full |
| **Ticket Management** | ❌ | ❌ | ✅ View | ✅ Full | ✅ Full |
| **Merchandise Management** | ❌ | ❌ | ❌ | ✅ Full | ✅ Full |
| **Settings Management** | ❌ | ❌ | ❌ | ✅ Full | ✅ Full |
| **Attendance Management** | ❌ | ✅ View | ✅ View | ✅ Full | ✅ Full |
| **User Management** | ❌ | ❌ | ❌ | ✅ Full | ✅ Full |

---

## User Flow Diagrams

### 1. Buyer User Flow (Ticket Purchase)

```mermaid
flowchart TD
    START([Buyer Access Website]) --> VIEW_EVENT[View Event Details]
    VIEW_EVENT --> VIEW_TIERS[View Available Ticket Tiers]
    VIEW_TIERS --> SELECT_TIER[Select Ticket Tier & Quantity]
    SELECT_TIER --> CHECK_QUOTA{Quota<br/>Available?}
    CHECK_QUOTA -->|No| TIER_SOLD_OUT[Tier Sold Out<br/>Select Other Tier]
    TIER_SOLD_OUT --> VIEW_TIERS
    CHECK_QUOTA -->|Yes| FILL_FORM[Fill Buyer Information<br/>- Name<br/>- Email<br/>- Phone]
    FILL_FORM --> REVIEW_ORDER[Review Order Summary]
    REVIEW_ORDER --> CONFIRM_ORDER[Confirm Order]
    CONFIRM_ORDER --> CREATE_ORDER[Create Order<br/>Decrement Quota]
    CREATE_ORDER --> GENERATE_TICKETS[Generate E-Tickets<br/>with QR Code]
    GENERATE_TICKETS --> SEND_EMAIL[Send Confirmation Email<br/>+ E-Ticket]
    SEND_EMAIL --> ORDER_SUCCESS[Order Success Page]
    ORDER_SUCCESS --> VIEW_TICKET[View E-Ticket<br/>with QR Code]
    VIEW_TICKET --> DOWNLOAD[Download E-Ticket<br/>PDF/Image]
    
    style START fill:#10b981
    style SELECT_TIER fill:#3b82f6
    style CREATE_ORDER fill:#f59e0b
    style GENERATE_TICKETS fill:#8b5cf6
    style SEND_EMAIL fill:#ec4899
```

### 2. Gate Staff User Flow (Check-in)

```mermaid
flowchart TD
    START([Gate Staff Login]) --> AUTH{Authenticated?}
    AUTH -->|No| LOGIN[Login Screen]
    LOGIN --> AUTH
    AUTH -->|Yes| SCANNER_MODE[Scanner Mode<br/>Mobile-Web]
    SCANNER_MODE --> CAMERA_PERMISSION{Request Camera<br/>Permission}
    CAMERA_PERMISSION -->|Denied| ERROR[Permission Denied<br/>Show Error]
    ERROR --> SCANNER_MODE
    CAMERA_PERMISSION -->|Granted| SCAN_QR[Scan QR Code<br/>from Ticket]
    SCAN_QR --> VALIDATE_QR[Validate QR Code]
    VALIDATE_QR --> CHECK_STATUS{Ticket<br/>Status?}
    CHECK_STATUS -->|Invalid| INVALID[Ticket Invalid<br/>Show Error]
    INVALID --> SCAN_QR
    CHECK_STATUS -->|Already Used| USED[Ticket Already Used<br/>Show Warning]
    USED --> SCAN_QR
    CHECK_STATUS -->|Active| CHECK_DUPLICATE{Duplicate<br/>Scan?}
    CHECK_DUPLICATE -->|Yes| DUPLICATE[Duplicate Detected<br/>Show Warning]
    DUPLICATE --> SCAN_QR
    CHECK_DUPLICATE -->|No| CHECK_GATE{Gate<br/>Match?}
    CHECK_GATE -->|No| WRONG_GATE[Wrong Gate<br/>Show Error]
    WRONG_GATE --> SCAN_QR
    CHECK_GATE -->|Yes| CHECK_VIP{VIP<br/>Ticket?}
    CHECK_VIP -->|Yes| VIP_PRIORITY[VIP Priority Entry<br/>Fast Track]
    CHECK_VIP -->|No| REGULAR_ENTRY[Regular Entry]
    VIP_PRIORITY --> CHECK_IN[Mark as Checked-in<br/>Record Timestamp]
    REGULAR_ENTRY --> CHECK_IN
    CHECK_IN --> SUCCESS[Check-in Success<br/>Show Confirmation]
    SUCCESS --> UPDATE_STATUS[Update Real-time Status]
    UPDATE_STATUS --> SCAN_QR
    
    style START fill:#10b981
    style SCANNER_MODE fill:#3b82f6
    style SCAN_QR fill:#f59e0b
    style CHECK_IN fill:#8b5cf6
    style SUCCESS fill:#10b981
```

### 3. Super Admin User Flow

```mermaid
flowchart TD
    START([Super Admin Login]) --> AUTH{Authenticated?}
    AUTH -->|No| LOGIN[Login Screen]
    LOGIN --> AUTH
    AUTH -->|Yes| DASHBOARD[Admin Dashboard<br/>- Sales Overview<br/>- Check-in Status<br/>- Analytics]
    
    DASHBOARD --> MANAGE_EVENT[Manage Event]
    DASHBOARD --> MANAGE_TIERS[Manage Ticket Tiers]
    DASHBOARD --> MONITOR_SALES[Monitor Sales]
    DASHBOARD --> MONITOR_CHECKIN[Monitor Check-in]
    DASHBOARD --> MANAGE_GATES[Manage Gates]
    DASHBOARD --> MANAGE_USERS[Manage Users]
    DASHBOARD --> VIEW_ANALYTICS[View Analytics]
    
    MANAGE_EVENT --> EVENT_FORM[Event Form<br/>- Name<br/>- Date<br/>- Location<br/>- Description]
    EVENT_FORM --> SAVE_EVENT[Save Event]
    
    MANAGE_TIERS --> TIER_LIST[Tier List]
    TIER_LIST --> CREATE_TIER[Create Tier<br/>- Name<br/>- Price<br/>- Quota]
    TIER_LIST --> EDIT_TIER[Edit Tier]
    CREATE_TIER --> SAVE_TIER[Save Tier]
    EDIT_TIER --> SAVE_TIER
    
    MONITOR_SALES --> SALES_DASHBOARD[Sales Dashboard<br/>- Total Revenue<br/>- Tickets Sold<br/>- Peak Hours]
    SALES_DASHBOARD --> EXPORT_BUYERS[Export Buyer List<br/>CSV/Excel]
    
    MONITOR_CHECKIN --> CHECKIN_DASHBOARD[Check-in Dashboard<br/>- Total Checked-in<br/>- By Gate<br/>- By Tier]
    CHECKIN_DASHBOARD --> REAL_TIME[Real-time Feed]
    
    MANAGE_GATES --> GATE_LIST[Gate List]
    GATE_LIST --> CREATE_GATE[Create Gate<br/>- Name<br/>- Location]
    GATE_LIST --> ASSIGN_GATE[Assign Gate to Tickets]
    
    VIEW_ANALYTICS --> ANALYTICS_PAGE[Analytics Page<br/>- Sales Trend<br/>- Tier Sales<br/>- Revenue Chart]
    
    style START fill:#10b981
    style DASHBOARD fill:#3b82f6
    style MONITOR_SALES fill:#f59e0b
    style MONITOR_CHECKIN fill:#8b5cf6
    style VIEW_ANALYTICS fill:#ec4899
```

---

## Input/Output Diagrams

### 1. Ticket Purchase Flow

```mermaid
graph LR
    subgraph "Input"
        I1[Buyer Information<br/>- Name<br/>- Email<br/>- Phone]
        I2[Ticket Selection<br/>- Tier ID<br/>- Quantity]
    end
    
    subgraph "Process"
        P1[Validate Quota]
        P2[Create Order]
        P3[Decrement Quota]
        P4[Generate E-Tickets]
        P5[Generate QR Codes]
        P6[Send Email]
    end
    
    subgraph "Output"
        O1[Order Confirmation]
        O2[E-Tickets with QR]
        O3[Email Confirmation]
    end
    
    I1 --> P1
    I2 --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5
    P5 --> P6
    P2 --> O1
    P5 --> O2
    P6 --> O3
    
    style I1 fill:#3b82f6
    style I2 fill:#3b82f6
    style P1 fill:#f59e0b
    style P4 fill:#10b981
    style O2 fill:#8b5cf6
```

### 2. Check-in Flow

```mermaid
graph LR
    subgraph "Input"
        I1[QR Code Scan]
        I2[Gate ID]
        I3[Staff ID]
    end
    
    subgraph "Process"
        P1[Decode QR Code]
        P2[Validate Ticket]
        P3[Check Status]
        P4[Check Duplicate]
        P5[Check Gate]
        P6[Mark Checked-in]
        P7[Record Timestamp]
    end
    
    subgraph "Output"
        O1[Check-in Success]
        O2[Real-time Update]
        O3[Error Message]
    end
    
    I1 --> P1
    I2 --> P5
    I3 --> P7
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5
    P5 --> P6
    P6 --> P7
    P7 --> O1
    P7 --> O2
    P3 --> O3
    P4 --> O3
    P5 --> O3
    
    style I1 fill:#3b82f6
    style P1 fill:#f59e0b
    style P6 fill:#10b981
    style O1 fill:#8b5cf6
```

### 3. Analytics Flow

```mermaid
graph LR
    subgraph "Input"
        I1[Date Range]
        I2[Filter Criteria]
    end
    
    subgraph "Process"
        P1[Query Sales Data]
        P2[Query Check-in Data]
        P3[Aggregate Data]
        P4[Calculate Metrics]
        P5[Generate Charts]
    end
    
    subgraph "Output"
        O1[Sales Overview]
        O2[Check-in Statistics]
        O3[Analytics Charts]
        O4[Export CSV/Excel]
    end
    
    I1 --> P1
    I1 --> P2
    I2 --> P1
    I2 --> P2
    P1 --> P3
    P2 --> P3
    P3 --> P4
    P4 --> P5
    P4 --> O1
    P4 --> O2
    P5 --> O3
    P4 --> O4
    
    style I1 fill:#3b82f6
    style P3 fill:#f59e0b
    style P4 fill:#10b981
    style O3 fill:#8b5cf6
```

---

## System Architecture Diagram

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application<br/>Next.js 16]
    end
    
    subgraph "API Layer"
        API[Backend API<br/>Go + Gin]
        AUTH_MW[Auth Middleware]
        RATE_LIMIT[Rate Limit<br/>Middleware]
    end
    
    subgraph "Service Layer"
        EVENT_SVC[Event Service]
        TICKET_SVC[Ticket Service]
        ORDER_SVC[Order Service]
        CHECKIN_SVC[Check-in Service]
        EMAIL_SVC[Email Service]
        QR_SVC[QR Code Service]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Database)]
        CACHE[(Redis Cache<br/>Optional)]
    end
    
    subgraph "External Services"
        SMTP[SMTP Server<br/>Email]
    end
    
    WEB --> API
    API --> AUTH_MW
    AUTH_MW --> RATE_LIMIT
    RATE_LIMIT --> EVENT_SVC
    RATE_LIMIT --> TICKET_SVC
    RATE_LIMIT --> ORDER_SVC
    RATE_LIMIT --> CHECKIN_SVC
    
    EVENT_SVC --> DB
    TICKET_SVC --> DB
    ORDER_SVC --> DB
    CHECKIN_SVC --> DB
    
    ORDER_SVC --> EMAIL_SVC
    EMAIL_SVC --> SMTP
    
    TICKET_SVC --> QR_SVC
    QR_SVC --> DB
    
    EVENT_SVC --> CACHE
    TICKET_SVC --> CACHE
    
    style WEB fill:#3b82f6
    style API fill:#f59e0b
    style DB fill:#8b5cf6
    style SMTP fill:#10b981
```

### Database Schema Overview

```mermaid
erDiagram
    EVENTS ||--o{ TICKET_TIERS : has
    TICKET_TIERS ||--|| TICKET_QUOTAS : has
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDER_ITEMS ||--|| TICKETS : generates
    TICKETS ||--o| CHECK_INS : checked_in
    GATES ||--o{ GATE_ASSIGNMENTS : has
    TICKETS ||--o| GATE_ASSIGNMENTS : assigned_to
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned_to
    ROLES ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : assigned_to
    
    EVENTS {
        string id PK
        string name
        datetime event_date
        string location
        text description
        string status
    }
    
    TICKET_TIERS {
        string id PK
        string event_id FK
        string name
        decimal price
        int total_quota
        text description
    }
    
    TICKET_QUOTAS {
        string id PK
        string tier_id FK
        int available_quota
        int sold_quota
    }
    
    ORDERS {
        string id PK
        string buyer_name
        string buyer_email
        string buyer_phone
        string status
        datetime created_at
    }
    
    ORDER_ITEMS {
        string id PK
        string order_id FK
        string tier_id FK
        int quantity
        decimal price
    }
    
    TICKETS {
        string id PK
        string order_item_id FK
        string ticket_code
        string qr_code
        string status
        datetime generated_at
    }
    
    CHECK_INS {
        string id PK
        string ticket_id FK
        string gate_id FK
        string staff_id FK
        datetime checked_in_at
        string location
    }
    
    GATES {
        string id PK
        string name
        string location
        string description
    }
    
    GATE_ASSIGNMENTS {
        string id PK
        string gate_id FK
        string ticket_id FK
    }
```

---

## Data Flow Diagrams

### 1. Ticket Purchase Data Flow

```mermaid
sequenceDiagram
    participant B as Buyer
    participant W as Web App
    participant API as Backend API
    participant DB as Database
    participant E as Email Service
    
    B->>W: Select Tier & Quantity
    W->>API: POST /api/v1/orders
    API->>DB: Check Quota
    DB-->>API: Quota Available
    API->>DB: Create Order
    API->>DB: Decrement Quota
    API->>DB: Generate Tickets
    API->>DB: Generate QR Codes
    API->>E: Send Confirmation Email
    API-->>W: Order Created
    W-->>B: Show Success + E-Ticket
    E->>B: Email with E-Ticket
```

### 2. Check-in Data Flow

```mermaid
sequenceDiagram
    participant GS as Gate Staff
    participant W as Web App
    participant API as Backend API
    participant DB as Database
    
    GS->>W: Scan QR Code
    W->>API: POST /api/v1/check-in/validate
    API->>DB: Find Ticket by QR Code
    DB-->>API: Ticket Found
    API->>DB: Check Ticket Status
    DB-->>API: Ticket Active
    API->>DB: Check Duplicate Scan
    DB-->>API: No Duplicate
    API->>DB: Check Gate Assignment
    DB-->>API: Gate Match
    API->>DB: Mark as Checked-in
    API->>DB: Record Check-in
    API-->>W: Check-in Success
    W-->>GS: Show Success Message
    API->>DB: Update Real-time Status
```

---

**Dokumen ini akan diupdate sesuai dengan perkembangan development.**

