# API Structure Documentation

Dokumentasi lengkap tentang struktur folder dan arsitektur API untuk WebApp Ticketing Platform.

## 📁 Struktur Folder Lengkap

```
apps/api/
├── cmd/                              # Application entry points
│   ├── server/
│   │   └── main.go                   # Main application entry point
│   └── seeder/
│       └── main.go                   # Standalone seeder runner
│
├── internal/                         # Private application code (tidak bisa di-import dari luar)
│   ├── api/                          # HTTP Layer (Presentation Layer)
│   │   ├── handlers/                 # HTTP Request Handlers (Feature-Based)
│   │   │   ├── auth/                  # Authentication handlers
│   │   │   │   └── handler.go         # Auth handler implementation
│   │   │   └── menu/                  # Menu management handlers
│   │   │       └── handler.go         # Menu handler implementation
│   │   ├── middleware/               # HTTP Middleware
│   │   │   ├── auth.go                # Authentication middleware
│   │   │   ├── cors.go                # CORS configuration
│   │   │   ├── logger.go              # Request logging middleware
│   │   │   ├── permission.go          # Permission checking middleware
│   │   │   └── request_id.go          # Request ID generation middleware
│   │   └── routes/                    # Route definitions (Feature-Based)
│   │       ├── auth/                  # Authentication routes
│   │       │   └── routes.go          # Auth routes setup
│   │       └── menu/                  # Menu routes
│   │           └── routes.go          # Menu routes setup
│   │
│   ├── config/                       # Configuration management
│   │   └── config.go                 # Application configuration loader
│   │
│   ├── database/                     # Database connection & migrations
│   │   └── database.go                # Database initialization & auto-migration
│   │
│   ├── domain/                       # Domain Layer (Business Entities)
│   │   ├── auth/                      # Authentication domain
│   │   │   └── entity.go              # Auth DTOs & request/response models
│   │   ├── menu/                      # Menu domain
│   │   │   └── entity.go              # Menu entity & DTOs
│   │   ├── permission/               # Permission domain
│   │   │   └── entity.go              # Permission entity & DTOs
│   │   ├── role/                      # Role domain
│   │   │   └── entity.go              # Role entity & DTOs
│   │   └── user/                      # User domain
│   │       └── entity.go              # User entity & DTOs
│   │
│   ├── repository/                   # Data Access Layer
│   │   ├── interfaces/                # Repository interfaces (contracts) - Feature-Based
│   │   │   ├── auth/                  # Auth repository interface
│   │   │   │   └── repository.go      # Auth repository contract
│   │   │   ├── menu/                  # Menu repository interface
│   │   │   │   └── repository.go      # Menu repository contract
│   │   │   ├── permission/            # Permission repository interface
│   │   │   │   └── repository.go      # Permission repository contract
│   │   │   ├── role/                  # Role repository interface
│   │   │   │   └── repository.go      # Role repository contract
│   │   │   └── user/                  # User repository interface
│   │   │       └── repository.go      # User repository contract
│   │   └── postgres/                  # PostgreSQL implementations
│   │       ├── auth/
│   │       │   └── repository.go      # Auth repository implementation
│   │       ├── menu/
│   │       │   └── repository.go      # Menu repository implementation
│   │       ├── permission/
│   │       │   └── repository.go      # Permission repository implementation
│   │       ├── role/
│   │       │   └── repository.go      # Role repository implementation
│   │       └── user/
│   │           └── repository.go      # User repository implementation
│   │
│   └── service/                      # Application Service Layer (Business Logic)
│       ├── auth/
│       │   └── service.go              # Authentication business logic
│       ├── menu/
│       │   └── service.go              # Menu management business logic
│       ├── permission/
│       │   └── service.go              # Permission management logic
│       └── user/
│           └── service.go              # User management business logic
│
├── pkg/                              # Public packages (bisa di-import dari luar)
│   ├── cerebras/                      # Cerebras AI client
│   │   └── client.go                  # AI client implementation
│   ├── errors/                        # Error handling utilities
│   │   └── errors.go                  # Custom error types & helpers
│   ├── jwt/                           # JWT utilities
│   │   └── jwt.go                     # JWT token generation & validation
│   ├── logger/                        # Logging utilities
│   │   └── logger.go                  # Structured logger setup
│   └── response/                      # API response helpers
│       └── response.go                # Standardized response formatter
│
├── seeders/                          # Database seeders (Feature-Based)
│   ├── auth/                          # Authentication seeder
│   │   └── seeder.go                  # Auth user seeder
│   ├── role/                           # Role seeder
│   │   └── seeder.go                  # Role data seeder
│   ├── permission/                    # Permission seeder
│   │   └── seeder.go                  # Permission data seeder
│   ├── role_permission/               # Role-Permission mapping seeder
│   │   └── seeder.go                  # Role-Permission relationships
│   ├── menu/                          # Menu seeder
│   │   └── seeder.go                  # Menu data seeder
│   ├── helpers.go                     # Seeder helper functions
│   └── seed_all.go                    # Main seeder orchestrator (runs all seeders)
│
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment variables template
├── docker-compose.yml                 # Docker Compose configuration
├── Dockerfile                         # Docker image build file
├── DOCKER_SETUP.md                    # Docker setup documentation
├── go.mod                             # Go module dependencies
├── go.sum                             # Go module checksums
├── Makefile                           # Build automation commands
├── README.md                          # Project overview
├── SETUP.md                           # Setup instructions
└── STRUCTURE.md                       # This file - Structure documentation
```

