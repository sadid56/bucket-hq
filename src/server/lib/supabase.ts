import { createClient } from "@supabase/supabase-js";
import { env } from "@/server/config/env";

let supabaseAdmin: ReturnType<typeof createClient>;

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}
