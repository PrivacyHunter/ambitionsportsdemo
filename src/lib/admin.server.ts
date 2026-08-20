import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { AppRole } from "./roles";

type DB = SupabaseClient<Database>;

/** Highest role held by the user, resolved through RLS-scoped client. */
export async function resolveRole(supabase: DB, userId: string): Promise<AppRole> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as AppRole);
  if (roles.includes("developer")) return "developer";
  if (roles.includes("owner")) return "owner";
  if (roles.includes("admin")) return "admin";
  return "user";
}

export async function assertStaff(supabase: DB, userId: string): Promise<AppRole> {
  const role = await resolveRole(supabase, userId);
  if (role === "user") throw new Error("Forbidden: staff access required");
  return role;
}

export async function assertDeveloper(supabase: DB, userId: string): Promise<AppRole> {
  const role = await resolveRole(supabase, userId);
  if (role !== "developer") throw new Error("Forbidden: developer access required");
  return role;
}

export type StaffUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
};

/**
 * Owners/admins never receive developer accounts — they are invisible to them.
 */
export async function listAccounts(supabase: DB, callerRole: AppRole): Promise<StaffUser[]> {
  const [{ data: profiles }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name"),
    supabase.from("user_roles").select("user_id, role"),
  ]);

  const roleMap = new Map<string, AppRole[]>();
  for (const row of roleRows ?? []) {
    const list = roleMap.get(row.user_id) ?? [];
    list.push(row.role as AppRole);
    roleMap.set(row.user_id, list);
  }

  const highest = (roles: AppRole[]): AppRole =>
    roles.includes("developer")
      ? "developer"
      : roles.includes("owner")
        ? "owner"
        : roles.includes("admin")
          ? "admin"
          : "user";

  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: highest(roleMap.get(p.id) ?? []),
    }))
    // Strict developer masking: Developers are completely invisible to non-developers.
    .filter((u) => (callerRole === "developer" ? true : u.role !== "developer"));
}
