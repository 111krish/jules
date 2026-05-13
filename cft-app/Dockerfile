# Stage 1: Base
FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# Stage 3: Build the application and generate SQLite DB
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Create and seed the SQLite database inside the builder stage
# so it gets baked into the Docker image as the default starting state.
RUN npx prisma db push
RUN node prisma/seed.js

# Build the Next.js application
RUN npm run build

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy generated Prisma artifacts and the baked SQLite database
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create docker entrypoint just to start the server (DB is already pushed/seeded)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV DATABASE_URL="file:/app/prisma/dev.db"

ENTRYPOINT ["./docker-entrypoint.sh"]
