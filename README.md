# BucketHQ

**BucketHQ** is a unified cloud storage management platform. Connect and manage **AWS S3**, **Cloudflare R2**, and **Cloudinary** storage buckets through a single, secure dashboard with pre-signed URLs, path-level team access controls, and comprehensive audit logging.

Built as a consolidated **Next.js 16** application with full end-to-end type safety powered by **oRPC**.

---

## ⚡ Architecture Highlights

- **Single Consolidated Application**: Eliminated monorepo and standalone Express API server architecture. Everything runs directly within Next.js.
- **Full oRPC API Layer**: All backend APIs are written with [oRPC](https://orpc.dev) (`@orpc/server`), exposing procedures through Next.js Route Handlers (`/api/rpc/[[...rest]]`).
- **End-to-End Type Safety**: Client and server share types seamlessly without code duplication or manual type synchronizations.
- **Enterprise Storage Adapters**: Native drivers for AWS S3, Cloudflare R2, and Cloudinary with AES-256-GCM encrypted credential storage.
- **Role & Path-Based Access Control**: Organization-level permissions (`OWNER`, `EDITOR`, `VIEWER`) and fine-grained folder/path restrictions per connection.
- **Audit Trails**: Full tracking of object signing (upload/download), deletion, and team operations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Route Handlers)
- **Frontend**: React 19, [Chakra UI v3](https://chakra-ui.com/), [Lucide React](https://lucide.dev/), [TanStack Query v5](https://tanstack.com/query)
- **API & RPC**: [oRPC](https://orpc.dev/) (`@orpc/server`, `@orpc/client`, `@orpc/tanstack-query`)
- **Database & ORM**: PostgreSQL, [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg`
- **Auth**: [Supabase](https://supabase.com/) Auth & `@supabase/ssr`
- **Storage SDKs**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `cloudinary`
- **Security**: Node.js `crypto` (AES-256-GCM encryption for stored credentials)

---

## 📁 Project Structure

```text
bucket-hq/
├── prisma/
│   └── schema.prisma              # Database schema & models
├── prisma.config.ts               # Prisma 7 configuration
├── public/                        # Static assets & icons
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Landing page, docs, privacy, terms
│   │   ├── admin/                 # Global admin dashboards & audit logs
│   │   ├── api/rpc/[[...rest]]/   # oRPC Next.js Route Handler
│   │   ├── auth/                  # Login, signup, callback, reset-password
│   │   └── dashboard/             # Team workspaces, explorer, connections
│   ├── components/                # Shared UI elements, layouts, theme
│   ├── features/                  # Feature-specific components
│   │   ├── admin/                 # User management, audit logs, system stats
│   │   ├── auth/                  # Auth forms and social login
│   │   ├── connections/           # Bucket connections & configuration forms
│   │   ├── dashboard/             # Dashboard overview
│   │   ├── explorer/              # File manager (list/grid, upload, preview)
│   │   ├── settings/              # Workspace settings
│   │   └── team/                  # Member list & path-level restrictions
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # oRPC client, Supabase client
│   ├── react-query/               # TanStack Query hooks wired to oRPC
│   ├── server/                    # Server runtime logic
│   │   ├── db.ts                  # Prisma Client singleton
│   │   ├── config/env.ts          # Server environment configuration
│   │   ├── lib/                   # Supabase admin, Cloudinary, mailer
│   │   ├── services/storage/      # S3, Cloudflare R2, Cloudinary adapters
│   │   ├── utils/                 # AES-256 encryption, path normalizer
│   │   └── orpc/                  # oRPC backend implementation
│   │       ├── base.ts            # Base, authed, admin, & org procedures
│   │       ├── context.ts         # Request context & auth token validation
│   │       ├── router.ts          # Root oRPC router
│   │       └── routers/           # Domain routers (user, org, conn, etc.)
│   ├── styles/                    # Global CSS styles
│   └── proxy.ts                   # Route protection & role enforcement
├── Dockerfile                     # Multi-stage production Dockerfile
├── next.config.ts                 # Next.js configuration
├── package.json                   # Consolidated dependencies & scripts
└── tsconfig.json                  # TypeScript configuration
```

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the project root:

```env
# Database Connection (Supabase / PostgreSQL)
DATABASE_URL="postgresql://<username>:<password>@<host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://<username>:<password>@<host>:5432/postgres"

# Supabase Authentication
SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# Master Encryption Key
# 64-character hex string (32 bytes) used for AES-256-GCM encryption of storage credentials
MASTER_ENCRYPTION_KEY="your-64-character-hex-string"
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: >= 20.19 (Node 22 recommended)
- **pnpm**: >= 9.0 (`npm install -g pnpm`)

### 2. Install Dependencies
```bash
pnpm install
```
*(The `postinstall` script will automatically generate the Prisma Client).*

### 3. Database Sync
To push the schema to your database:
```bash
pnpm db:push
```
Or to view database tables in Prisma Studio:
```bash
pnpm db:studio
```

### 4. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The oRPC endpoint is served at `/api/rpc`.

---

## 📦 Production & Deployment

### Build the Application
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Docker Deployment
Build and run using Docker:
```bash
docker build -t bucket-hq .
docker run -p 3000:3000 --env-file .env.local bucket-hq
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server on port 3000 |
| `pnpm build` | Generates Prisma Client and creates an optimized Next.js production build |
| `pnpm start` | Runs the compiled Next.js production server |
| `pnpm check-types` | Validates TypeScript types across the entire project |
| `pnpm lint` | Runs Next.js ESLint checks |
| `pnpm db:generate` | Regenerates the Prisma Client |
| `pnpm db:push` | Pushes the Prisma schema to the database |
| `pnpm db:migrate` | Runs Prisma development migrations |
| `pnpm db:studio` | Launches Prisma Studio GUI |
