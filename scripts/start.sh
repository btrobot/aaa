#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

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

echo "Running database migration..."
cd "${COZE_WORKSPACE_PATH}"
PGPASSWORD="${PGPASSWORD:-postgres}" PGDATABASE_URL="" npx drizzle-kit push --force 2>&1 || echo "⚠️ Database migration skipped"

echo "Seeding database..."
PGDATABASE_URL="" npx tsx scripts/seed.ts 2>&1 || echo "⚠️ Database seeding skipped"


start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    PORT=${DEPLOY_RUN_PORT} node dist/server.js
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
