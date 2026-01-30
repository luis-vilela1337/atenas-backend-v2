#!/bin/bash
set -e

echo "🔄 Running database migrations..."
pnpm run migration:run

echo "🌱 Running database seed..."
pnpm run seed

echo "🚀 Starting application..."
exec pnpm run start:dev
