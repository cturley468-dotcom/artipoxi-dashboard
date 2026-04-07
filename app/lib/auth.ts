import { supabase } from "../lib/supabase";

export type UserRole = "admin" | "staff" | "installer" | "customer";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
};

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  return data as Profile | null;
}