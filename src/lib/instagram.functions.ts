import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff, assertDeveloper } from "./admin.server";

export const getInstagramSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("instagram_settings")
      .select("*")
      .single();
    return data;
  });

export const updateInstagramSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    access_token: z.string().optional(),
    instagram_user_id: z.string().optional(),
    username: z.string().optional(),
    is_connected: z.boolean().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("instagram_settings")
      .upsert({
        access_token: data.access_token ?? null,
        instagram_user_id: data.instagram_user_id ?? null,
        username: data.username ?? null,
        is_connected: data.is_connected ?? null,
        updated_at: new Date().toISOString()
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getInstagramPosts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(
      process.env["VITE_SUPABASE_URL"]!,
      process.env["VITE_SUPABASE_ANON_KEY"]!,
    );
    const { data } = await client
      .from("instagram_posts")
      .select("*")
      .eq("is_visible", true)
      .order("timestamp", { ascending: false });
    return data || [];
  });

export const syncInstagramPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    // In a real implementation, this would call the Instagram Graph API
    // For now, we simulate a sync by updating the last_sync timestamp
    const { error } = await context.supabase
      .from("instagram_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("is_connected", true);
    if (error) throw new Error("Sync failed: " + error.message);
    return { ok: true };
  });
