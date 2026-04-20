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

# Minimal npm install of prisma@<same as package.json> so the CLI gets a complete
# dependency tree (effect, c12, etc.). Copying only prisma/ and @prisma/ from the
# builder omits hoisted packages and breaks `prisma migrate deploy` at runtime.
FROM base AS prisma-cli
WORKDIR /install
RUN npm init -y && npm install prisma@7.7.0

# Production image
FROM base AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build (includes the minimal node_modules Next bundles)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Merge full Prisma CLI dependency tree (includes effect, c12, deepmerge-ts, …)
COPY --from=prisma-cli /install/node_modules/ ./node_modules/

# Copy Prisma schema + config (needed for `migrate deploy` at startup)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy generated Prisma client
COPY --from=builder /app/src/generated ./src/generated

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
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
