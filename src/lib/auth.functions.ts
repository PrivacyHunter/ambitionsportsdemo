import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getSession = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    
    if (!session?.user) return { user: null, role: null };

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    return {
      user: session.user,
      role: roleData?.role || 'user'
    };
  });

export const requireRole = (allowedRoles: string[]) => {
  return async (ctx: any) => {
    const session = await getSession();
    if (!session.user || !session.role || !allowedRoles.includes(session.role)) {
      throw new Error("Unauthorized");
    }
    return session;
  };
};
