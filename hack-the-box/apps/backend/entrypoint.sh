#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Seeding skipped (may already exist)"

echo "🚀 Starting application..."
npm run start:prod
