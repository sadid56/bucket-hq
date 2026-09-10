import { PrismaClient } from "../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as {
  prisma: PrismaClient;
  pgPool: Pool;
};

const pool =
  globalForDb.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.prisma = prisma;
}

export * from "../../prisma/generated/client";
export * from "../../prisma/generated/enums";