---

## 🏗️ Arsitektur Layer

API ini menggunakan **Layered Architecture** dengan pemisahan concern yang jelas:

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Layer                           │
│  (handlers, routes, middleware)                        │
│  - Request validation                                   │
│  - Authentication/Authorization                        │
│  - Response formatting                                 │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                 Service Layer                           │
│  (business logic, orchestration)                       │
│  - Business rules                                      │
│  - Transaction management                              │
│  - Domain validation                                   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Repository Layer                           │
│  (data access, persistence)                            │
│  - Database queries                                    │
│  - Data mapping                                        │
│  - Caching (future)                                    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  Domain Layer                          │
│  (entities, DTOs, models)                             │
│  - Business entities                                   │
│  - Data transfer objects                               │
│  - Domain models                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Penjelasan Detail Setiap Folder

### 1. `cmd/` - Application Entry Points

**Tujuan**: Menampung entry point aplikasi (main functions).

**Struktur**:

- `cmd/server/main.go`: Entry point utama aplikasi
  - Initialize configuration
  - Setup database connection
  - Register routes
  - Start HTTP server
  - Run seeders (optional)

- `cmd/seeder/main.go`: Standalone seeder runner
  - Load configuration
  - Connect to database
  - Run migrations
  - Execute all seeders

**Best Practice**:

- Satu entry point per executable
- Minimal logic di main.go, delegasikan ke internal packages

---

### 2. `internal/api/` - HTTP Layer (Presentation)

**Tujuan**: Menangani semua aspek HTTP request/response.

#### 2.1 `handlers/` - Request Handlers

**Tujuan**: Menangani HTTP requests dan responses.

**Karakteristik**:

- Menerima HTTP request
- Memanggil service layer
- Format response menggunakan `pkg/response`
- Error handling menggunakan `pkg/errors`

**Contoh Struktur Handler**:

```go
func (h *AuthHandler) Login(c *gin.Context) {
    // 1. Parse request body
    // 2. Validate input
    // 3. Call service layer
    // 4. Format response
}
```

#### 2.2 `middleware/` - HTTP Middleware

**Tujuan**: Cross-cutting concerns untuk HTTP requests.

**Middleware yang tersedia**:

- `auth.go`: JWT authentication
- `permission.go`: Permission-based authorization
- `cors.go`: CORS configuration
- `logger.go`: Request/response logging
- `request_id.go`: Generate unique request ID

#### 2.3 `routes/` - Route Definitions

**Tujuan**: Mendefinisikan HTTP routes dan mapping ke handlers.

**Struktur**: Feature-based (setiap feature punya folder sendiri)

- `routes/auth/routes.go` - Authentication routes
- `routes/menu/routes.go` - Menu routes

**Karakteristik**:

- Group routes by feature
- Apply middleware per route/group
- Register handlers
- Package name = feature name (e.g., `package auth`)
- Function name: `SetupRoutes` (bukan `SetupAuthRoutes`)

---

### 3. `internal/config/` - Configuration

**Tujuan**: Mengelola konfigurasi aplikasi.

**Fitur**:

- Load dari environment variables
- Default values
- Type-safe configuration struct
- Support `.env` file untuk development

**Configuration yang dikelola**:

- Server (port, environment)
- Database (host, port, credentials)
- JWT (secret, TTL)
- External services (Cerebras AI)

---

### 4. `internal/database/` - Database

**Tujuan**: Database connection dan migration management.

