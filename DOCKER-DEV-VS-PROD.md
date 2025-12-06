# 🔄 Development vs Production Docker Setup

Complete guide for using different Docker configurations for dev and prod.

---

## 📋 Files Overview

### **Production Files** (Multi-stage, Optimized)
- `client/Dockerfile` - 2-stage build with nginx
- `server/Dockerfile` - 3-stage build with prod deps only
- `docker-compose-prod.yml` - Production orchestration
- `.env.production` - Production environment variables

### **Development Files** (Hot Reload, Fast Iteration)
- `client/Dockerfile.dev` - Simple dev server
- `server/Dockerfile.dev` - Nodemon with hot reload
- `docker-compose.dev.yml` - Development orchestration with volume mounts
- `.env.development` - Development environment variables

---

## 🔍 Key Differences Explained

### **1. Client Dockerfile Comparison**

#### **Production (`client/Dockerfile`)**
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
RUN npm ci
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist .
# Result: ~40MB optimized static files
```

**Features:**
- ✅ Optimized static build
- ✅ Served with nginx
- ✅ Tiny image size (~40MB)
- ❌ No hot reload
- ❌ Requires rebuild for changes

#### **Development (`client/Dockerfile.dev`)**
```dockerfile
# Single stage, simple
FROM node:20-alpine
RUN npm install
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
# Result: ~800MB with all dev tools
```

**Features:**
- ✅ Vite dev server with HMR
- ✅ Instant hot reload
- ✅ Full debugging tools
- ❌ Larger image (~800MB)
- ❌ Not optimized

---

### **2. Server Dockerfile Comparison**

#### **Production (`server/Dockerfile`)**
```dockerfile
# 3 stages
FROM node:20-alpine AS dependencies
FROM node:20-alpine AS prod-dependencies
FROM node:20-alpine AS production
COPY --from=prod-dependencies /app/node_modules
USER nodejs  # Non-root user
CMD ["npm", "start"]
```

**Features:**
- ✅ Only prod dependencies
- ✅ Non-root user (security)
- ✅ Smaller image (~150MB)
- ❌ No hot reload
- ❌ Harder to debug

#### **Development (`server/Dockerfile.dev`)**
```dockerfile
# Single stage
FROM node:20-alpine
RUN npm install  # All dependencies including nodemon
CMD ["npm", "run", "dev"]
```

**Features:**
- ✅ Nodemon with hot reload
- ✅ All dev dependencies
- ✅ Easy debugging
- ✅ Runs as root (easier volumes)
- ❌ Larger image (~300MB)

---

### **3. Docker Compose Comparison**

#### **Production (`docker-compose-prod.yml`)**
```yaml
services:
  server:
    build:
      target: production  # Use production stage
    restart: unless-stopped  # Auto-restart
    healthcheck: ...  # Monitor health
    # NO volumes - files are copied into image
```

**Features:**
- ✅ Health checks
- ✅ Restart policies
- ✅ Optimized images
- ✅ Production-ready
- ❌ Requires rebuild for code changes

#### **Development (`docker-compose.dev.yml`)**
```yaml
services:
  server:
    build:
      dockerfile: Dockerfile.dev  # Use dev Dockerfile
    volumes:
      - ./server:/app  # Mount source code
      - /app/node_modules  # Exclude node_modules
    command: npm run dev  # Nodemon
```

**Features:**
- ✅ Volume mounting (instant code sync)
- ✅ Hot reload (nodemon/vite)
- ✅ Fast iteration
- ✅ No rebuild needed
- ❌ Not production-ready

---

## 🚀 How to Use

### **Development Workflow**

**1. Create `.env.development` file:**
```bash
cp .env.development.example .env.development
# Edit with your dev values
```

**2. Start development environment:**
```bash
docker-compose -f docker-compose.dev.yml --env-file .env.development up
```

**3. Access your app:**
- Frontend (Vite): http://localhost:5173
- Backend API: http://localhost:5000/api

**4. Make code changes:**
- Edit files in `client/` or `server/`
- Changes are instantly reflected (hot reload)
- No rebuild needed! 🎉

**5. Stop development:**
```bash
docker-compose -f docker-compose.dev.yml down
```

---

### **Production Workflow**

**1. Create `.env.production` file:**
```bash
cp .env.production.example .env.production
# Edit with your production values
```

**2. Build and start production environment:**
```bash
docker-compose -f docker-compose-prod.yml --env-file .env.production up --build
```

**3. Access your app:**
- Frontend (nginx): http://localhost:3000
- Backend API: http://localhost:5000/api

**4. For code changes:**
- Edit code
- **Must rebuild:** `docker-compose -f docker-compose-prod.yml up --build`

**5. Stop production:**
```bash
docker-compose -f docker-compose-prod.yml down
```

---

## 📊 Feature Comparison Table

| Feature | Development | Production |
|---------|-------------|------------|
| **Hot Reload** | ✅ Yes (Vite HMR, Nodemon) | ❌ No |
| **Volume Mounting** | ✅ Yes (instant sync) | ❌ No (copied) |
| **Image Size** | ~1GB total | ~200MB total |
| **Build Time** | Fast (~1 min) | Slow (~3-5 min) |
| **Rebuild on Change** | ❌ No | ✅ Yes |
| **Security** | Basic | ✅ Hardened |
| **Debugging** | ✅ Easy | Limited |
| **Health Checks** | ❌ No | ✅ Yes |
| **Auto-restart** | ❌ No | ✅ Yes |
| **node_modules** | In container | In container |
| **Source Code** | Mounted from host | Copied into image |

---

## 🎯 Volume Mounting Explained

### **Why This Pattern?**

```yaml
volumes:
  - ./server:/app        # Mount source code
  - /app/node_modules    # DON'T mount node_modules
