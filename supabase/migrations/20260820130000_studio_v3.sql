-- Add styling and cover columns to customization_videos
ALTER TABLE public.customization_videos 
ADD COLUMN IF NOT EXISTS caption_style jsonb DEFAULT '{"fontSize": "text-base", "color": "white", "position": "bottom"}'::jsonb,
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS process_type text DEFAULT 'other';

-- Create table for Instagram integration
CREATE TABLE public.instagram_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    access_token text,
    user_id uuid REFERENCES auth.users(id),
    username text,
    is_connected boolean DEFAULT false,
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.instagram_settings TO authenticated;
GRANT ALL ON public.instagram_settings TO service_role;
ALTER TABLE public.instagram_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/Owners can manage instagram settings" ON public.instagram_settings
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

-- Instagram feed cache table
CREATE TABLE public.instagram_posts (
    id text PRIMARY KEY,
    media_url text NOT NULL,
    media_type text,
    caption text,
    permalink text,
    thumbnail_url text,
    timestamp timestamptz,
    category text,
    page_target text,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.instagram_posts TO anon, authenticated;
GRANT ALL ON public.instagram_posts TO service_role;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view instagram posts" ON public.instagram_posts
    FOR SELECT TO anon, authenticated USING (true);
