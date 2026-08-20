import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff } from "./admin.server";

export const connectInstagram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    accessToken: z.string(),
    username: z.string(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("instagram_settings" as any)
      .upsert({
        user_id: context.userId,
        access_token: data.accessToken,
        username: data.username,
        is_connected: true,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "user_id" } as any);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getInstagramSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("instagram_settings" as any)
      .select("*")
      .single();
    return data;
  });

export const syncInstagramPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    // In a real app, we would call the Instagram Graph API here.
    // For now, we'll simulate syncing by adding mock data if the table is empty.
    const { data: existing } = await context.supabase.from("instagram_posts" as any).select("id").limit(1);
    
    if (!existing || existing.length === 0) {
      const mockPosts = [
        {
          id: "insta_1",
          media_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
          media_type: "IMAGE",
          caption: "Elite performance gear for the ambitious athlete. #AmbitionSports #Sportswear",
          permalink: "https://instagram.com",
          timestamp: new Date().toISOString(),
          category: "sportswear",
          page_target: "home"
        },
        {
          id: "insta_2",
          media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
          media_type: "IMAGE",
          caption: "Precision manufacturing at its finest. #AmbitionStudio #Manufacturing",
          permalink: "https://instagram.com",
          timestamp: new Date().toISOString(),
          category: "customization",
          page_target: "customization"
        }
      ];
      await context.supabase.from("instagram_posts" as any).insert(mockPosts as any);
    }
    
    return { success: true };
  });

export const getInstagramPosts = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ 
    page: z.string().optional(),
    category: z.string().optional()
  }).optional().parse(data))
  .handler(async ({ data: input }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { persistSession: false } }
    );
    
    let query = supabase.from("instagram_posts").select("*");
    if (input?.page) query = query.eq("page_target", input.page);
    if (input?.category) query = query.eq("category", input.category);
    
    const { data } = await query.order("timestamp", { ascending: false });
    return data || [];
  });

export const updateInstagramPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string(),
    page_target: z.string().optional(),
    category: z.string().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("instagram_posts" as any)
      .update({
        page_target: data.page_target,
        category: data.category,
      } as any)
      .eq("id", data.id);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteInstagramPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("instagram_posts" as any)
      .delete()
      .eq("id", data.id);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });
