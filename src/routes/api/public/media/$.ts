import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_BUCKETS = ["site-media", "studio-assets"] as const;

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = String((params as Record<string, string>)["_splat"] ?? "");
        const [bucket, ...rest] = splat.split("/");
        const path = rest.join("/");

        if (!bucket || !path || !ALLOWED_BUCKETS.includes(bucket as any)) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);

        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
