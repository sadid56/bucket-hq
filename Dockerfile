FROM node:22-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --filter api...

COPY packages/database ./packages/database

# Generate Prisma Client
RUN pnpm --filter @repo/database generate

COPY apps/api ./apps/api

RUN pnpm --filter api --prod --legacy deploy /app/deploy


FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=base /app/deploy ./

COPY --from=base /app/packages/database/generated ./node_modules/@repo/database/generated

# Expose API port
EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

# Run using tsx
CMD ["npx", "tsx", "src/server.ts"]
