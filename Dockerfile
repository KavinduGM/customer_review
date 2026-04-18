FROM node:22-slim AS base

# Install OS deps needed to build native modules (better-sqlite3) and run Prisma
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Dependencies stage — installs full deps (build needs devDeps for TS/tailwind)
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build stage — generates Prisma client and builds Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image — same base (slim), so Prisma engines stay compatible
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js standalone output (ships a trimmed node_modules of its own)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma schema + config, needed by `migrate deploy` at startup
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Prisma CLI + engines. Safe to copy because builder and runner share
# the same slim (glibc) base image. We skip the .bin/ shim because it's
# a symlink in the source; Docker would flatten it into a real file,
# detaching it from the .wasm assets in prisma/build/.
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Generated Prisma client
COPY --from=builder /app/src/generated ./src/generated

# Persistent data directory for SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
VOLUME ["/app/data"]

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/dev.db"

# Apply pending Prisma migrations, then boot the Next.js standalone server.
# Invoke the CLI via its real path so the bundled .wasm files resolve.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