**Fitur**:

- PostgreSQL connection setup
- Auto-migration menggunakan GORM
- Connection pooling
- Health check

---

### 5. `internal/domain/` - Domain Layer

**Tujuan**: Business entities dan DTOs.

**Struktur per domain**:

- `entity.go`: Domain models, DTOs, request/response structs

**Karakteristik**:

- Pure data structures
- No business logic
- Validation tags (jika diperlukan)
- JSON tags untuk serialization

**Domain yang tersedia**:

- `auth/`: Login, register, token refresh DTOs
- `user/`: User entity
- `role/`: Role entity
- `permission/`: Permission entity
- `menu/`: Menu entity

---

### 6. `internal/repository/` - Data Access Layer

**Tujuan**: Abstraksi data access, implementasi persistence.

#### 6.1 `interfaces/` - Repository Contracts

**Tujuan**: Interface/contract untuk repository.

**Struktur**: Feature-based (setiap feature punya folder sendiri)

- `interfaces/auth/repository.go` - Auth repository interface
- `interfaces/menu/repository.go` - Menu repository interface
- `interfaces/role/repository.go` - Role repository interface
- `interfaces/permission/repository.go` - Permission repository interface
- `interfaces/user/repository.go` - User repository interface

**Karakteristik**:

- Define methods yang diperlukan
- Technology-agnostic
- Memudahkan testing (mock)
- Package name = feature name (e.g., `package auth`)
- Type name: `Repository` (bukan `AuthRepository`)

#### 6.2 `postgres/` - PostgreSQL Implementation

**Tujuan**: Implementasi repository menggunakan PostgreSQL.

**Karakteristik**:

- Implement interface dari `interfaces/`
- GORM untuk ORM
- Raw SQL jika diperlukan
- Error handling dan mapping

**Best Practice**:

- Satu repository per domain
- Return domain entities, bukan database models
- Handle database errors dengan proper error types

---

### 7. `internal/service/` - Service Layer

**Tujuan**: Business logic dan orchestration.

**Karakteristik**:

- Business rules implementation
- Transaction management
- Call multiple repositories jika diperlukan
- Validation business logic
- Error handling dengan domain errors

**Service yang tersedia**:

- `auth/`: Authentication & authorization logic
- `user/`: User management logic
- `role/`: Role management logic
- `permission/`: Permission management logic
- `menu/`: Menu management logic

**Best Practice**:

- Service tidak tahu tentang HTTP
- Return domain entities atau DTOs
- Handle business errors dengan proper error codes

---

### 8. `pkg/` - Public Packages

**Tujuan**: Reusable utilities yang bisa di-import dari luar.

**Packages**:

- `response/`: Standardized API response formatter
- `errors/`: Custom error types dan helpers
- `jwt/`: JWT token utilities
- `logger/`: Structured logging setup
- `cerebras/`: AI client integration

**Best Practice**:

- Stable API (tidak sering berubah)
- Well documented
- No business logic

---

### 9. `seeders/` - Database Seeders

**Tujuan**: Populate database dengan initial/default data.

**Struktur**: Feature-based (setiap feature punya folder sendiri)

- `seeders/role/seeder.go` - Default roles (admin, staff_gate, guest)
- `seeders/permission/seeder.go` - System permissions
- `seeders/role_permission/seeder.go` - Role-permission mappings
- `seeders/menu/seeder.go` - Default menu items
- `seeders/auth/seeder.go` - Default admin user
- `seeders/helpers.go` - Helper functions untuk seeders

**Main Orchestrator**: `seeders/seed_all.go`

- File ini menjalankan semua seeder dari setiap modul
- Mengatur urutan seeding yang benar (dependencies)
- Package `seeders` yang bisa di-import untuk digunakan di `main.go` atau di-run standalone

**Usage di main.go**:

```go
// Di cmd/server/main.go
import "github.com/gilabs/webapp-ticket-konser/api/seeders"

// Run all seeders
if err := seeders.SeedAll(); err != nil {
    log.Fatal("Failed to seed data:", err)
}
```

**Run Seeder Standalone**:

```bash
# Run seeder sebagai standalone program
go run cmd/seeder/main.go

# Atau build dan run
go build -o seeder cmd/seeder/main.go
./seeder
```

**Struktur Seeder per Modul**:

Setiap modul memiliki folder sendiri dengan `seeder.go`:

