#!/bin/bash

# LingoLancers Production Startup Script

echo "🚀 Starting LingoLancers Production Environment"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "📥 Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    echo "🍎 For macOS: Download Docker Desktop for Mac"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker Desktop is not running!"
    echo "🚀 Please start Docker Desktop first:"
    echo "   1. Open Docker Desktop application"
    echo "   2. Wait for the whale icon to appear in menu bar"
    echo "   3. Then run this script again"
    exit 1
fi

echo "✅ Docker Desktop is running"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys before continuing."
    echo "   Required keys: AZURE_OPENAI_API_KEY, AZURE_SPEECH_KEY, GEMINI_API_KEY"
    exit 1
fi

# Build and start services
echo "🔨 Building Docker containers..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check database
if docker-compose exec -T database pg_isready -U lingo_user > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready"
fi

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is ready"
else
    echo "❌ Backend is not ready"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is ready"
else
    echo "❌ Frontend is not ready"
fi

echo ""
echo "🎉 LingoLancers is starting up!"
echo "================================"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "📋 Useful commands:"
echo "   docker-compose logs -f          # View logs"
echo "   docker-compose down             # Stop services"
echo "   docker-compose restart backend  # Restart backend"
echo ""
echo "🔧 To stop: docker-compose down"