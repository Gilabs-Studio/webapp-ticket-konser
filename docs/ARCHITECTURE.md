# Architecture Documentation
## Ticketing Konser Internasional Platform

**Versi**: 1.0  
**Last Updated**: 2025-01-XX

---

## Overview

Dokumen ini menjelaskan arsitektur sistem Ticketing Konser Internasional Platform, termasuk struktur codebase, design patterns, dan best practices.

---

## Arsitektur Backend (Go)

### Layered Architecture

Sistem menggunakan **Layered Architecture** dengan pemisahan yang jelas:

```
┌─────────────────────────────────────┐
│   Handler Layer (HTTP)              │
│   - Request validation              │
│   - Response formatting             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Service Layer (Business Logic)    │
│   - Business rules                  │
│   - Domain logic                    │
│   - Transaction management          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Repository Layer (Data Access)    │
│   - Database operations             │
│   - Data mapping                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Database (PostgreSQL)             │
└─────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Handler Layer (`internal/api/handlers/`)

**Responsibilities:**
- Parse HTTP requests
- Validate request data (using validator)
- Call service layer
- Format responses (using response helpers)
- Handle HTTP-specific concerns

**Example:**
```go
func (h *TicketHandler) CreateOrder(c *gin.Context) {
    var req order.CreateOrderRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        errors.HandleValidationError(c, err)
        return
    }
    
    orderResponse, err := h.orderService.CreateOrder(&req)
    if err != nil {
        errors.ErrorResponse(c, "INSUFFICIENT_QUOTA", nil, nil)
        return
    }
    
    response.SuccessResponse(c, orderResponse, nil)
}
```

#### 2. Service Layer (`internal/service/`)

**Responsibilities:**
- Business logic
- Domain rules validation
- Orchestrate repository calls
- Transaction management
- Error handling
- QR code generation
- Email service integration

**Example:**
```go
func (s *OrderService) CreateOrder(req *order.CreateOrderRequest) (*order.OrderResponse, error) {
    // Business logic: check quota
    tier, err := s.tierRepo.FindByID(req.TierID)
    if err != nil {
        return nil, ErrTierNotFound
    }
    
    if tier.AvailableQuota < req.Quantity {
        return nil, ErrInsufficientQuota
    }
    
    // Create order
    newOrder := &order.Order{
        BuyerName:  req.BuyerName,
        BuyerEmail: req.BuyerEmail,
        BuyerPhone: req.BuyerPhone,
        Status:     "pending",
    }
    
    if err := s.orderRepo.Create(newOrder); err != nil {
        return nil, err
    }
    
    // Decrement quota
    tier.AvailableQuota -= req.Quantity
    if err := s.tierRepo.Update(tier); err != nil {
        return nil, err
    }
    
    return &order.OrderResponse{Order: newOrder}, nil
}
```

#### 3. Repository Layer (`internal/repository/`)

**Responsibilities:**
- Database operations
- Data mapping (DB → Domain)
- Query optimization
- No business logic

**Example:**
```go
func (r *repository) FindByID(id string) (*ticket.Ticket, error) {
    var ticket ticket.Ticket
    err := r.db.Where("id = ?", id).First(&ticket).Error
    if err != nil {
        return nil, err
    }
    return &ticket, nil
}

func (r *repository) FindByQRCode(qrCode string) (*ticket.Ticket, error) {
    var ticket ticket.Ticket
    err := r.db.Where("qr_code = ?", qrCode).First(&ticket).Error
    if err != nil {
        return nil, err
    }
    return &ticket, nil
}
```

### Dependency Injection Pattern

Semua dependencies di-inject melalui constructor:

```go
// Repository
ticketRepo := ticket.NewRepository(database.DB)

// Service (depends on Repository)
ticketService := ticketservice.NewService(ticketRepo, qrCodeGenerator, emailService)

// Handler (depends on Service)
ticketHandler := handlers.NewTicketHandler(ticketService)
```

**Benefits:**
- Testable (easy to mock)
- Flexible (easy to swap implementations)
- Clear dependencies

### Interface-Based Design

Repository menggunakan interface untuk abstraction:

```go
// Interface
type TicketRepository interface {
    FindByID(id string) (*ticket.Ticket, error)
    FindByQRCode(qrCode string) (*ticket.Ticket, error)
    Create(ticket *ticket.Ticket) error
    Update(ticket *ticket.Ticket) error
}

