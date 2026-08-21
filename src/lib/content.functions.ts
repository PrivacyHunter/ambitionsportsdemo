import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff } from "./admin.server";

export const getLandingPageContent = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("key", "landing_page_content")
      .single();
    
    if (data?.value) return JSON.parse(data.value);
    return {
      hero: {
        ctaText: "I have approved the plan",
        title: "Unleash Your Ambition"
      }
    };
  });

export const saveLandingPageContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    hero: z.object({
      ctaText: z.string().min(1),
      title: z.string().min(1)
    })
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ 
        key: "landing_page_content", 
        value: JSON.stringify(data),
        updated_at: new Date().toISOString()
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
