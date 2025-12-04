# Setup Guide - API

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start PostgreSQL with Docker Compose:**
```bash
cd apps/api
docker-compose up -d postgres
```

2. **Copy environment file:**
```bash
cp .env.example .env
```

**Note**: Jika port 5432 sudah digunakan, docker-compose akan menggunakan port 5434. Pastikan `.env` file menggunakan port yang sesuai (5434 untuk Docker, 5432 untuk local PostgreSQL).

3. **Run the server:**
```bash
# From root
pnpm dev --filter=@repo/api

# Or from apps/api
go run cmd/server/main.go
```

### Option 2: Using Local PostgreSQL

1. **Install PostgreSQL** (if not installed):
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
```

2. **Create database:**
```bash
sudo -u postgres psql
```

Then in PostgreSQL shell:
```sql
CREATE DATABASE crm_healthcare;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE crm_healthcare TO postgres;
\q
```

3. **Update .env file** with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=crm_healthcare
DB_SSLMODE=disable
```

4. **Run the server:**
```bash
go run cmd/server/main.go
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
# Server Configuration
PORT=8080
ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=crm_healthcare
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_ACCESS_TTL=24
JWT_REFRESH_TTL=7
```

## Troubleshooting

### Database Connection Error

**Error**: `password authentication failed for user "postgres"`

**Solutions**:
1. Check if PostgreSQL is running:
```bash
# Docker
docker ps | grep postgres

# System service
sudo systemctl status postgresql
```

2. Verify database credentials in `.env` file

3. If using Docker Compose, make sure the service is up:
```bash
docker-compose up -d postgres
docker-compose ps
```

4. Test connection manually:
```bash
psql -h localhost -p 5432 -U postgres -d crm_healthcare
```

### Database Doesn't Exist

Create the database:
```bash
# Using Docker
docker exec -it crm-healthcare-db psql -U postgres
CREATE DATABASE crm_healthcare;
\q

# Using local PostgreSQL
createdb -U postgres crm_healthcare
```

## Default Seeded Users

After first run, these users will be created:

- **Admin**: `admin@example.com` / `admin123`
- **Doctor**: `doctor@example.com` / `admin123`
- **Pharmacist**: `pharmacist@example.com` / `admin123`

