.PHONY: help build run test clean deps secrets validate-secrets dev-up dev-down prod-up prod-down build-prod logs security-scan

help:
	@echo "Available commands:"
	@echo "  make secrets          - Generate Docker secrets"
	@echo "  make validate-secrets - Validate secrets exist and meet requirements"
	@echo "  make dev-up          - Start development environment"
	@echo "  make dev-down        - Stop development environment"
	@echo "  make dev-logs        - Show development logs"
	@echo "  make prod-up         - Start production environment"
	@echo "  make prod-down       - Stop production environment"
	@echo "  make prod-logs       - Show production logs"
	@echo "  make build-prod      - Build production images with build info"
	@echo "  make build           - Build the application"
	@echo "  make run             - Run the application"
	@echo "  make test            - Run tests"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make deps            - Download dependencies"
	@echo "  make security-scan   - Run security scans on images"

# Build the application
build:
	go build -o server ./cmd/server/main.go

# Run the application
run:
	go run cmd/server/main.go

# Run tests
test:
	go test ./...

# Clean build artifacts
clean:
	rm -f server
	go clean

# Download dependencies
deps:
	go mod download
	go mod tidy

# Generate Docker secrets
secrets:
	@chmod +x scripts/generate-secrets.sh
	@./scripts/generate-secrets.sh

# Validate secrets
validate-secrets:
	@echo "Validating secrets..."
	@if [ ! -f "./secrets/jwt_secret.txt" ]; then \
		echo "❌ ERROR: jwt_secret.txt not found. Run 'make secrets' first."; \
		exit 1; \
	fi
	@if [ $$(wc -c < ./secrets/jwt_secret.txt | tr -d ' ') -lt 32 ]; then \
		echo "❌ ERROR: JWT secret must be at least 32 characters"; \
		exit 1; \
	fi
	@if [ ! -f "./secrets/db_password.txt" ]; then \
		echo "❌ ERROR: db_password.txt not found. Run 'make secrets' first."; \
		exit 1; \
	fi
	@if [ ! -f "./secrets/db_user.txt" ]; then \
		echo "❌ ERROR: db_user.txt not found. Run 'make secrets' first."; \
		exit 1; \
	fi
	@echo "✅ All secrets validated"

# Development environment
dev-up:
	docker compose up -d

dev-down:
	docker compose down

dev-logs:
	docker compose logs -f

# Production environment
prod-up: validate-secrets
	@echo "Starting production environment..."
	docker compose -f docker-compose.prod.yml up -d

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

# Build production images
build-prod: validate-secrets
	@echo "Building production images with build info..."
	@export BUILD_VERSION=$$(git describe --tags --always 2>/dev/null || echo "dev-$$(date +%s)") && \
	export BUILD_TIME=$$(date -u +%Y-%m-%dT%H:%M:%SZ) && \
	export BUILD_COMMIT=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
	docker compose -f docker-compose.prod.yml build --no-cache

# Security scan (optional, requires trivy)
security-scan:
	@echo "Running security scans..."
	@if command -v trivy &> /dev/null; then \
		trivy image ticketing-api:latest || true; \
	else \
		echo "⚠ Trivy not installed. Install from https://aquasecurity.github.io/trivy/"; \
	fi

