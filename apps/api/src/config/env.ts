import { z } from "zod";
import chalk from "chalk";

const envSchema = z.object({
  PORT: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 4000)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string({ required_error: "DATABASE_URL is required" }).min(1),
  SUPABASE_URL: z.string({ required_error: "SUPABASE_URL is required" }).min(1),
  SUPABASE_ANON_KEY: z.string({ required_error: "SUPABASE_ANON_KEY is required" }).min(1),
  SUPABASE_JWT_SECRET: z.string().optional(),
  MASTER_ENCRYPTION_KEY: z.string({ required_error: "MASTER_ENCRYPTION_KEY is required" }).length(64, "MASTER_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"),
  DEFAULT_URL_TTL: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 900)),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function validateEnv(): Env {
  if (env) return env;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const getTimestamp = () => chalk.gray(new Date().toLocaleTimeString());
    console.error(
      `[${getTimestamp()}] ${chalk.red.bold("🚨 [Env Config Error]")} Invalid environment variables:`
    );

    parsed.error.errors.forEach((err) => {
      console.error(
        `  - ${chalk.yellow(err.path.join("."))}: ${chalk.red(err.message)}`
      );
    });

    process.exit(1);
  }

  env = parsed.data;
  return env;
}

export { env };