- `seeders/auth/seeder.go` - Package: `auth`, Function: `Seed()`
- `seeders/role/seeder.go` - Package: `role`, Function: `Seed()`
- `seeders/permission/seeder.go` - Package: `permission`, Function: `Seed()`
- `seeders/role_permission/seeder.go` - Package: `role_permission`, Function: `Seed()`
- `seeders/menu/seeder.go` - Package: `menu`, Function: `Seed()`

---

## 🔄 Data Flow

### Request Flow

```
1. HTTP Request
   ↓
2. Middleware (auth, logger, cors)
   ↓
3. Route Handler
   ↓
4. Handler → Service
   ↓
5. Service → Repository
   ↓
6. Repository → Database
   ↓
7. Database → Repository (return data)
   ↓
8. Repository → Service (return domain entity)
   ↓
9. Service → Handler (return result)
   ↓
10. Handler → Response Formatter
   ↓
11. HTTP Response
```

### Example: Login Flow

```
POST /api/v1/auth/login
   ↓
auth_middleware (optional, skip untuk login)
   ↓
auth.Handler.Login()  // Package: auth, Type: Handler
   ↓
AuthService.Login(email, password)
   ├─→ UserRepository.FindByEmail(email)
   ├─→ Password validation
   └─→ JWT generation
   ↓
Response: { token, refresh_token, user }
```

---

## 📝 Naming Conventions

### Files

- **Handlers**: `handler.go` (inside `handlers/{feature}/` folder)
- **Services**: `service.go` (inside feature folder)
- **Repositories**: `repository.go` (inside feature folder)
- **Entities**: `entity.go` (inside domain folder)
- **Routes**: `routes.go` (inside `routes/{feature}/` folder)
- **Repository Interfaces**: `repository.go` (inside `repository/interfaces/{feature}/` folder)

### Packages

- **Lowercase, single word** (e.g., `auth`, `user`, `menu`)
- **No underscores or mixedCaps**

### Functions

- **Public**: PascalCase (e.g., `Login`, `GetUser`)
- **Private**: camelCase (e.g., `validateEmail`, `hashPassword`)

### Variables

- **Short, descriptive names**
- **camelCase** untuk variables
- **PascalCase** untuk exported constants

---

## 🎯 Best Practices

### 1. Dependency Injection

```go
// ✅ GOOD: Inject dependencies
// handlers/auth/handler.go
package auth

type Handler struct {
    authService *authservice.Service
}

func NewHandler(authService *authservice.Service) *Handler {
    return &Handler{authService: authService}
}
```

### 2. Error Handling

```go
// ✅ GOOD: Use custom error types
if err != nil {
    return nil, errors.NewNotFoundError("user not found")
}
```

### 3. Response Formatting

```go
// ✅ GOOD: Use response helper
return response.Success(c, user, "User retrieved successfully")
```

### 4. Interface-Based Design

```go
// ✅ GOOD: Define interface first
// repository/interfaces/user/repository.go
package user

type Repository interface {
    FindByID(id string) (*domain.User, error)
    Create(user *domain.User) error
}
```

### 5. Separation of Concerns

- **Handlers**: HTTP concerns only
- **Services**: Business logic only
- **Repositories**: Data access only
- **Domain**: Data structures only

---

## 🧪 Testing Structure (Future)

```
apps/api/
├── internal/
│   ├── api/
│   │   └── handlers/
│   │       └── auth/
│   │           ├── handler.go
│   │           └── handler_test.go
│   ├── service/
│   │   └── auth/
│   │       ├── service.go
│   │       └── service_test.go
│   └── repository/
│       └── postgres/
│           └── auth/
│               ├── repository.go
│               └── repository_test.go
└── pkg/
    └── response/
        ├── response.go
        └── response_test.go
```

---

## 📚 Related Documentation

- [API Standards](../docs/api-standart/) - API response format & error codes
- [Docker Setup](./DOCKER_SETUP.md) - Docker configuration
- [Setup Guide](./SETUP.md) - Development setup
- [Architecture](../docs/ARCHITECTURE.md) - System architecture

---

## 🔗 Quick Links

- **Entry Point**: [`cmd/server/main.go`](./cmd/server/main.go)
- **Configuration**: [`internal/config/config.go`](./internal/config/config.go)
- **Database Setup**: [`internal/database/database.go`](./internal/database/database.go)
- **Response Helper**: [`pkg/response/response.go`](./pkg/response/response.go)
- **Error Handling**: [`pkg/errors/errors.go`](./pkg/errors/errors.go)

---

**Last Updated**: 2024-12-09  
**Maintained by**: Development Team
