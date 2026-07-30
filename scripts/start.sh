#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

echo "Running database migration..."
cd "${COZE_WORKSPACE_PATH}"
PGPASSWORD="${PGPASSWORD:-postgres}" npx drizzle-kit push --force 2>&1 || echo "⚠️ Database migration skipped"

echo "Seeding database..."
npx tsx scripts/seed.ts 2>&1 || echo "⚠️ Database seeding skipped"


start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    PORT=${DEPLOY_RUN_PORT} node dist/server.js
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