// Implementation
type repository struct {
    db *gorm.DB
}

func NewRepository(db *gorm.DB) interfaces.TicketRepository {
    return &repository{db: db}
}
```

**Benefits:**
- Easy to test (mock interface)
- Easy to swap implementations
- Clear contracts

---

## Arsitektur Frontend (Next.js)

### Feature-Based Structure

```
apps/web/src/
├── features/
│   ├── event/
│   │   ├── components/      # Event components
│   │   ├── hooks/           # Event hooks
│   │   ├── services/        # API services
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── schemas/          # Zod schemas
│   ├── ticket/
│   │   ├── components/      # Ticket components
│   │   ├── hooks/           # Ticket hooks
│   │   ├── services/        # API services
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── schemas/         # Zod schemas
│   ├── purchase/
│   │   ├── components/      # Purchase components
│   │   ├── hooks/           # Purchase hooks
│   │   ├── services/        # API services
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── schemas/         # Zod schemas
│   ├── checkin/
│   │   ├── components/      # Check-in components
│   │   ├── hooks/           # Check-in hooks
│   │   ├── services/        # API services
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── schemas/         # Zod schemas
│   └── admin/
│       ├── components/      # Admin components
│       ├── hooks/           # Admin hooks
│       ├── services/        # API services
│       ├── stores/          # Zustand stores
│       ├── types/           # TypeScript types
│       └── schemas/         # Zod schemas
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── shared/              # Shared components
└── lib/
    ├── api-client/          # API client
    └── utils/               # Utilities
```

### State Management

**Zustand** untuk client state:
- Purchase cart state
- UI state
- Local state

**TanStack Query** untuk server state:
- API data caching
- Automatic refetching
- Background updates
- Real-time polling untuk check-in status

### Form Handling

**React Hook Form + Zod**:
- Type-safe forms
- Client-side validation
- Server-side validation integration

---

## Design Patterns

### 1. Repository Pattern

Abstraction layer untuk data access:

```go
type TicketRepository interface {
    FindByID(id string) (*ticket.Ticket, error)
    FindByQRCode(qrCode string) (*ticket.Ticket, error)
}

type repository struct {
    db *gorm.DB
}
```

### 2. Service Pattern

Business logic encapsulation:

```go
type OrderService struct {
    orderRepo      interfaces.OrderRepository
    tierRepo       interfaces.TierRepository
    ticketRepo     interfaces.TicketRepository
    qrCodeGenerator *qr.QRCodeGenerator
    emailService   *email.EmailService
}
```

### 3. Dependency Injection

Constructor-based injection:

```go
func NewService(
    orderRepo interfaces.OrderRepository,
    tierRepo interfaces.TierRepository,
    qrCodeGenerator *qr.QRCodeGenerator,
    emailService *email.EmailService,
) *OrderService {
    return &OrderService{
        orderRepo:      orderRepo,
        tierRepo:       tierRepo,
        qrCodeGenerator: qrCodeGenerator,
        emailService:   emailService,
    }
}
```

### 4. Middleware Pattern

Cross-cutting concerns:

```go
router.Use(middleware.LoggerMiddleware())
router.Use(middleware.CORSMiddleware())
router.Use(middleware.RequestIDMiddleware())
router.Use(middleware.AuthMiddleware())
router.Use(middleware.RoleMiddleware())
router.Use(middleware.RateLimitMiddleware())
```

---

## Error Handling Strategy

### Backend

1. **Domain Errors**: Defined in service layer
2. **Error Mapping**: Map domain errors to API error codes
3. **Error Response**: Format menggunakan response helpers
4. **Bilingual Support**: Error messages dalam ID & EN

```go
// Service returns domain error
if err == orderservice.ErrInsufficientQuota {
    errors.ErrorResponse(c, "INSUFFICIENT_QUOTA", nil, nil)
    return
}

