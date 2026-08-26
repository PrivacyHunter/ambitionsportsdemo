import { supabase } from "@/integrations/supabase/client";

export type MediaFolder = "banners" | "products" | "studio";

/** Stable public URL for a file stored in one of the private media buckets. */
export function mediaUrl(bucket: string, path: string) {
  return `/api/public/media/${bucket}/${path}`;
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
}

/** Uploads an image or video from the admin panel and returns its public URL. */
export async function uploadMedia(file: File, folder: MediaFolder, bucket = "site-media") {
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return mediaUrl(bucket, path);
}

export function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export async function copyToClipboard(value: string) {
  const absolute = value.startsWith("http") ? value : `${window.location.origin}${value}`;
  await navigator.clipboard.writeText(absolute);
  return absolute;
}

export function downloadUrl(url: string, filename?: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || url.split("/").pop() || "download";
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
