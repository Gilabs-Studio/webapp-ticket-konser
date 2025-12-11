# Docker Setup - Quick Reference

## Quick Start

### Development

```bash
cd apps/api
make dev-up
```

### Production

```bash
cd apps/api

# 1. Generate secrets
make secrets

# 2. Set DB_PASSWORD from secrets file (required for PostgreSQL)
export DB_PASSWORD=$(cat secrets/db_password.txt)

# 3. Start production
make prod-up
```

## Secrets Management

### Generate Secrets

```bash
make secrets
```

This creates:

- `secrets/jwt_secret.txt` - JWT secret (64 chars)
- `secrets/db_password.txt` - Database password (32 chars)
- `secrets/db_user.txt` - Database user (default: postgres)

### Using Secrets in Production

**For PostgreSQL**: Since PostgreSQL image doesn't support Docker secrets natively, you need to export `DB_PASSWORD` from the secrets file:

```bash
export DB_PASSWORD=$(cat secrets/db_password.txt)
docker compose -f docker-compose.prod.yml up -d
```

**For API**: API automatically reads from Docker secrets:

- `JWT_SECRET_FILE=/run/secrets/jwt_secret`
- `DB_PASSWORD_FILE=/run/secrets/db_password`

## Environment Variables

### Production Environment Variables

Before running production, set these environment variables:

```bash
export DB_USER=postgres  # or read from secrets/db_user.txt
export DB_PASSWORD=$(cat secrets/db_password.txt)  # REQUIRED
export DB_NAME=ticketing_app
export DB_PORT=5435
export API_PORT=8083
export DB_SSLMODE=require
export JWT_ACCESS_TTL=24
export JWT_REFRESH_TTL=7
```

Or create a `.env.prod` file:

```env
DB_USER=postgres
DB_PASSWORD=<read from secrets/db_password.txt>
DB_NAME=ticketing_app
DB_PORT=5435
API_PORT=8083
DB_SSLMODE=require
JWT_ACCESS_TTL=24
JWT_REFRESH_TTL=7
```

Then load it:

```bash
export $(cat .env.prod | xargs)
make prod-up
```

## Security Notes

1. **Never commit secrets** - `secrets/` folder is in `.gitignore`
2. **JWT Secret** - Must be at least 32 characters (64 recommended)
3. **DB Password** - Use strong password from `secrets/db_password.txt`
4. **Production** - Always use Docker secrets for sensitive data

## Troubleshooting

### "DB_PASSWORD is required"

Set the environment variable:

```bash
export DB_PASSWORD=$(cat secrets/db_password.txt)
```

### "Secrets not found"

Generate secrets first:

```bash
make secrets
```

### Health check fails

Check logs:

```bash
make prod-logs
# or
docker compose -f docker-compose.prod.yml logs api
```
