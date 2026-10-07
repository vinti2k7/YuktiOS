# Multi-stage Dockerfile for YuktiOS Application

# Stage 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package metadata
COPY package*.json ./

# Install dependencies (including devDependencies required for build)
RUN npm ci || npm install

# Copy application code
COPY . .

# Build Vite frontend & esbuild server
RUN npm run build

# Stage 2: Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package metadata & install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --production

# Copy compiled dist bundle from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start production Express server
CMD ["node", "dist/server.cjs"]
