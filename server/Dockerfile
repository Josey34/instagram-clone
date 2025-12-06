# STAGE 1: Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for potential build steps)
RUN npm ci

# STAGE 2: Production dependencies only
FROM node:20-alpine AS prod-dependencies

WORKDIR /app

COPY package*.json ./

# Install ONLY production dependencies (no devDependencies)
RUN npm ci --only=production

# STAGE 3: Production
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from stage 2
COPY --from=prod-dependencies /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]