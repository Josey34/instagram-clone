# 🐋 Docker Multi-Stage Builds & Production Optimization Guide

> **Learning Journey**: From basic Dockerfiles to production-ready multi-stage builds

---

## 📚 Table of Contents

1. [What You Learned](#what-you-learned)
2. [Multi-Stage Builds Explained](#multi-stage-builds-explained)
3. [Client Setup (React + Vite)](#client-setup-react--vite)
4. [Server Setup (Node.js + Express)](#server-setup-nodejs--express)
5. [Production Docker Compose](#production-docker-compose)
6. [Runtime Environment Variables](#runtime-environment-variables)
7. [Health Checks](#health-checks)
8. [Best Practices Summary](#best-practices-summary)
9. [Commands Reference](#commands-reference)

---

## 🎯 What You Learned

### Before (Basic Knowledge)
- ✅ Single-stage Dockerfiles
- ✅ Basic commands (build, run)
- ✅ Docker Compose basics
- ✅ Development setups

### After (Advanced Skills)
- ✅ **Multi-stage builds** - Dramatically reduce image sizes
- ✅ **Production optimization** - Security, performance, size
- ✅ **Runtime environment injection** - Same image for all environments
- ✅ **Health checks** - Container monitoring and orchestration
- ✅ **Professional architecture** - Controllers, routes, proper structure

---

## 🏗️ Multi-Stage Builds Explained

### The Problem with Single-Stage Builds

```dockerfile
# ❌ Single-stage (Large image ~1GB)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Issues:**
- Includes ALL dependencies (dev + prod)
- Contains source code (security risk)
- Includes build tools (not needed at runtime)
- Result: **~1GB image**

### The Solution: Multi-Stage Builds

```dockerfile
# ✅ Multi-stage (Small image ~40MB)

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (This is the final image!)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Benefits:**
- ✅ Only built files in final image
- ✅ No source code
- ✅ No node_modules
- ✅ No build tools
- Result: **~40MB image** (25x smaller!)

### How It Works

```
┌─────────────────────────────────────────────┐
│  STAGE 1: Builder (Temporary - Discarded)   │
│  ┌────────────────────────────────────┐     │
│  │ Base: node:20-alpine               │     │
│  │ Install: ALL dependencies          │     │
│  │ Build: npm run build               │     │
│  │ Output: /app/dist                  │     │
│  └────────────────────────────────────┘     │
│                  │                           │
│                  │ COPY --from=builder       │
│                  ▼                           │
│  ┌────────────────────────────────────┐     │
│  │  STAGE 2: Production (Final Image) │     │
│  │  Base: nginx:alpine (~40MB)        │     │
│  │  Contains: ONLY /dist files        │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**Key Concept:** Stage 1 is completely thrown away! Only Stage 2 becomes the final image.

---

## 🎨 Client Setup (React + Vite)

### File: `client/Dockerfile`

```dockerfile
# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching optimization)
COPY package*.json ./

# Install ALL dependencies (needed for building)
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# STAGE 2: Production - Serve with Nginx
FROM nginx:alpine AS production

WORKDIR /usr/share/nginx/html

# Remove default nginx files
RUN rm -rf ./*

# Copy ONLY built files from builder stage
COPY --from=builder /app/dist .

# Copy nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

# Copy runtime environment injection script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Use custom entrypoint for env injection
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

### File: `client/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### File: `client/.dockerignore`

```
node_modules
dist
build
.git
.env.local
.env.development
.env.production
*.log
.vscode
Dockerfile
.dockerignore
```

**Why .dockerignore matters:**
- Prevents copying unnecessary files
- Speeds up builds (less data to copy)
- Reduces image size
- Improves security (doesn't copy secrets)

---

## 🚀 Server Setup (Node.js + Express)

### File: `server/Dockerfile`

```dockerfile
# STAGE 1: Install all dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm ci

# STAGE 2: Install production dependencies only
FROM node:20-alpine AS prod-dependencies

WORKDIR /app

COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# STAGE 3: Production runtime
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy ONLY production node_modules from stage 2
COPY --from=prod-dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
```

### Why 3 Stages for Node.js?

1. **Stage 1 (dependencies)**: For potential build steps
2. **Stage 2 (prod-dependencies)**: Clean production dependencies
3. **Stage 3 (production)**: Final runtime with security

**Result:** ~150MB instead of ~400MB

### File: `server/.dockerignore`

```
node_modules
.env*
.git
*.log
Dockerfile
.dockerignore
```

---

## 🐳 Production Docker Compose

### File: `docker-compose-prod.yml`

```yaml
version: "3.8"

networks:
  instagram-network:
    driver: bridge

services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
      target: production
    container_name: instagram-server
    restart: unless-stopped
    ports:
      - "5000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_APP_PASSWORD: ${EMAIL_APP_PASSWORD}
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3000}
    networks:
      - instagram-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      target: production
    container_name: instagram-client
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:5000/api
    depends_on:
      - server
    networks:
      - instagram-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Key Features:

- **Networks**: Isolated container communication
- **Health Checks**: Monitor container health
- **Restart Policies**: Auto-restart on failure
- **Dependencies**: Client waits for server
- **Environment Variables**: From `.env.production` file

---

## 🔧 Runtime Environment Variables

### The Problem

Vite bakes environment variables at **build time**:

```javascript
// Build time - value is hardcoded in bundle
const API_URL = import.meta.env.VITE_API_URL;
```

This means:
- ❌ Can't change API URL without rebuilding
- ❌ Same image can't work for dev/staging/prod

### The Solution: Runtime Injection

**File: `client/docker-entrypoint.sh`**

```bash
#!/bin/sh

# Generate config.js at container startup
cat <<EOF > /usr/share/nginx/html/config.js
window.ENV = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:3000/api}"
};
EOF

echo "Runtime config generated:"
cat /usr/share/nginx/html/config.js

# Start nginx
exec "$@"
```

**File: `client/index.html`**

```html
<head>
  <!-- Load config BEFORE app loads -->
  <script src="/config.js"></script>
</head>
```

**File: `client/src/api/axios.ts`**

```typescript
// Try runtime config first, then build-time, then default
const API_URL = (window as any).ENV?.VITE_API_URL ||
                import.meta.env.VITE_API_URL ||
                "http://localhost:3000/api";
```

### How It Works

```
Container Starts
      │
      ▼
docker-entrypoint.sh runs
      │
      ▼
Creates /config.js with runtime values
      │
      ▼
index.html loads config.js
      │
      ▼
window.ENV is available
      │
      ▼
React app reads window.ENV
```

**Result:** ✅ One image works for all environments!

---

## 🏥 Health Checks

Professional health check implementation with controller pattern.

### File: `server/controllers/healthController.js`

```javascript
import mongoose from 'mongoose';

export const getHealthStatus = async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        const healthData = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            database: {
                status: dbStatus,
                name: mongoose.connection.name
            },
            memory: {
                used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
            }
        };

        if (dbStatus !== 'connected') {
            return res.status(503).json({
                ...healthData,
                status: 'degraded'
            });
        }

        res.status(200).json(healthData);
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: error.message
        });
    }
};
```

### Endpoints:

- **GET /api/health** - Full health check
- **GET /api/health/liveness** - Is server running?
- **GET /api/health/readiness** - Is server ready?

---

## ✨ Best Practices Summary

### 1. Layer Caching Optimization

```dockerfile
# ✅ GOOD - Copy package.json first
COPY package*.json ./
RUN npm ci
COPY . .

# ❌ BAD - Copy everything first
COPY . .
RUN npm ci
```

**Why?** Package.json changes rarely, so Docker reuses the npm install layer.

### 2. Use .dockerignore

Always exclude:
- `node_modules` (install fresh in Docker)
- `.env*` files (security risk)
- `.git` directory
- Development files

### 3. Security: Non-Root Users

```dockerfile
# Create and use non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### 4. Multi-Stage for Size Reduction

- Client: 2 stages (build → serve)
- Server: 3 stages (deps → prod-deps → runtime)

### 5. Health Checks

Always implement health checks for:
- Docker Compose orchestration
- Kubernetes deployments
- Production monitoring

### 6. Environment Variables

- Build-time: ARG
- Runtime: ENV (preferred for flexibility)
- Use runtime injection for SPAs

### 7. Use Specific Base Images

```dockerfile
# ✅ GOOD - Specific version
FROM node:20.11.0-alpine

# ❌ BAD - Latest (unpredictable)
FROM node:latest
```

---

## 🎮 Commands Reference

### Building Images

```bash
# Build client
docker build -t instagram-client:prod ./client

# Build server
docker build -t instagram-server:prod ./server

# Build with docker-compose
docker-compose -f docker-compose-prod.yml build
```

### Running Containers

```bash
# Run single container with env vars
docker run -p 3000:80 -e VITE_API_URL=https://api.example.com instagram-client:prod

# Run with docker-compose
docker-compose -f docker-compose-prod.yml --env-file .env.production up

# Run in background
docker-compose -f docker-compose-prod.yml up -d
```

### Debugging

```bash
# View logs
docker logs instagram-server
docker-compose -f docker-compose-prod.yml logs -f

# Execute commands in container
docker exec -it instagram-server sh

# Check health status
docker ps
docker inspect instagram-server | grep -i health

# Test health endpoint
curl http://localhost:5000/api/health
```

### Image Management

```bash
# List images
docker images

# Check image size
docker images | grep instagram

# Remove unused images
docker image prune

# Inspect image layers
docker history instagram-client:prod
```

### Docker Compose

```bash
# Start services
docker-compose -f docker-compose-prod.yml up

# Rebuild and start
docker-compose -f docker-compose-prod.yml up --build

# Stop services
docker-compose -f docker-compose-prod.yml down

# View service status
docker-compose -f docker-compose-prod.yml ps

# View resource usage
docker stats
```

---

## 🎓 Key Takeaways

1. **Multi-stage builds** can reduce image size by 20-30x
2. **Layer caching** speeds up rebuilds dramatically
3. **Runtime env injection** enables one image for all environments
4. **Health checks** are essential for production
5. **Non-root users** improve container security
6. **.dockerignore** is as important as .gitignore
7. **Production optimization** is about size, security, and performance

---

## 📊 Before vs After Comparison

| Aspect | Before (Single-Stage) | After (Multi-Stage) |
|--------|----------------------|---------------------|
| Client Image Size | ~1GB | ~40MB |
| Server Image Size | ~400MB | ~150MB |
| Security | Root user | Non-root user |
| Environment Vars | Build-time only | Runtime injection |
| Health Checks | None | Professional implementation |
| Production Ready | ❌ No | ✅ Yes |

---

## 🚀 Next Steps

To continue learning:

1. **Container orchestration**: Learn Kubernetes
2. **CI/CD**: Automate builds with GitHub Actions
3. **Security scanning**: Use tools like Trivy, Snyk
4. **Monitoring**: Implement Prometheus + Grafana
5. **Multi-architecture**: Build for ARM and x86
6. **Docker secrets**: Manage sensitive data securely

---

**Happy Dockerizing! 🐋**
