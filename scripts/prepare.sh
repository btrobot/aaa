#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only
if command -v coze > /dev/null 2>&1 && coze check-bins --help > /dev/null 2>&1; then
  coze check-bins --fix
fi

echo "Running database migration..."
PGPASSWORD="${PGPASSWORD:-postgres}" npx drizzle-kit push --force 2>&1 || echo "⚠️ Database migration skipped (may not be available in this environment)"

echo "Seeding database..."
npx tsx scripts/seed.ts 2>&1 || echo "⚠️ Database seeding skipped (may not be available in this environment)"
