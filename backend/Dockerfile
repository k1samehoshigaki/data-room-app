FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

# --- Production dependencies only ---
FROM base AS deps
COPY backend/package.json ./
RUN npm install --omit=dev

# --- Build stage ---
FROM base AS builder
COPY backend/package.json ./
RUN npm install
COPY backend/ .
# Generate Prisma client BEFORE TypeScript compilation
RUN npx prisma generate
RUN npm run build

# --- Runtime stage ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY backend/package.json ./

EXPOSE 3002
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
