import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  MASTER_ENCRYPTION_KEY: z.string().default("8940e934d2d23f9573175915172d0a3e2034a0eb1302a9d9b76a9067a9a1c9b4"),
  DEFAULT_URL_TTL: z.coerce.number().default(900),
});

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  DIRECT_URL: process.env.DIRECT_URL || "",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET || "",
  MASTER_ENCRYPTION_KEY: process.env.MASTER_ENCRYPTION_KEY || "8940e934d2d23f9573175915172d0a3e2034a0eb1302a9d9b76a9067a9a1c9b4",
  DEFAULT_URL_TTL: Number(process.env.DEFAULT_URL_TTL) || 900,
};
