import { supabase } from "./supabase";

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

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userData.user.id)
    .single();

  if (error) {
    console.error("Profile fetch error:", error.message);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email ?? userData.user.email ?? null,
    full_name: data.full_name ?? null,
    role: String(data.role ?? "").toLowerCase() as UserRole,
  };
}

export function isInstaller(role?: string | null) {
  return String(role ?? "").toLowerCase() === "installer";
}

export function isAdmin(role?: string | null) {
  return String(role ?? "").toLowerCase() === "admin";
}

export function isStaff(role?: string | null) {
  return String(role ?? "").toLowerCase() === "staff";
}

export function isCustomer(role?: string | null) {
  return String(role ?? "").toLowerCase() === "customer";
}
