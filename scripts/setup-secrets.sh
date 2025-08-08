#!/bin/bash
# scripts/setup-secrets.sh
# Auto-generate and sync AUTH_SECRET across all services
# This script will create a shared AUTH_SECRET and update all service .env.local files

set -e  # Exit on any error

# make this script executable
# chmod +x scripts/setup-secrets.sh
# run the script
# ./scripts/setup-secrets.sh

# Generate one secret
SECRET=$(openssl rand -base64 32)

echo "🔑 Generated shared AUTH_SECRET: $SECRET"
echo ""

# Update all service env files
echo "📝 Updating service environment files..."

# Service A
sed -i '' "s|^AUTH_SECRET=.*|AUTH_SECRET=\"$SECRET\"|" service-a/.env.local

# Service B
sed -i '' "s|^AUTH_SECRET=.*|AUTH_SECRET=\"$SECRET\"|" service-b/.env.local

# Service C
sed -i '' "s|^AUTH_SECRET=.*|AUTH_SECRET=\"$SECRET\"|" service-c/.env.local

echo "✅ All services now use the same AUTH_SECRET"
echo "🚀 SSO is ready to work!"