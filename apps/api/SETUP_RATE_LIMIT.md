# Rate Limiting Setup

## Dependency Required

Untuk menggunakan rate limiting middleware, install dependency berikut:

```bash
cd apps/api
go get golang.org/x/time/rate
```

## Usage

Rate limiting middleware sudah diimplementasikan di:
- `internal/api/middleware/rate_limit.go`

Middleware ini sudah diterapkan pada check-in endpoints di:
- `internal/api/routes/checkin/routes.go`

## Configuration

Rate limiting untuk check-in endpoints:
- **Rate**: 5 requests per second
- **Burst**: 10 requests
- **Cleanup**: Every 1 minute
- **Visitor Expiration**: 5 minutes

## Headers

Rate limit middleware akan menambahkan headers berikut:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests (estimated)
- `X-RateLimit-Reset`: Unix timestamp when rate limit resets

## Error Response

Ketika rate limit exceeded, API akan mengembalikan:
- HTTP Status: 429 Too Many Requests
- Error Code: `RATE_LIMIT_EXCEEDED`
- Response body sesuai dengan API response standards