if err == checkservice.ErrTicketAlreadyUsed {
    errors.ErrorResponse(c, "TICKET_ALREADY_USED", nil, nil)
    return
}
```

### Frontend

1. **Zod Validation**: Client-side validation
2. **API Error Handling**: Parse error dari API response
3. **Error Boundary**: Catch React errors
4. **User-Friendly Messages**: Display error messages

---

## Logging Strategy

### Backend

- **Structured Logging**: Using `pkg/logger`
- **Request Logging**: Via middleware
- **Error Logging**: With context
- **Log Levels**: Info, Error, Debug

```go
logger.LogError(err, map[string]interface{}{
    "order_id": orderID,
    "action":   "create_order",
})
```

### Frontend

- **Console Logging**: Development only
- **Error Logging**: Error boundary
- **API Error Logging**: Via interceptors

---

## Security

### Authentication

- **JWT**: Access token + Refresh token
- **Password Hashing**: bcrypt
- **Token Validation**: Middleware

### Authorization

- **Role-Based**: User roles (Super Admin, Finance, Gate Staff)
- **Permission-Based**: Fine-grained permissions

### Data Protection

- **Input Validation**: Zod (frontend) + Validator (backend)
- **SQL Injection**: GORM parameterized queries
- **XSS**: React automatic escaping
- **CORS**: Configured middleware
- **Rate Limiting**: Untuk check-in endpoint

### QR Code Security

- **Secure Hash**: QR code menggunakan secure hash
- **One-Time Use**: QR code hanya bisa digunakan sekali
- **Duplicate Detection**: Detect duplicate scan
- **Screenshot Detection**: Basic detection untuk screenshot QR

---

## Scalability Considerations

### Backend

1. **Stateless API**: JWT-based, no server-side sessions
2. **Database Connection Pooling**: GORM handles this
3. **Horizontal Scaling**: Stateless design enables this
4. **Caching**: Ready for Redis integration (untuk quota tracking)
5. **Indexing**: Database indexing untuk QR code validation

### Frontend

1. **Code Splitting**: Next.js automatic
2. **Image Optimization**: Next.js Image component
3. **API Caching**: TanStack Query
4. **Bundle Optimization**: Next.js automatic

---

## Testing Strategy

### Backend

- **Unit Tests**: Per layer (service, repository)
- **Integration Tests**: API endpoints
- **Mocking**: Interface-based mocking
- **Manual Testing**: Untuk MVP (hackathon mode)

### Frontend

- **Unit Tests**: Components, hooks
- **Integration Tests**: User flows
- **Manual Testing**: Untuk MVP (hackathon mode)

---

## Deployment

### Backend

- **Docker**: Containerized
- **Docker Compose**: Local development
- **Environment Variables**: Config management

### Frontend

- **Next.js Build**: Static/SSR optimization
- **Environment Variables**: Runtime config
- **CDN**: Static assets

---

## Monitoring & Observability

### Backend

- **Request ID**: Track requests
- **Structured Logging**: Easy to parse
- **Error Tracking**: Error codes + context
- **Performance Monitoring**: Response time tracking

### Frontend

- **Error Boundary**: Catch errors
- **API Error Tracking**: Request ID correlation
- **Performance Monitoring**: Page load time

---

## Database Schema Overview

### Core Tables

- **events**: Event information
- **ticket_tiers**: Ticket tier definitions
- **ticket_quotas**: Ticket quota tracking
- **orders**: Order transactions
- **order_items**: Order items
- **tickets**: Generated tickets dengan QR code
- **check_ins**: Check-in records
- **gates**: Gate definitions
- **gate_assignments**: Gate assignments untuk tickets
- **users**: User accounts
- **roles**: User roles
- **permissions**: Permissions

### Key Relationships

- Event → Ticket Tiers (1:N)
- Ticket Tier → Ticket Quota (1:1)
- Order → Order Items (1:N)
- Order Item → Ticket (1:1)
- Ticket → Check-in (1:1)
- Gate → Gate Assignments (1:N)
- User → Roles (N:M)

---

## Best Practices

### Code Organization

1. **Feature-Based**: Group by feature
2. **Separation of Concerns**: Clear layer boundaries
3. **DRY**: Don't repeat yourself
4. **SOLID Principles**: Especially Single Responsibility

### Error Handling

1. **Consistent Format**: Use response helpers
2. **Bilingual**: Always include ID & EN
3. **Context**: Include relevant details
4. **Logging**: Log errors with context

### Testing

1. **Test Each Layer**: Unit tests per layer
2. **Mock Dependencies**: Use interfaces
3. **Integration Tests**: Test full flows
4. **Manual Testing**: Untuk MVP (hackathon mode)

---

**Dokumen ini akan diupdate sesuai dengan perkembangan development.**

