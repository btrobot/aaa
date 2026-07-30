#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Setting up PostgreSQL..."
if ! command -v psql > /dev/null 2>&1; then
  apt-get update -qq && apt-get install -y -qq postgresql postgresql-client 2>&1 | tail -3
fi
if ! pg_isready -q 2>/dev/null; then
  pg_lsclusters 2>/dev/null | head -1 | awk '{print "pg_ctlcluster "$1" "$2" start"}' | bash 2>/dev/null || \
    su - postgres -c "pg_ctl -D /var/lib/postgresql/*/main start" 2>/dev/null || true
  sleep 2
fi
su - postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\" 2>/dev/null" || true
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname = 'nodecoda'\" | grep -q 1 || createdb nodecoda" 2>/dev/null || true

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only
if command -v coze > /dev/null 2>&1 && coze check-bins --help > /dev/null 2>&1; then
  coze check-bins --fix
fi

echo "Running database migration..."
PGPASSWORD="${PGPASSWORD:-postgres}" PGDATABASE_URL="" npx drizzle-kit push --force 2>&1 || echo "⚠️ Database migration skipped (may not be available in this environment)"

echo "Seeding database..."
PGDATABASE_URL="" npx tsx scripts/seed.ts 2>&1 || echo "⚠️ Database seeding skipped (may not be available in this environment)"