```

**Problem without exclusion:**
- Your local `node_modules` (Windows/Mac) might be incompatible with container (Linux)
- Different OS, different binaries

**Solution:**
1. Mount source code: `./server:/app`
2. Exclude node_modules: `/app/node_modules`
3. Container uses its own `node_modules` (installed during build)

**Result:**
- ✅ Code changes sync instantly
- ✅ Dependencies work correctly
- ✅ No OS compatibility issues

---

## 🐛 Debugging Tips

### **Development**

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Access container shell
docker exec -it instagram-server-dev sh

# Restart a service
docker-compose -f docker-compose.dev.yml restart server

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

### **Production**

```bash
# Check health status
docker ps

# View health check logs
docker inspect instagram-server | grep -i health

# Test health endpoint
curl http://localhost:5000/api/health

# View resource usage
docker stats
```

---

## 🔧 Common Issues & Solutions

### **Issue: "Changes not reflecting in development"**

**Solution:**
```bash
# Ensure volumes are mounted correctly
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

### **Issue: "Port already in use"**

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :5173
# Kill the process or change port in docker-compose
```

### **Issue: "node_modules conflicts"**

**Solution:**
```bash
# Delete local node_modules
rm -rf client/node_modules server/node_modules
# Let Docker handle dependencies
docker-compose -f docker-compose.dev.yml up --build
```

### **Issue: "Slow hot reload on Windows"**

**Solution:**
- Use WSL2 (Windows Subsystem for Linux)
- Store project files in WSL filesystem, not Windows
- Much faster file watching

---

## 📝 Best Practices

### **Development**
1. ✅ Use `.env.development` with safe defaults
2. ✅ Don't commit `.env.development` (use `.example`)
3. ✅ Mount source code with volumes
4. ✅ Use `npm install` (not `npm ci`) for flexibility
5. ✅ Keep dev environment simple

### **Production**
1. ✅ Use `.env.production` with real secrets
2. ✅ Never commit `.env.production`
3. ✅ Use multi-stage builds
4. ✅ Use `npm ci` for deterministic builds
5. ✅ Implement health checks
6. ✅ Run as non-root user
7. ✅ Use specific image versions (not `latest`)

---

## 🎓 When to Use Each

### **Use Development Setup When:**
- 👨‍💻 Actively coding
- 🐛 Debugging issues
- 🔄 Need instant feedback
- 🧪 Testing new features
- 📚 Learning and experimenting

### **Use Production Setup When:**
- 🚀 Deploying to staging/production
- 📦 Testing production build
- 🎯 Performance testing
- 🔒 Security testing
- 📊 Load testing

---

## 🚀 Quick Reference

### **Start Development**
```bash
docker-compose -f docker-compose.dev.yml up
```

### **Start Production**
```bash
docker-compose -f docker-compose-prod.yml up --build
```

### **Stop Development**
```bash
docker-compose -f docker-compose.dev.yml down
```

### **Stop Production**
```bash
docker-compose -f docker-compose-prod.yml down
```

### **Rebuild Everything**
```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose-prod.yml up --build
```

---

## 📈 Workflow Diagram

```
Development Workflow:
┌─────────────────────────────────────────────┐
│ 1. Edit code in VSCode                      │
│                                             │
│ 2. Save file                                │
│    ↓                                        │
│ 3. Volume sync to container (instant)       │
│    ↓                                        │
│ 4. Nodemon/Vite detects change              │
│    ↓                                        │
│ 5. Auto-reload (hot module replacement)     │
│    ↓                                        │
│ 6. See changes in browser (1-2 seconds)     │
└─────────────────────────────────────────────┘

Production Workflow:
┌─────────────────────────────────────────────┐
│ 1. Edit code in VSCode                      │
│                                             │
│ 2. Save and commit to git                   │
│    ↓                                        │
│ 3. Rebuild Docker image (3-5 minutes)       │
│    ↓                                        │
│ 4. Multi-stage optimization                 │
│    ↓                                        │
│ 5. Small production image created           │
│    ↓                                        │
│ 6. Deploy to staging/production             │
└─────────────────────────────────────────────┘
```

---

## 🎉 Summary

**Development = Speed & Convenience**
- Hot reload, instant feedback
- Easy debugging
- Don't care about image size

**Production = Optimization & Security**
- Small images, fast deployment
- Security hardened
- Production-ready

**Use both!** Switch based on your needs! 🚀
