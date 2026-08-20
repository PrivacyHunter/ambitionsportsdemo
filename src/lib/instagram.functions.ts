import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff, assertDeveloper } from "./admin.server";

// ... existing settings/reconnect/sync/retry functions ...

export const getInstagramMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    
    // Aggregate data
    const [logsRes, postsRes] = await Promise.all([
      (context.supabase as any).from("instagram_sync_logs").select("*").limit(100),
      (context.supabase as any).from("instagram_posts").select("id, last_synced_at, sync_status, last_sync_error").limit(1000)
    ]);

    const logs = logsRes.data || [];
    const posts = postsRes.data || [];
    
    const successful = logs.filter((l: any) => l.status === 'success');
    const failures = logs.filter((l: any) => l.status === 'error');
    
    return {
      total_syncs: logs.length,
      success_rate: logs.length ? (successful.length / logs.length) * 100 : 0,
      recent_failures: failures.slice(0, 10),
      posts_status: posts // Per-video sync status
    };
  });

// ... existing backfill/logs functions ...
