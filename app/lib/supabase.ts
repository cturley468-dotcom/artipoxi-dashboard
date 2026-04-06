import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tgliigvbzpuqdgebwjof.supabase.co";
const supabaseAnonKey = "sb_publishable_Mug9HiXqfXonXHN8Vhczxg_fwXOGbv_";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);