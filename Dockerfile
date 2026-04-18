FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js (produces .next/standalone)
RUN npm run build

# Production image — use slim (glibc) instead of alpine (musl) to avoid
# Prisma engine compatibility headaches.
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema + config (needed for `migrate deploy` at startup)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Install Prisma fresh in the runner so the engine binaries match this
# image's libc, instead of copying possibly-incompatible files from builder.
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Regenerate the Prisma client against the correct engines for this image
RUN npx prisma generate

# Persistent data directory for SQLite. Mount a volume here in production
# so the database survives container restarts and redeploys.
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
VOLUME ["/app/data"]

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Default DB location points at the persistent volume. Override at runtime
# (e.g. `-e DATABASE_URL=...`) if you switch to Postgres or a managed DB.
ENV DATABASE_URL="file:/app/data/dev.db"

# Apply any pending Prisma migrations, then boot the Next.js standalone server.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
