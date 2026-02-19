# Docker Setup untuk WebApp Ticketing

Dokumen ini menjelaskan setup Docker untuk project WebApp Ticketing dengan security best practices dan Docker secrets.

## Konfigurasi Docker

### Environment Modes

Project ini memiliki dua environment Docker Compose:

1. **Development** (`docker-compose.yml`)
   - Hot reload untuk development
   - Environment variables langsung di compose file
   - Tidak menggunakan Docker secrets

2. **Production** (`docker-compose.prod.yml`)
   - Optimized build dengan security hardening
   - Menggunakan Docker secrets untuk sensitive data
   - Resource limits dan security options

### Stack/Project Names

- **Development**: `ticketing_api` (default)
- **Production**: `ticketing_api_prod`

### Container Names

- **Development**:
  - Database: `ticketing-db`
  - Redis: `ticketing-redis`
  - API: `ticketing-api`
- **Production**:
  - Database: `ticketing-db-prod`
  - API: `ticketing-api-prod`

### Networks

- **Development**: `ticketing-network`
- **Production**: `ticketing-network-prod`

### Volumes

- **Development**: `ticketing_postgres_data`, `ticketing_go_mod_cache`
- **Production**: `ticketing_postgres_data_prod`

### Ports

- **PostgreSQL**: `5438:5432` (host:container)
- **Redis**: `6379:6379` (host:container)
- **API**: `8083:8083` (host:container)

## Setup Development Environment

### 1. Start Development Environment

```bash
cd apps/api
make dev-up
# atau
docker compose up -d
```

### 2. Verifikasi

```bash
# Cek container berjalan
docker compose ps

# Cek logs
make dev-logs
# atau
docker compose logs -f api

# Test health endpoint
curl http://localhost:8083/health
```

### 3. Stop Development Environment

```bash
make dev-down
# atau
docker compose down
```

## Setup Production Environment

### 1. Generate Docker Secrets

**PENTING**: Secrets harus di-generate sebelum menjalankan production environment.

```bash
cd apps/api
make secrets
# atau
./scripts/generate-secrets.sh
```

Script ini akan membuat:

- `secrets/jwt_secret.txt` - JWT secret (64 karakter)
- `secrets/db_user.txt` - Database user
- `secrets/db_password.txt` - Database password (32 karakter)

**⚠️ WARNING**: Jangan commit secrets ke Git! Folder `secrets/` sudah ada di `.gitignore`.

### 2. Validate Secrets

```bash
make validate-secrets
```

### 3. Build Production Images

```bash
make build-prod
# atau
docker compose -f docker-compose.prod.yml build --no-cache
```

### 4. Start Production Environment

```bash
make prod-up
# atau
docker compose -f docker-compose.prod.yml up -d
```

### 5. Verifikasi

```bash
# Cek container berjalan
docker compose -f docker-compose.prod.yml ps

# Cek logs
make prod-logs
# atau
docker compose -f docker-compose.prod.yml logs -f api

# Test health endpoint
curl http://localhost:8083/health
```

### 6. Stop Production Environment

```bash
make prod-down
# atau
docker compose -f docker-compose.prod.yml down
```

## Security Features

### Production Security Hardening

1. **Non-root User**: Container berjalan sebagai user `appuser` (UID 1000)
2. **Read-only Filesystem**: Filesystem read-only dengan tmpfs untuk writable areas
3. **Docker Secrets**: Sensitive data (JWT, DB password) menggunakan Docker secrets
4. **Resource Limits**: CPU dan memory limits untuk mencegah resource exhaustion
5. **Health Checks**: Automatic health monitoring untuk semua services
6. **Security Options**: `no-new-privileges` untuk mencegah privilege escalation

### JWT Secret Management

- **Development**: Menggunakan environment variable langsung (untuk kemudahan)
- **Production**: Menggunakan Docker secrets file (lebih aman)
- **Validation**: JWT secret harus minimal 32 karakter (64 karakter direkomendasikan)

## Environment Variables

### Development

Environment variables di-set langsung di `docker-compose.yml`:

```yaml
environment:
  - JWT_SECRET=dev-secret-key-min-32-chars-for-development-only
  - DB_USER=postgres
  - DB_PASSWORD=postgres

  # Redis (cache + distributed rate limit + idempotency)
  - REDIS_ENABLED=true
  - REDIS_ADDR=redis:6379

  # Observability
  - METRICS_ENABLED=true
```

### Production

Production menggunakan Docker secrets yang dibaca dari file:

```yaml
secrets:
  - jwt_secret
  - db_user
  - db_password
```

Application akan membaca dari:

- `JWT_SECRET_FILE=/run/secrets/jwt_secret`
- `DB_USER_FILE=/run/secrets/db_user`
- `DB_PASSWORD_FILE=/run/secrets/db_password`

