import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff, assertDeveloper } from "./admin.server";

export const saveThemeVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    name: z.string().min(1),
    config: z.any(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("theme_versions" as any)
      .insert({
        name: data.name,
        config: data.config,
        created_by: context.userId
      } as any);
    if (error) throw error;
    return { success: true };
  });

export const getThemeHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("theme_versions" as any)
      .select("*, profiles:created_by(email)" as any)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  });

export const scheduleReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    name: z.string(),
    frequency: z.enum(["daily", "weekly", "monthly"]),
    recipient_email: z.string().email(),
    columns: z.array(z.string()),
    date_range_type: z.string(),
    format: z.enum(["pdf", "csv"])
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("scheduled_reports" as any)
      .insert(data as any);
    if (error) throw error;
    return { success: true };
  });
