# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install system dependencies required for building
RUN apk add --no-cache \
    python3 \
    python3-dev \
    py3-pip \
    py3-setuptools \
    make \
    g++ \
    sqlite-dev

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies and rebuild sqlite3
RUN yarn install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    python3-dev \
    py3-pip \
    py3-setuptools \
    make \
    g++ \
    sqlite-dev

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Rebuild sqlite3 in builder stage
RUN cd node_modules/sqlite3 && yarn rebuild --build-from-source && cd ../..

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN yarn build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install production dependencies
RUN apk add --no-cache sqlite sqlite-dev

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/lib/db/schema.sql ./src/lib/db/schema.sql
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create data directory for SQLite and set permissions
RUN mkdir -p /data/db && \
    chown -R node:node /data/db

# Switch to non-root user
USER node

# Set volume mount point
VOLUME /data/db

# Expose port
EXPOSE 3000

# Create an entrypoint script for database initialization
COPY --chown=node:node --from=builder /app/scripts/init-db.sh ./scripts/init-db.sh
RUN chmod +x ./scripts/init-db.sh

# Start the application with database initialization
CMD ["sh", "-c", "./scripts/init-db.sh && node scripts/create-admin.js && node server.js"] 