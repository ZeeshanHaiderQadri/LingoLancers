#!/bin/bash

echo "🔍 Checking Docker Deployment Status..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check container status
echo "📦 Container Status:"
docker-compose ps --format "table {{.Name}}\t{{.Status}}"
echo ""

# Check health endpoints
echo "🏥 Health Checks:"
echo ""

echo "Backend (http://localhost:8000):"
BACKEND_STATUS=$(curl -s http://localhost:8000/health | python3 -c "import sys, json; print(json.load(sys.stdin)['status'])" 2>/dev/null)
if [ "$BACKEND_STATUS" = "healthy" ]; then
    echo "  ✅ Backend is healthy"
else
    echo "  ❌ Backend is not responding"
fi

echo ""
echo "Frontend (http://localhost:3000):"
FRONTEND_STATUS=$(curl -s http://localhost:3000/api/health | python3 -c "import sys, json; print(json.load(sys.stdin)['status'])" 2>/dev/null)
if [ "$FRONTEND_STATUS" = "healthy" ]; then
    echo "  ✅ Frontend is healthy"
else
    echo "  ❌ Frontend is not responding"
fi

echo ""
echo "Database (PostgreSQL):"
if docker exec lingo_database pg_isready -U lingo_user > /dev/null 2>&1; then
    echo "  ✅ Database is ready"
else
    echo "  ❌ Database is not ready"
fi

echo ""
echo "🌐 Access URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
