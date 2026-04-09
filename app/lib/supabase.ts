import { createClient } from "@supabase/supabase-js";

// ✅ Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 🚨 Fail fast if missing (this is IMPORTANT for Vercel)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// ✅ Create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);