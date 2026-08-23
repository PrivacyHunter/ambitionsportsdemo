import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { assertStaff } from "./admin.server";

type DB = SupabaseClient<Database>;

export async function fetchLandingPageContent() {
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
}

export async function fetchFooterContent() {
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("key", "footer_content")
    .single();
  
  if (data?.value) return JSON.parse(data.value);
  return {
    description: "Leading manufacturer of high-performance custom sportswear and activewear. Exporting excellence from Sialkot to the world.",
    copyright: "© 2026 Ambition Sports. All Rights Reserved.",
    newsletterTitle: "Newsletter",
    newsletterDescription: "Subscribe to get latest updates and new product launches."
  };
}

export async function updateLandingPageContent(supabase: DB, userId: string, data: any) {
  await assertStaff(supabase, userId);
  const { error } = await supabase
    .from("site_settings")
    .upsert({ 
      key: "landing_page_content", 
      value: JSON.stringify(data),
      updated_at: new Date().toISOString()
    });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateFooterContent(supabase: DB, userId: string, data: any) {
  await assertStaff(supabase, userId);
  const { error } = await supabase
    .from("site_settings")
    .upsert({ 
      key: "footer_content", 
      value: JSON.stringify(data),
      updated_at: new Date().toISOString()
    });
  if (error) throw new Error(error.message);
  return { ok: true };
}
