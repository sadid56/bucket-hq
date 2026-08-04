# BucketHQ Monorepo

Welcome to the **BucketHQ** repository. This is a Turborepo-managed monorepo containing the web frontend and API services for BucketHQ.

---

## 📁 Repository Structure

- **`apps/web`**: The user-facing Next.js application.
- **`apps/api`**: The backend API service.
- **`packages/`**: Shared libraries and configurations used across applications (e.g., TS configurations, ESLint, UI components).

---

## ⚙️ Environment Variables Setup

These are the environment variables required to run the project. You must create appropriate local `.env` files (e.g., `.env.local` or `.env`) matching these formats in the root and individual apps.

### 1. Root Environment Variables (`/.env.local`)
Create a `.env.local` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://<username>:<password>@<host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://<username>:<password>@<host>:5432/postgres"

# Supabase Authentication & Storage Backend
SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# Master Encryption Key
# A 64-character hex string used for encrypting storage credentials and configurations
MASTER_ENCRYPTION_KEY="your-64-character-hex-string"
```

### 2. Web App Environment Variables (`/apps/web/.env`)
Create a `.env` file in the `apps/web/` directory:

```env
# Supabase Authentication (Client-side)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Backend API Endpoint
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

---

## 🛠️ Development & Building

### Prerequisites
Make sure you have [pnpm](https://pnpm.io/) installed:
```bash
npm install -g pnpm
```

### Install Dependencies
Run from the root of the project:
```bash
pnpm install
```

### Start Development Server
To run all applications in development mode simultaneously:
```bash
pnpm dev
```

To run only the web frontend:
```bash
pnpm dev --filter=web
```

To run only the backend API:
```bash
pnpm dev --filter=api
```

### Build Production Bundles
To build all applications and packages:
```bash
pnpm build
```
