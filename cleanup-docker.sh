#!/bin/bash

echo "🧹 Docker Cleanup - Removing Old Images"
echo "======================================"

# Stop all containers first
echo "🛑 Stopping all containers..."
docker-compose down

# Remove unused images (keeps current ones)
echo "🗑️ Removing unused images..."
docker image prune -f

# Remove dangling images
echo "🗑️ Removing dangling images..."
docker image prune -a -f

# Show current images
echo "📊 Current Docker images:"
docker images

echo ""
echo "✅ Docker cleanup complete!"
echo "🚀 Restart with: ./start-production.sh"