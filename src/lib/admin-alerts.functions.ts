import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertDeveloper } from "./admin.server";

export const getAlertSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("site_settings").select("*");
    const settings = data?.find((s: any) => s.key === 'alert_thresholds');
    if (settings && settings.value) return JSON.parse(settings.value);
    
    return { failure_rate_pct: 10, latency_ms: 5000, notification_email: "" };
  });

export const updateAlertSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    failure_rate_pct: z.number(),
    latency_ms: z.number(),
    notification_email: z.string().email(),
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

export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return [];
  });
