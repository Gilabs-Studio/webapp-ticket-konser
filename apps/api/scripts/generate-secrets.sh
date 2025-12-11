#!/bin/bash

# Script to generate Docker secrets for production
# Usage: ./scripts/generate-secrets.sh

set -e

SECRETS_DIR="./secrets"
mkdir -p "$SECRETS_DIR"

# Generate JWT Secret (64 characters for strong security)
if [ ! -f "$SECRETS_DIR/jwt_secret.txt" ]; then
    echo "Generating JWT secret..."
    if command -v openssl &> /dev/null; then
        openssl rand -base64 48 | tr -d "=+/" | cut -c1-64 > "$SECRETS_DIR/jwt_secret.txt"
    else
        # Fallback if openssl is not available
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1 > "$SECRETS_DIR/jwt_secret.txt"
    fi
    chmod 600 "$SECRETS_DIR/jwt_secret.txt"
    echo "✓ JWT secret generated"
else
    echo "⚠ JWT secret already exists, skipping..."
fi

# Generate DB User
if [ ! -f "$SECRETS_DIR/db_user.txt" ]; then
    echo "postgres" > "$SECRETS_DIR/db_user.txt"
    chmod 600 "$SECRETS_DIR/db_user.txt"
    echo "✓ DB user created"
else
    echo "⚠ DB user already exists, skipping..."
fi

# Generate DB Password (32 characters)
if [ ! -f "$SECRETS_DIR/db_password.txt" ]; then
    echo "Generating DB password..."
    if command -v openssl &> /dev/null; then
        openssl rand -base64 24 | tr -d "=+/" | cut -c1-32 > "$SECRETS_DIR/db_password.txt"
    else
        # Fallback if openssl is not available
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1 > "$SECRETS_DIR/db_password.txt"
    fi
    chmod 600 "$SECRETS_DIR/db_password.txt"
    echo "✓ DB password generated"
else
    echo "⚠ DB password already exists, skipping..."
fi

echo ""
echo "✅ All secrets generated in $SECRETS_DIR/"
echo "⚠ IMPORTANT: Add $SECRETS_DIR/ to .gitignore and never commit these files!"

