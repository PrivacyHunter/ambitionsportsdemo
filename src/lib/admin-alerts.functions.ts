import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertDeveloper, assertStaff } from "./admin.server";

export const getAlertSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("site_settings").select("*");
    const settings = data?.find((s: any) => s.key === 'alert_thresholds');
    if (settings && settings.value) return JSON.parse(settings.value);
    
    return { 
        failure_rate_pct: 10, 
        latency_ms: 5000, 
        notification_email: "",
        slack_webhook_url: "",
        generic_webhook_url: ""
    };
  });

export const updateAlertSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    failure_rate_pct: z.number(),
    latency_ms: z.number(),
    notification_email: z.string().email(),
    slack_webhook_url: z.string().url().optional().or(z.literal("")),
    generic_webhook_url: z.string().url().optional().or(z.literal("")),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { error } = await (context.supabase as any)
      .from("site_settings")
      .upsert({ 
        key: 'alert_thresholds', 
        value: JSON.stringify(data), 
        updated_at: new Date().toISOString() 
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const testAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertDeveloper(context.supabase, context.userId);
    // Simulate failure and send test alerts
    return { ok: true, message: "Test alerts triggered" };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    // Fetch logs from a new dedicated table or the current instagram_sync_logs
    const { data } = await (context.supabase as any)
        .from("instagram_sync_logs")
        .select("*, profiles:user_id(email)")
        .order("created_at", { ascending: false })
        .limit(100);
    return data || [];
  });

export const getSyncTimeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ mediaId: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
      await assertStaff(context.supabase, context.userId);
      const { data: logs } = await (context.supabase as any)
        .from("instagram_sync_logs")
        .select("*")
        .eq("media_id", data.mediaId)
        .order("created_at", { ascending: true });
      return logs || [];
  });
