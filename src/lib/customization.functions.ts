import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MOCK_VIDEOS = [
  {
    id: "1",
    title: "Vibrant Sublimation",
    description: "Our high-definition sublimation process fuses ink directly into the fibers, ensuring colors that never fade, crack, or peel.",
    video_url: "https://player.vimeo.com/external/494163967.hd.mp4?s=97e1694f410c538749a5893a7e4362b667232e01&profile_id=175",
    display_order: 1,
    is_published: true
  },
  {
    id: "2",
    title: "Precision Heat Transfer",
    description: "Utilizing industrial-grade vinyl and 3D silicone transfers, we deliver sharp, professional logos and player numbers.",
    video_url: "https://player.vimeo.com/external/494164100.hd.mp4?s=1d5440a40d5884d5930e1c3a6b57904797686b2d&profile_id=175",
    display_order: 2,
    is_published: true
  },
  {
    id: "3",
    title: "Advanced Bed Operator",
    description: "Our automated bed operating systems ensure perfect fabric alignment and cutting precision.",
    video_url: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27dbcc6a7604051065961d9006450682022830e&profile_id=165",
    display_order: 3,
    is_published: true
  },
  {
    id: "4",
    title: "Premium Embroidery",
    description: "Traditional craftsmanship meets modern technology with high-stitch-density crests and text.",
    video_url: "https://player.vimeo.com/external/394333068.sd.mp4?s=78465d336a992634d101037303f26ca4c5520e7d&profile_id=165",
    display_order: 4,
    is_published: true
  }
];

export const getCustomizationVideos = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from('customization_videos' as any)
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error || !data || data.length === 0) return MOCK_VIDEOS;
      return data;
    } catch (e) {
      console.error("Failed to fetch videos from DB, using mocks", e);
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
