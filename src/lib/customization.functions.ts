import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getCustomizationVideos = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from('customization_videos' as any)
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  });

export const upsertCustomizationVideo = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    video_url: z.string(),
    thumbnail_url: z.string().optional(),
    display_order: z.number().optional(),
    is_published: z.boolean().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase
      .from('customization_videos' as any)
      .upsert({
        ...data,
        updated_at: new Date().toISOString(),
      } as any);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteCustomizationVideo = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase
      .from('customization_videos' as any)
      .delete()
      .eq('id', data.id);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });
