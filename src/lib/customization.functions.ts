import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MOCK_VIDEOS = [
  {
    id: "1",
    title: "Vibrant Sublimation",
    description: "Our high-definition sublimation process fuses ink directly into the fibers, ensuring colors that never fade, crack, or peel.",
    video_url: "https://player.vimeo.com/external/494163967.hd.mp4?s=97e1694f410c538749a5893a7e4362b667232e01&profile_id=175",
    display_order: 1,
    is_published: true,
    captions: [
      { start: 0, end: 3, text: "Welcome to our Sublimation Studio" },
      { start: 4, end: 8, text: "Where vibrant colors come to life" }
    ]
  },
  {
    id: "2",
    title: "Precision Heat Transfer",
    description: "Utilizing industrial-grade vinyl and 3D silicone transfers, we deliver sharp, professional logos and player numbers.",
    video_url: "https://player.vimeo.com/external/494164100.hd.mp4?s=1d5440a40d5884d5930e1c3a6b57904797686b2d&profile_id=175",
    display_order: 2,
    is_published: true
  }
];

export const getCustomizationVideos = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ all: z.boolean().optional() }).optional().parse(data))
  .handler(async ({ data: input }) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      let query = supabase.from('customization_videos' as any).select('*');
      
      if (!input?.all) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('display_order', { ascending: true });
      
      if (error || !data || data.length === 0) return MOCK_VIDEOS;
      return data;
    } catch (e) {
      return MOCK_VIDEOS;
    }
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
    captions_url: z.string().optional(),
    captions_raw: z.string().optional(),
    captions: z.array(z.object({
      start: z.number(),
      end: z.number(),
      text: z.string()
    })).optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Cleanup old storage file if video_url changed
    if (data.id) {
      const { data: old } = await supabase.from('customization_videos' as any).select('video_url').eq('id', data.id).single();
      if (old?.video_url && old.video_url !== data.video_url && old.video_url.includes('storage/v1/object/public/studio-assets')) {
        const path = old.video_url.split('studio-assets/')[1];
        if (path) await supabase.storage.from('studio-assets').remove([path]);
      }
    }

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
    
    // Cleanup storage
    const { data: old } = await supabase.from('customization_videos' as any).select('video_url').eq('id', data.id).single();
    if (old?.video_url && old.video_url.includes('storage/v1/object/public/studio-assets')) {
      const path = old.video_url.split('studio-assets/')[1];
      if (path) await supabase.storage.from('studio-assets').remove([path]);
    }

    const { error } = await supabase
      .from('customization_videos' as any)
      .delete()
      .eq('id', data.id);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const bulkActionCustomizationVideos = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    ids: z.array(z.string()),
    action: z.enum(['publish', 'unpublish', 'delete'])
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    if (data.action === 'delete') {
      // Cleanup storage for all
      const { data: videos } = await supabase.from('customization_videos' as any).select('video_url').in('id', data.ids);
      const paths = (videos || [])
        .map(v => v.video_url)
        .filter(url => url?.includes('storage/v1/object/public/studio-assets'))
        .map(url => url.split('studio-assets/')[1])
        .filter(Boolean);
      
      if (paths.length > 0) await supabase.storage.from('studio-assets').remove(paths);
      
      const { error } = await supabase.from('customization_videos' as any).delete().in('id', data.ids);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from('customization_videos' as any)
        .update({ is_published: data.action === 'publish' } as any)
        .in('id', data.ids);
      if (error) throw new Error(error.message);
    }
    
    return { success: true };
  });

export const trackVideoEngagement = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    video_id: z.string(),
    action: z.enum(['play', 'pause', 'watch_time']),
    value: z.number().optional(),
    visitor_id: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Log individual action
    await supabase.from('video_engagement' as any).insert([data]);

    // Update aggregate counts
    const column = data.action === 'play' ? 'total_plays' : data.action === 'pause' ? 'total_pauses' : 'total_time_watched';
    const increment = data.value || 1;

    // Use raw query for increment if RPC isn't recognized by TS types yet
    await supabase.from('customization_videos' as any)
      .update({ [column]: supabase.rpc('increment' as any, { row_id: data.video_id, amount: increment } as any) } as any)
      .eq('id', data.video_id);


    return { success: true };
  });

export const getEngagementStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase
      .from('customization_videos' as any)
      .select('id, title, total_plays, total_time_watched, total_pauses');
    return data || [];
  });
