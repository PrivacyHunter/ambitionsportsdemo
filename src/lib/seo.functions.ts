import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff } from "./admin.server";

export const getPageSeo = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ path: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: res } = await client
      .from("page_content")
      .select("content")
      .eq("section", `seo:${data.path}`)
      .single();
    
    return res?.content ? JSON.parse(res.content) : null;
  });

export const savePageSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => 
    z.object({ 
      path: z.string(), 
      seo: z.object({
        title: z.string().max(100),
        description: z.string().max(250),
        ogImage: z.string().url().optional().or(z.literal("")),
      })
    }).parse(data)
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("page_content")
      .upsert({
        section: `seo:${data.path}`,
        content: JSON.stringify(data.seo),
        updated_at: new Date().toISOString(),
      }, { onConflict: "section" });
    
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
