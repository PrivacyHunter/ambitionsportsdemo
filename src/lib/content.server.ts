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
