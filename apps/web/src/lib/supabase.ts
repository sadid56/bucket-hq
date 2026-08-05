import { createBrowserClient } from "@supabase/ssr";
import { ENV } from "@/config/env";

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

// Initialize the Supabase Client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


