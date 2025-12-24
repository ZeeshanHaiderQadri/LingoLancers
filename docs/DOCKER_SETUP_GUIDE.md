# 🐳 Docker Setup Guide for LingoLancers

## 📋 Prerequisites

### 1. Install Docker Desktop
- **Download**: https://www.docker.com/products/docker-desktop/
- **Choose**: Docker Desktop for Mac (Apple Silicon or Intel)
- **Install**: Follow the installation wizard
- **Requirements**: macOS 10.15 or later

### 2. Start Docker Desktop
```bash
# Open Docker Desktop application
# Wait for the whale icon 🐳 to appear in your menu bar
# The icon should be solid (not animated) when ready
```

### 3. Verify Installation
```bash
# Check Docker version
docker --version
# Should show: Docker version 24.x.x

# Check if Docker daemon is running
docker info
# Should show system information without errors
```

## 🚀 Starting LingoLancers

### Method 1: Automated Script (Recommended)
```bash
# Single command - handles everything
./start-production.sh
```

### Method 2: Manual Commands
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit with your API keys
nano .env

# 3. Build and start containers
docker-compose up --build -d

# 4. Check status
docker-compose ps
```

## 🔧 Common Docker Commands

### Container Management
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

### Troubleshooting
```bash
# Remove all containers and start fresh
docker-compose down -v
docker-compose up --build -d

# View detailed logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## ⚠️ Troubleshooting Common Issues

### Issue 1: "Docker is not running"
**Solution**: 
1. Open Docker Desktop app
2. Wait for whale icon in menu bar
3. Try command again

### Issue 2: "Port already in use"
**Solution**:
```bash
# Stop conflicting services
docker-compose down
# Or kill processes using ports 3000, 8000, 5432
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Issue 3: "Build failed"
**Solution**:
```bash
# Clean Docker cache
docker system prune -a
# Rebuild from scratch
docker-compose build --no-cache
```

### Issue 4: "Permission denied"
**Solution**:
```bash
# Make script executable
chmod +x start-production.sh
```

## 📊 Expected Startup Sequence

1. **Docker Check** ✅ (5 seconds)
2. **Environment Setup** ✅ (10 seconds)  
3. **Container Build** 🔨 (3-5 minutes first time)
4. **Service Startup** 🚀 (30 seconds)
5. **Health Checks** 🔍 (10 seconds)
6. **Ready!** 🎉

## 🌐 Access Points

After successful startup:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (internal)

## 💡 Pro Tips

1. **First Run**: Takes 3-5 minutes to build images
2. **Subsequent Runs**: Takes 30 seconds to start
3. **Development**: Use `docker-compose logs -f` to monitor
4. **Updates**: Run `docker-compose up --build -d` after code changes
5. **Clean Slate**: Use `docker-compose down -v` to reset everything

## 🆘 Need Help?

If you encounter issues:
1. Check Docker Desktop is running (whale icon in menu bar)
2. Verify ports 3000, 8000, 5432 are available
3. Ensure .env file has required API keys
4. Try `docker-compose down -v` and restart
5. Check logs with `docker-compose logs -f`