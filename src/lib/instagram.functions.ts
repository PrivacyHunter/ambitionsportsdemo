import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff, assertDeveloper } from "./admin.server";

export const getInstagramSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("instagram_settings")
      .select("*")
      .maybeSingle();
    return data;
  });

export const updateInstagramSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    access_token: z.string().optional(),
    instagram_user_id: z.string().optional(),
    username: z.string().optional(),
    is_connected: z.boolean().optional(),
    auto_publish: z.boolean().optional(),
    caption_language: z.string().optional(),
    token_expires_at: z.string().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { data: existing } = await context.supabase
      .from("instagram_settings")
      .select("id, webhook_verify_token")
      .maybeSingle();

    const patch: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
    if (!existing?.webhook_verify_token) {
      patch["webhook_verify_token"] = crypto.randomUUID().replace(/-/g, "");
    }
    if (existing?.id) patch["id"] = existing.id;

    const { error } = await (context.supabase as any).from("instagram_settings").upsert(patch);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** One-click re-auth: swap in a fresh long-lived token and clear the error state. */
export const reconnectInstagram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ access_token: z.string().min(10) }).parse(data))
  .handler(async ({ context, data }) => {
    await assertDeveloper(context.supabase, context.userId);
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(data.access_token)}`,
    );
    const profile: any = await profileRes.json().catch(() => ({}));
    if (!profileRes.ok || !profile?.id) {
      throw new Error(profile?.error?.message ?? "Instagram rejected this token");
    }

    const { data: existing } = await context.supabase
      .from("instagram_settings")
      .select("id, webhook_verify_token")
      .maybeSingle();

    const { error } = await (context.supabase as any).from("instagram_settings").upsert({
      ...(existing?.id ? { id: existing.id } : {}),
      access_token: data.access_token,
      instagram_user_id: String(profile.id),
      username: profile.username ?? null,
      is_connected: true,
      last_sync_status: "success",
      last_sync_error: null,
      token_expires_at: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
      webhook_verify_token: existing?.webhook_verify_token ?? crypto.randomUUID().replace(/-/g, ""),
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true, username: profile.username as string | null };
  });

export const getInstagramPosts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
    const client = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: any, init: any) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data } = await client
      .from("instagram_posts")
      .select("*")
      .eq("is_visible", true)
      .order("timestamp", { ascending: false });
    return data || [];
  });

/** Converts an Instagram caption into timed WebVTT cues for the chosen subtitle language. */
export function captionToVtt(caption: string, language = "en"): string {
  const lines = caption
    .replace(/#[^\s#]+/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = (s: number) => `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}.000`;
  const cues = lines.map((line, i) => `${i + 1}\n${stamp(i * 4)} --> ${stamp(i * 4 + 4)}\n${line}`);
  return [`WEBVTT - ${language}`, "", ...cues].join("\n\n");
}

export const mapCaptionToSubtitles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    postId: z.string(),
    videoId: z.string(),
    language: z.string().default("en"),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: post } = await context.supabase
      .from("instagram_posts")
      .select("caption")
      .eq("id", data.postId)
      .maybeSingle();
    if (!post?.caption) throw new Error("This post has no caption text to convert");

    const vtt = captionToVtt(post.caption, data.language);
    const { error } = await (context.supabase as any)
      .from("customization_videos")
      .update({ captions_raw: vtt, updated_at: new Date().toISOString() })
      .eq("id", data.videoId);
    if (error) throw new Error(error.message);
    return { ok: true, vtt };
  });

type Media = {
  id: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  caption?: string;
  thumbnail_url?: string;
  timestamp?: string;
};

/** Idempotent write: media_hash unique index guarantees a post can never land twice. */
export async function upsertMedia(supabase: any, items: Media[], source: string) {
  if (!items.length) return 0;
  const rows = items.map((m) => ({
    id: m.id,
    media_type: m.media_type ?? null,
    media_url: m.media_url ?? null,
    permalink: m.permalink ?? null,
    caption: m.caption ?? null,
    thumbnail_url: m.thumbnail_url ?? null,
    timestamp: m.timestamp ?? new Date().toISOString(),
    media_hash: `ig:${m.id}`,
    source,
  }));
  const { error } = await supabase
    .from("instagram_posts")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: false });
  if (error) throw new Error(error.message);
  return rows.length;
}

export async function fetchMedia(token: string, mediaId?: string): Promise<Media[]> {
  const fields = "id,media_type,media_url,permalink,caption,thumbnail_url,timestamp";
  const url = mediaId
    ? `https://graph.instagram.com/${mediaId}?fields=${fields}&access_token=${encodeURIComponent(token)}`
    : `https://graph.instagram.com/me/media?fields=${fields}&limit=25&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error?.message ?? "Instagram API request failed");
    (err as any).code = json?.error?.code ?? res.status;
    throw err;
  }
  return mediaId ? [json as Media] : ((json?.data ?? []) as Media[]);
}

function adviceFor(code: unknown, message: string): string {
  if (String(code) === "190" || /token/i.test(message)) {
    return "Access token expired or revoked — use One-Click Reconnect to re-authorise.";
  }
  if (String(code) === "4" || /limit/i.test(message)) return "Rate limited by Instagram — retry in a few minutes.";
  if (/not connected/i.test(message)) return "Connect an Instagram Business account first.";
  return "Retry the sync; if it keeps failing, verify the account is a Business/Creator account.";
}

export const syncInstagramPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { mediaId?: string } | undefined) => data ?? {})
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const sb = context.supabase as any;
    let settings: any = null;
    try {
      const res = await context.supabase.from("instagram_settings").select("*").maybeSingle();
      settings = res.data;
      if (!settings?.is_connected || !settings?.access_token) throw new Error("Instagram not connected");

      const items = await fetchMedia(settings.access_token, data?.mediaId);
      const count = await upsertMedia(sb, items, data?.mediaId ? "retry" : "manual");

      await sb.from("instagram_settings").update({
        last_sync: new Date().toISOString(),
        last_sync_status: "success",
        last_sync_error: null,
      }).eq("id", settings.id);

      await sb.from("instagram_sync_logs").insert({
        status: "success",
        message: `Published ${count} media item(s) (duplicates skipped)`,
        posts_synced: count,
        media_id: data?.mediaId ?? null,
        payload: { items: items.map((i) => i.id) },
        resolved: true,
        user_id: context.userId,
      });

      return { ok: true, synced: count };
    } catch (err: any) {
      const message = err?.message ?? "Unknown error";
      await sb.from("instagram_sync_logs").insert({
        status: "error",
        message,
        media_id: data?.mediaId ?? null,
        error_code: String(err?.code ?? ""),
        recommended_action: adviceFor(err?.code, message),
        payload: { mediaId: data?.mediaId ?? null },
        user_id: context.userId,
      });
      if (settings?.id) {
        await sb.from("instagram_settings")
          .update({ last_sync_status: "error", last_sync_error: message })
          .eq("id", settings.id);
      }
      throw new Error(message);
    }
  });

export const retrySyncLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ logId: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const sb = context.supabase as any;
    const { data: log } = await sb.from("instagram_sync_logs").select("*").eq("id", data.logId).maybeSingle();
    if (!log) throw new Error("Log entry not found");

    const { data: settings } = await context.supabase.from("instagram_settings").select("*").maybeSingle();
    if (!settings?.access_token) throw new Error("Instagram not connected");

    try {
      const items = await fetchMedia(settings.access_token, log.media_id ?? undefined);
      const count = await upsertMedia(sb, items, "retry");
      await sb.from("instagram_sync_logs").update({ resolved: true }).eq("id", data.logId);
      await sb.from("instagram_sync_logs").insert({
        status: "success",
        message: `Manual retry recovered ${count} item(s)`,
        posts_synced: count,
        media_id: log.media_id,
        resolved: true,
        user_id: context.userId,
      });
      return { ok: true, synced: count };
    } catch (err: any) {
      const message = err?.message ?? "Retry failed";
      await sb.from("instagram_sync_logs").insert({
        status: "error",
        message,
        media_id: log.media_id,
        error_code: String(err?.code ?? ""),
        recommended_action: adviceFor(err?.code, message),
        payload: log.payload ?? {},
        user_id: context.userId,
      });
      throw new Error(message);
    }
  });

export const getInstagramLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data } = await (context.supabase as any)
      .from("instagram_sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return data || [];
  });
