import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: z.string().email() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    const { error } = await (supabaseAdmin as any)
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          status: "active",
          email_status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );

    if (error) throw new Error(error.message);

    return { ok: true };
  });
