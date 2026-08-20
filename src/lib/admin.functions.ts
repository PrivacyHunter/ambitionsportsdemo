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
