import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type DB = SupabaseClient<Database>;

export type BannerInput = {
  id?: string | undefined;
  title1: string;
  title2: string;
  subtitle: string;
  image_url: string;
  accent: string;
  cta_label: string;
  cta_url: string;
  secondary_label: string;
  secondary_url: string;
  sort_order: number;
  is_active: boolean;
  status: string;
  scheduled_publish_at?: string | null | undefined;
};

export async function fetchBanners(supabase: DB) {
  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveBanner(supabase: DB, input: BannerInput) {
  const now = new Date().toISOString();
  const row = {
    ...input,
    scheduled_publish_at: input.scheduled_publish_at || null,
    published_at: input.status === "published" ? now : null,
    updated_at: now,
  };
  const { data, error } = await supabase
    .from("hero_banners")
    .upsert(row as any)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function removeBanner(supabase: DB, id: string) {
  const { error } = await supabase.from("hero_banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderBannerRows(supabase: DB, ids: string[]) {
  for (const [index, id] of ids.entries()) {
    const { error } = await supabase
      .from("hero_banners")
      .update({ sort_order: (index + 1) * 10, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
}

/** Public, anon-readable slides for the live site. */
export async function fetchPublishedBanners() {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await client
    .from("hero_banners")
    .select("id, title1, title2, subtitle, image_url, accent, cta_label, cta_url, secondary_label, secondary_url")
    .eq("is_active", true)
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

/** Public, anon-readable catalog for the live site. */
export async function fetchPublishedProducts(options: { category?: string | undefined; featuredOnly?: boolean | undefined }) {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  let query = client
    .from("products")
    .select("id, name, slug, category, description, price, currency, images, cover_image, is_featured")
    .eq("is_active", true)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (options.category) query = query.eq("category", options.category);
  if (options.featuredOnly) query = query.eq("is_featured", true);

  const { data } = await query;
  return data ?? [];
}
