import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertDeveloper,
  assertStaff,
  listAccounts,
  resolveRole,
} from "./admin.server";

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => ({
    userId: context.userId,
    role: await resolveRole(context.supabase, context.userId),
  }));

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await assertStaff(context.supabase, context.userId);
    const s = context.supabase;
    const [inquiries, quotes, orders, products, tracking] = await Promise.all([
      s.from("inquiries").select("*").order("created_at", { ascending: false }).limit(50),
      s.from("quotes").select("*").order("created_at", { ascending: false }).limit(50),
      s.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
      s.from("products").select("*").order("sort_order", { ascending: true }),
      s.from("user_tracking").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    return {
      role,
      inquiries: inquiries.data ?? [],
      quotes: quotes.data ?? [],
      orders: orders.data ?? [],
      products: products.data ?? [],
      tracking: role === "user" ? [] : (tracking.data ?? []),
      accounts: await listAccounts(s, role),
    };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["owner", "admin", "developer", "user"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    // Only developers may allocate roles at all, and only they touch developer rows.
    await assertDeveloper(context.supabase, context.userId);
    const s = context.supabase;
    await s.from("user_roles").delete().eq("user_id", data.userId);
    if (data.role !== "user") {
      const { error } = await s.from("user_roles").insert({ user_id: data.userId, role: data.role });
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const saveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ key: z.string().min(1).max(120), value: z.string().max(20000) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await client.from("site_settings").select("key, value");
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(2).max(160),
        slug: z.string().min(2).max(160).regex(/^[a-z0-9-]+$/),
        category: z.enum(["sportswear", "activewear", "casualwear"]),
        description: z.string().max(4000).optional().default(""),
        price: z.number().nonnegative().optional(),
        stock: z.number().int().nonnegative().default(0),
        images: z.array(z.string().url()).max(8).default([]),
        sizes: z.array(z.string().max(12)).max(20).default([]),
        colors: z.array(z.string().max(24)).max(20).default([]),
        is_featured: z.boolean().default(false),
        is_active: z.boolean().default(true),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { id, price, ...rest } = data;
    const row = {
      ...rest,
      ...(id ? { id } : {}),
      ...(price === undefined ? {} : { price }),
      updated_at: new Date().toISOString(),
    };
    const { error } = await context.supabase
      .from("products")
      .upsert(row, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        table: z.enum(["inquiries", "quotes", "orders"]),
        id: z.string().uuid(),
        status: z.string().min(2).max(40),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from(data.table)
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        email: z.string().email(),
        role: z.enum(["owner", "admin", "developer", "user"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendInvitationEmail } = await import("./email.server");

    // Check if user exists in auth
    const { data: { users }, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    if (fetchError) throw fetchError;
    
    let targetUser = users.find(u => u.email === data.email);
    let userId = targetUser?.id;

    if (!userId) {
      // Create user if they don't exist
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Set role
    await context.supabase.from("user_roles").delete().eq("user_id", userId);
    if (data.role !== "user") {
      const { error } = await context.supabase.from("user_roles").insert({ user_id: userId, role: data.role });
      if (error) throw new Error(error.message);
    }

    // Send email
    await sendInvitationEmail({
      email: data.email,
      role: data.role,
    });

    return { ok: true as const };
  });

export const backupSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: settings } = await context.supabase.from("site_settings").select("*");
    const { data: seo } = await context.supabase.from("page_content").select("*").eq("section_key", "seo");
    
    return {
      settings: settings || [],
      seo: seo || [],
      timestamp: new Date().toISOString(),
      version: "1.0",
    };
  });

export const restoreSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    settings: z.array(z.any()),
    seo: z.array(z.any()),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertDeveloper(context.supabase, context.userId);
    const s = context.supabase;

    for (const item of data.settings) {
      await s.from("site_settings").upsert({ key: item.key, value: item.value }, { onConflict: "key" });
    }

    for (const item of data.seo) {
      const { page, section_key, title, body, sort_order } = item;
      await s.from("page_content").upsert({ 
        page, section_key, title, body, sort_order,
        updated_at: new Date().toISOString()
      }, { onConflict: "page, section_key" });
    }

    // Insert audit log directly to avoid circular dependency
    await s.from("audit_logs" as any).insert({
      user_id: context.userId,
      action: "backup_restored",
      details: { timestamp: new Date().toISOString() }
    } as any);

    return { ok: true as const };
  });
