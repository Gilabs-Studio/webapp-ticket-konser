# Docker Setup untuk WebApp Ticketing

Dokumen ini menjelaskan setup Docker untuk project WebApp Ticketing yang terpisah dari project CRM Healthcare.

## Konfigurasi Docker

### Stack/Project Name
- **Stack Name**: `ticketing_api`
  - Nama stack Docker Compose untuk project ini
  - Digunakan sebagai prefix untuk resource yang dibuat (jika tidak menggunakan nama eksplisit)

### Container Names
- **Database**: `ticketing-db`
- **API**: `ticketing-api`

### Network
- **Network Name**: `ticketing-network`
- **Driver**: `bridge`

### Volumes
- **PostgreSQL Data**: `ticketing_postgres_data`
  - Volume ini terpisah dari volume project lain
  - Data database disimpan di volume ini

### Ports
- **PostgreSQL**: `5435:5432` (host:container)
  - Port 5435 di host untuk menghindari konflik dengan:
    - Port 5432 (PostgreSQL default)
    - Port 5434 (CRM Healthcare project)
- **API**: `8083:8083` (host:container)
  - Port 8083 di host untuk menghindari konflik dengan:
    - Port 8080 (default)
    - Port 8081, 8082 (project lain)

## Setup Awal

### 1. Stop Container Lama (jika ada)
```bash
cd apps/api
docker-compose down
```

### 2. Hapus Volume Lama (opsional, jika ingin fresh start)
```bash
docker volume rm api_postgres_data
# atau volume lain yang mungkin masih ada
```

### 3. Build dan Start Container
```bash
cd apps/api
docker-compose up --build -d
```

### 4. Verifikasi
```bash
# Cek container berjalan
docker-compose ps

# Cek logs
docker-compose logs -f api

# Test koneksi database
docker exec -it ticketing-db psql -U postgres -d ticketing_app -c "SELECT version();"
```

## Environment Variables

Saat menggunakan Docker Compose, environment variables sudah di-set di `docker-compose.yml`. Untuk development lokal, buat file `.env`:

```env
# Server Configuration
PORT=8083
ENV=development

# Database Configuration (untuk connect dari host)
DB_HOST=localhost
DB_PORT=5435
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ticketing_app
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_ACCESS_TTL=24
JWT_REFRESH_TTL=7
```

**Catatan**: 
- `DB_PORT=5435` untuk connect dari host (di luar Docker)
- `DB_PORT=5432` untuk connect dari dalam Docker network (container ke container)

## Troubleshooting

### Database tidak ditemukan
Jika error "database ticketing_app does not exist":
```bash
# Masuk ke container database
docker exec -it ticketing-db psql -U postgres

# Buat database
CREATE DATABASE ticketing_app;
\q
```

### Port sudah digunakan
Jika port 5435 atau 8083 sudah digunakan:
1. Cek aplikasi lain yang menggunakan port tersebut
2. Atau ubah port di `docker-compose.yml`

### Volume konflik
Jika ada volume dengan nama yang sama:
```bash
# List volumes
docker volume ls

# Hapus volume yang tidak digunakan
docker volume rm <volume_name>
```

## Perbedaan dengan CRM Healthcare

| Item | CRM Healthcare | WebApp Ticketing |
|------|----------------|------------------|
| Stack Name | `api` (default) | `ticketing_api` |
| Database Container | `crm-healthcare-db` | `ticketing-db` |
| API Container | `crm-healthcare-api` | `ticketing-api` |
| Network | `crm-network` | `ticketing-network` |
| Volume | `postgres_data` | `ticketing_postgres_data` |
| PostgreSQL Port | `5434:5432` | `5435:5432` |
| API Port | `8080:8080` | `8083:8083` |
| Database Name | `crm_healthcare` | `ticketing_app` |

Kedua project dapat berjalan bersamaan tanpa konflik.

