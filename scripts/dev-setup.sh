#!/bin/bash
set -e

echo "🚀 Setting up Atenas Backend Development Environment"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.dev.yaml up --build -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.dev.yaml exec app pnpm run migration:run

echo "✅ Development environment ready!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "🗄️  Database UI: http://localhost:8080"
echo "📊 Debug Port: 9229"
echo ""
echo "Commands:"
echo "  Start: docker-compose -f docker-compose.dev.yaml up"
echo "  Stop:  docker-compose -f docker-compose.dev.yaml down"
echo "  Logs:  docker-compose -f docker-compose.dev.yaml logs -f app"