### Local Development (tanpa Docker)

Untuk development lokal, buat file `.env`:

```env
# Server Configuration
PORT=8083
ENV=development

# Database Configuration (untuk connect dari host)
DB_HOST=localhost
DB_PORT=5438
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ticketing_app
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_ACCESS_TTL=24
JWT_REFRESH_TTL=7

# Redis (optional)
# Set REDIS_ENABLED=false jika tidak menjalankan Redis
REDIS_ENABLED=false
REDIS_ADDR=localhost:6379
REDIS_DB=0
REDIS_PREFIX=ticketing_api

# Observability
METRICS_ENABLED=true
PPROF_ENABLED=false
DEBUG_TOKEN=
```

**Catatan**:

- `DB_PORT=5438` untuk connect dari host (di luar Docker)
- `DB_PORT=5432` untuk connect dari dalam Docker network (container ke container)

## Makefile Commands

Project ini menyediakan Makefile untuk kemudahan operasi Docker:

```bash
# Generate secrets
make secrets

# Validate secrets
make validate-secrets

# Development
make dev-up          # Start development
make dev-down        # Stop development
make dev-logs        # View logs

# Production
make prod-up         # Start production (validates secrets first)
make prod-down       # Stop production
make prod-logs       # View logs
make build-prod      # Build production images

# Security
make security-scan   # Run security scans (requires trivy)

# Application
make build           # Build Go binary
make run             # Run application
make test            # Run tests
make clean           # Clean build artifacts
```

## Troubleshooting

### Secrets tidak ditemukan

Jika error "secrets not found" saat menjalankan production:

```bash
# Generate secrets terlebih dahulu
make secrets

# Validate secrets
make validate-secrets
```

### JWT Secret terlalu pendek

Jika mendapat warning "JWT_SECRET is less than 32 characters":

```bash
# Regenerate JWT secret
rm secrets/jwt_secret.txt
make secrets
```

### Database tidak ditemukan

Jika error "database ticketing_app does not exist":

```bash
# Development
docker exec -it ticketing-db psql -U postgres

# Production
docker exec -it ticketing-db-prod psql -U ${DB_USER:-postgres}

# Buat database
CREATE DATABASE ticketing_app;
\q
```

### Port sudah digunakan

Jika port 5438, 6379, atau 8083 sudah digunakan:

1. Cek aplikasi lain yang menggunakan port tersebut:

   ```bash
   # Windows
   netstat -ano | findstr :8083

   # Linux/Mac
   lsof -i :8083
   ```

2. Atau ubah port di `docker-compose.*.yml`

### Container tidak start

Jika container tidak start:

```bash
# Cek logs
make dev-logs  # atau make prod-logs

# Cek status
docker compose ps  # untuk development
# atau
docker compose -f docker-compose.prod.yml ps  # untuk production
```

### Permission denied pada secrets

Jika mendapat error permission denied saat membaca secrets:

```bash
# Set proper permissions
chmod 600 secrets/*.txt
```

### Volume konflik

Jika ada volume dengan nama yang sama:

```bash
# List volumes
docker volume ls

# Hapus volume yang tidak digunakan
docker volume rm <volume_name>

# Atau clean semua
make clean  # (jika ada command clean di Makefile)
```

## Best Practices

1. **Selalu generate secrets untuk production** sebelum build/run
2. **Jangan commit secrets** ke Git (sudah di `.gitignore`)
3. **Gunakan production compose** hanya untuk production environment
4. **Monitor health checks** untuk memastikan services berjalan dengan baik
5. **Backup database** secara berkala dari volume Docker
6. **Update base images** secara berkala untuk security patches

## Perbedaan dengan Euforia Healthcare

| Item               | Euforia Healthcare       | WebApp Ticketing                                               |
| ------------------ | -------------------- | -------------------------------------------------------------- |
| Stack Name         | `api` (default)      | `ticketing_api` / `ticketing_api_prod`                         |
| Database Container | `euforia-db`  | `ticketing-db` / `ticketing-db-prod`                           |
| Redis Container    | -                    | `ticketing-redis`                                               |
| API Container      | `euforia-api` | `ticketing-api` / `ticketing-api-prod`                         |
| Network            | `euforia-network`        | `ticketing-network` / `ticketing-network-prod`                 |
| Volume             | `postgres_data`      | `ticketing_postgres_data` / `ticketing_postgres_data_prod`     |
| PostgreSQL Port    | `5434:5432`          | `5438:5432`                                                    |
| Redis Port         | -                    | `6379:6379`                                                    |
| API Port           | `8080:8080`          | `8083:8083`                                                    |
| Database Name      | `euforia`     | `ticketing_app`                                                |
| Secrets            | Environment vars     | Docker secrets (production)                                    |

Kedua project dapat berjalan bersamaan tanpa konflik.
