#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Running database migration..."
PGPASSWORD="${PGPASSWORD:-postgres}" npx drizzle-kit push --force 2>&1 || echo "⚠️ Database migration skipped"

echo "Seeding database..."
npx tsx scripts/seed.ts 2>&1 || echo "⚠️ Database seeding skipped"

echo "Building the Next.js project..."
pnpm next build

echo "Bundling server with tsup..."
pnpm tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

echo "Build completed successfully!"
