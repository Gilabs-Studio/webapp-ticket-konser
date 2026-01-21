# WebApp Ticketing API

Backend API untuk WebApp Ticketing Platform (Harry Potter Museum Exhibition) menggunakan Go dan Gin framework.

## Tech Stack

- **Go**: 1.25+
- **Gin**: Web framework
- **PostgreSQL**: Database
- **GORM**: ORM
- **JWT**: Authentication
- **Docker**: Containerization
- **Redis**: Cache + distributed rate limit + idempotency (optional, recommended for scale)
- **Prometheus**: Metrics endpoint (optional)

## Arsitektur

### Layered Architecture

```
Handler Layer (internal/api/handlers/)
    ↓
Service Layer (internal/service/)
    ↓
Repository Layer (internal/repository/)
    ↓
Database (PostgreSQL)
```

### Dependency Injection

- Repository di-inject ke Service
- Service di-inject ke Handler
- JWT Manager di-inject ke Service dan Middleware

### Interface-Based Design

- Repository menggunakan interface (`internal/repository/interfaces/`)
- Implementasi di `internal/repository/postgres/`
- Memudahkan testing dan perubahan database

## Setup Development

### Prerequisites

- Go 1.25 or higher
- PostgreSQL 16+
- pnpm (untuk monorepo)
- Docker & Docker Compose (optional)

### Local Development dengan pnpm

1. Dari root monorepo:

```bash
pnpm dev --filter=api
```

2. Atau dari folder api:

```bash
cd apps/api
pnpm dev
```

3. Atau langsung dengan Go:

```bash
cd apps/api
go run cmd/server/main.go
```

### Environment Variables

Copy `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
```

**Required Variables:**

- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_USER`: PostgreSQL user (default: postgres)
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: Database name (default: ticketing_app)
- `JWT_SECRET`: JWT secret key (min 32 characters)

**Optional (Recommended for scale):**

- `REDIS_ENABLED=true` untuk mengaktifkan cache, distributed rate limit, dan idempotency
- `REDIS_ADDR` / `REDIS_URL` untuk koneksi Redis
- `METRICS_ENABLED=true` untuk `GET /metrics`
- `PPROF_ENABLED=true` + `DEBUG_TOKEN=<token>` untuk mengaktifkan `/debug/pprof/*` secara aman

### Database Setup

#### Option 1: Docker Compose (Recommended)

```bash
cd apps/api
docker-compose up -d postgres redis
```

**Note**: Docker Compose menggunakan port **5438** (bukan 5432) untuk menghindari konflik. Saat connect dari host gunakan `DB_PORT=5438`, sedangkan dari dalam Docker network gunakan `DB_PORT=5432`.

Redis (default) tersedia di `localhost:6379`.
#### Option 2: Local PostgreSQL

1. Install PostgreSQL
2. Create database:

```sql
CREATE DATABASE ticketing_app;
```

**Note**: Jika menggunakan local PostgreSQL, gunakan `DB_PORT=5432` di `.env` file.

### Run Migrations & Seeders

Migrations dan seeders akan otomatis dijalankan saat server start.

**Manual migration:**

```bash
cd apps/api
go run cmd/server/main.go
```

**Seed data:**

- Admin: `admin@example.com` / `admin123`
- Doctor: `doctor@example.com` / `admin123`
- Pharmacist: `pharmacist@example.com` / `admin123`

### Build

Dari root monorepo:

```bash
pnpm build --filter=api
```

Atau dari folder api:

```bash
cd apps/api
pnpm build
# atau
go build -o bin/server ./cmd/server/main.go
```

### Docker Development

1. Build and run with Docker Compose:

```bash
cd apps/api
docker-compose up --build
```

2. Atau build image manually:

```bash
cd apps/api
docker build -t ticketing-api .
docker run -p 8083:8083 ticketing-api
```

## API Endpoints

### Health Check

- `GET /health` - Health check endpoint
- `GET /ping` - Ping endpoint

### Authentication

- `POST /api/v1/auth/login` - Login dengan email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (client-side)

## Project Structure

Untuk dokumentasi lengkap tentang struktur folder, arsitektur, dan best practices, lihat **[STRUCTURE.md](./STRUCTURE.md)**.

### Quick Overview

```
apps/api/
├── cmd/server/          # Application entry point
├── internal/            # Private application code
│   ├── api/             # HTTP layer (handlers, routes, middleware)
│   ├── domain/          # Business entities & DTOs
│   ├── repository/      # Data access layer
│   ├── service/         # Business logic layer
│   ├── config/          # Configuration management
│   └── database/        # Database connection & migrations
├── pkg/                 # Public reusable packages
│   ├── response/        # API response helpers
│   ├── errors/          # Error handling
│   ├── jwt/             # JWT utilities
│   └── logger/          # Logging
└── seeders/             # Database seeders
```

**📖 Baca dokumentasi lengkap**: [STRUCTURE.md](./STRUCTURE.md)

## Development Guidelines

- Follow Go best practices and conventions
- Use the API response standards defined in `/docs/api-standart/`
- Implement error codes as defined in `/docs/api-standart/api-error-codes.md`
- Use layered architecture (Handler → Service → Repository)
- Use interface-based design for repositories
- Implement dependency injection pattern

## Error Handling

Semua error mengikuti format standar:

```json
{
  "success": false,
  "error": {
- `JWT_SECRET`: JWT secret key (min 32 characters)

**Optional (Recommended for scale):**

- `REDIS_ENABLED=true` untuk mengaktifkan cache, distributed rate limit, dan idempotency
- `METRICS_ENABLED=true` untuk `GET /metrics`
- `PPROF_ENABLED=true` + `DEBUG_TOKEN=<token>` untuk mengaktifkan `/debug/pprof/*` secara aman
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {},
    "field_errors": []
  },
  "timestamp": "2024-01-15T10:30:45+07:00",
  "request_id": "req_abc123xyz"
}
```

## Logging

- Structured logging menggunakan `pkg/logger`
- Request logging via middleware
- Error logging dengan context

## Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific test
go test ./internal/service/auth/...
```

## Next Steps

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Setup CI/CD
- [ ] Add API documentation (Swagger)
- [ ] Performance optimization
- [ ] Add rate limiting
- [ ] Add caching layer (Redis)
