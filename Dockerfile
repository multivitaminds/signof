# Multi-stage build: frontend + server
# Stage 1: Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build server
FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ .
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS production
WORKDIR /app

# Install production dependencies only
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built server
COPY --from=server-build /app/server/dist ./server/dist
COPY server/src/db/migrations ./server/src/db/migrations

# Copy built frontend (served as static files)
COPY --from=frontend-build /app/dist ./dist

# Create data directory
RUN mkdir -p /app/data

# Non-root user
RUN addgroup -g 1001 -S orchestree && \
    adduser -S orchestree -u 1001 -G orchestree && \
    chown -R orchestree:orchestree /app
USER orchestree

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "server/dist/index.js"]
