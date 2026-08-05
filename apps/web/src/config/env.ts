export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
