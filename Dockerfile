FROM node:22-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

# Generate Prisma Client & Build Next.js
RUN pnpm prisma generate
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=base /app ./

EXPOSE 3000

CMD ["pnpm", "start"]
