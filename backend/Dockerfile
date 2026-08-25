FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

# Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Build
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
