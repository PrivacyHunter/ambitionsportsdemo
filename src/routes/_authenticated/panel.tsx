import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Eye, EyeOff, Loader2, LogOut, Package, Palette, Save, Settings2,
  ShieldCheck, Users, Globe2, Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import {
  deleteProduct, getDashboard, saveSetting, setUserRole, updateStatus, upsertProduct,
} from "@/lib/admin.functions";
import { DEFAULT_BRANDING, DEFAULT_THEME, FONT_PRESETS, type BrandingConfig, type ThemeConfig } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Control Panel | Ambition Sports" },
      { name: "description", content: "Owner, admin and developer control panel for Ambition Sports." },
      { property: "og:title", content: "Control Panel | Ambition Sports" },
      { property: "og:description", content: "Manage catalog, theme, branding and inquiries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelPage,
});

type Tab = "overview" | "inbox" | "products" | "theme" | "branding" | "accounts" | "visitors";

const TABS: { id: Tab; label: string; icon: typeof Inbox; developerOnly?: boolean }[] = [
  { id: "overview", label: "Overview", icon: ShieldCheck },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "products", label: "Products", icon: Package },
  { id: "theme", label: "Theme Studio", icon: Palette },
  { id: "branding", label: "Branding", icon: Settings2 },
  { id: "visitors", label: "Visitors", icon: Globe2 },
  { id: "accounts", label: "Accounts", icon: Users, developerOnly: true },
];

function PanelPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const dashboardFn = useServerFn(getDashboard);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["panel-dashboard"],
    queryFn: () => dashboardFn(),
    retry: false,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="glass h-40 w-full max-w-3xl shimmer rounded-3xl" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <div className="glass max-w-md rounded-3xl p-8">
          <h1 className="text-2xl font-extrabold uppercase">Access denied</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This area is limited to owner, admin and developer accounts.
          </p>
          <button onClick={signOut} className="mt-6 rounded-xl border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary">
            Sign out
          </button>
        </div>
      </main>
    );
  }

  const role = data!.role;
  const visibleTabs = TABS.filter((t) => !t.developerOnly || role === "developer");

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <header className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">Ambition OS</p>
          <h1 className="truncate text-2xl font-extrabold uppercase sm:text-4xl">Control Panel</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:inline">
            {role}
          </span>
          <ThemeToggle />
          <button onClick={signOut} aria-label="Sign out" className="glass grid h-9 w-9 place-items-center rounded-full">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <nav className="mx-auto mt-8 flex max-w-7xl gap-2 overflow-x-auto pb-2">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
              tab === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </nav>

      <section className="mx-auto mt-8 max-w-7xl pb-20">
        {tab === "overview" && <Overview data={data!} />}
        {tab === "inbox" && <InboxTab data={data!} onDone={() => void refetch()} />}
        {tab === "products" && <ProductsTab data={data!} onDone={() => void refetch()} />}
        {tab === "theme" && <ThemeStudio />}
        {tab === "branding" && <BrandingTab />}
        {tab === "visitors" && <VisitorsTab data={data!} />}
        {tab === "accounts" && role === "developer" && <AccountsTab data={data!} onDone={() => void refetch()} />}
      </section>
    </main>
  );
}

type Dash = Awaited<ReturnType<typeof getDashboard>>;

function Card({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="glass magnetic noise rounded-3xl p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-4xl font-extrabold">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Overview({ data }: { data: Dash }) {
  const countries = new Set(data.tracking.map((t) => t.country).filter(Boolean)).size;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card title="Inquiries" value={data.inquiries.length} />
      <Card title="Quote Requests" value={data.quotes.length} />
      <Card title="Orders" value={data.orders.length} />
      <Card title="Countries Reached" value={countries} hint={`${data.tracking.length} visits logged`} />
      <div className="glass rounded-3xl p-6 sm:col-span-2 lg:col-span-4">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-primary" /> Live catalog
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {data.products.length} products published · {data.products.filter((p) => p.is_featured).length} featured
        </p>
      </div>
    </div>
  );
}

function StatusRow({
  table, id, status, title, subtitle, onDone,
}: { table: "inquiries" | "quotes" | "orders"; id: string; status: string; title: string; subtitle: string; onDone: () => void }) {
  const update = useServerFn(updateStatus);
  const mutation = useMutation({
    mutationFn: (next: string) => update({ data: { table, id, status: next } }),
    onSuccess: () => { toast.success("Status updated"); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-4 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <select
        value={status}
        onChange={(e) => mutation.mutate(e.target.value)}
        aria-label="Status"
        className="shrink-0 rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-bold uppercase"
      >
        {["pending", "in_review", "approved", "completed", "rejected"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

function InboxTab({ data, onDone }: { data: Dash; onDone: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Inquiries</h2>
        {data.inquiries.length === 0 && <p className="text-xs text-muted-foreground">Nothing yet.</p>}
        {data.inquiries.map((i) => (
          <StatusRow key={i.id} table="inquiries" id={i.id} status={i.status} title={i.name} subtitle={`${i.email} · ${i.type}`} onDone={onDone} />
        ))}
      </div>
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Quote Requests</h2>
        {data.quotes.length === 0 && <p className="text-xs text-muted-foreground">Nothing yet.</p>}
        {data.quotes.map((q) => (
          <StatusRow key={q.id} table="quotes" id={q.id} status={q.status} title={`${q.name} · ${q.tracking_id ?? ""}`} subtitle={`${q.sport_type ?? "—"} · qty ${q.quantity ?? "—"}`} onDone={onDone} />
        ))}
      </div>
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Orders</h2>
        {data.orders.length === 0 && <p className="text-xs text-muted-foreground">Nothing yet.</p>}
        {data.orders.map((o) => (
          <StatusRow key={o.id} table="orders" id={o.id} status={o.status} title={o.email} subtitle={`${o.total_amount} USD`} onDone={onDone} />
        ))}
      </div>
    </div>
  );
}

const EMPTY_PRODUCT = {
  name: "", slug: "", category: "sportswear" as const, description: "",
  price: 0, stock: 0, images: "", sizes: "", colors: "", is_featured: false, is_active: true,
};

function ProductsTab({ data, onDone }: { data: Dash; onDone: () => void }) {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const save = useServerFn(upsertProduct);
  const remove = useServerFn(deleteProduct);

  const saveMutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          name: form.name,
          slug: form.slug,
          category: form.category,
          description: form.description,
          price: Number(form.price) || 0,
          stock: Number(form.stock) || 0,
          images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
          sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
          is_featured: form.is_featured,
          is_active: form.is_active,
        },
      }),
    onSuccess: () => { toast.success("Product saved"); setForm(EMPTY_PRODUCT); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { toast.success("Product removed"); onDone(); },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <form
        onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
        className="glass space-y-3 rounded-3xl p-6"
      >
        <h2 className="text-lg font-extrabold uppercase">Add / update product</h2>
        {([
          ["name", "Name"], ["slug", "Slug (lowercase-dashes)"], ["description", "Description"],
          ["images", "Image URLs (comma separated)"], ["sizes", "Sizes (comma separated)"],
          ["colors", "Colors (comma separated)"],
        ] as const).map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
            <input
              required={key === "name" || key === "slug"}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Price</span>
            <input type="number" min={0} step="0.01" value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Stock</span>
            <input type="number" min={0} value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Category</span>
          <select value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}
            className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm">
            <option value="sportswear">Sportswear</option>
            <option value="activewear">Activewear</option>
            <option value="casualwear">Casual wear</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-4 pt-2">
          <Toggle label="Featured" value={form.is_featured} onChange={(v) => setForm({ ...form, is_featured: v })} />
          <Toggle label="Active" value={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
        </div>
        <button type="submit" disabled={saveMutation.isPending}
          className="magnetic flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
          {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save product
        </button>
      </form>

      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Catalog ({data.products.length})</h2>
        <div className="space-y-1">
          {data.products.map((p) => (
            <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-3 last:border-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.category} · {p.price ?? "quote"} · stock {p.stock}</p>
              </div>
              <button onClick={() => removeMutation.mutate(p.id)}
                className="shrink-0 rounded-lg border border-border px-3 py-2 text-[10px] font-bold uppercase hover:border-destructive hover:text-destructive">
                Delete
              </button>
            </div>
          ))}
          {data.products.length === 0 && <p className="text-xs text-muted-foreground">No products yet — add your real items on the left.</p>}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
        value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
      }`}>
      <span className={`h-2 w-2 rounded-full ${value ? "bg-primary" : "bg-muted-foreground"}`} /> {label}
    </button>
  );
}

function ThemeStudio() {
  const { savedTheme, setPreview, mode } = useTheme();
  const [draft, setDraft] = useState<ThemeConfig>(savedTheme);
  const [previewOn, setPreviewOn] = useState(false);
  const persist = useServerFn(saveSetting);
  const { refresh } = useTheme();

  useEffect(() => setDraft(savedTheme), [savedTheme]);
  useEffect(() => {
    setPreview(previewOn ? { theme: draft } : null);
    return () => setPreview(null);
  }, [previewOn, draft, setPreview]);

  const saveMutation = useMutation({
    mutationFn: () => persist({ data: { key: "theme", value: JSON.stringify(draft) } }),
    onSuccess: () => { toast.success("Theme published"); setPreviewOn(false); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const colorFields: [keyof ThemeConfig, string][] = [
    ["goldAccent", "Gold accent"],
    ["cyanAccent", "Ice cyan accent"],
    ["darkBackground", "Obsidian background"],
    ["lightBackground", "Studio light background"],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div className="glass space-y-6 rounded-3xl p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="min-w-0 truncate text-lg font-extrabold uppercase">Theme studio</h2>
          <button onClick={() => setPreviewOn(!previewOn)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
              previewOn ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}>
            {previewOn ? <Eye size={13} /> : <EyeOff size={13} />} Live preview
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {colorFields.map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
              <div className="mt-2 flex items-center gap-3">
                <input type="color" value={String(draft[key])} aria-label={label}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="h-10 w-14 shrink-0 rounded-lg border border-border bg-transparent" />
                <input value={String(draft[key])}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="w-full min-w-0 rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
              </div>
            </label>
          ))}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Typography</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FONT_PRESETS.map((preset) => (
              <button key={preset.label}
                onClick={() => setDraft({ ...draft, displayFont: preset.display, bodyFont: preset.body })}
                className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
                  draft.displayFont === preset.display ? "border-primary text-primary" : "border-border text-muted-foreground"
                }`}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Range label="Corner radius" min={0} max={2} step={0.05} unit="rem"
            value={parseFloat(draft.radius)} onChange={(v) => setDraft({ ...draft, radius: `${v}rem` })} />
          <Range label="Section spacing" min={2} max={12} step={0.5} unit="rem"
            value={parseFloat(draft.sectionSpace)} onChange={(v) => setDraft({ ...draft, sectionSpace: `${v}rem` })} />
          <Range label="Container width" min={64} max={120} step={2} unit="rem"
            value={parseFloat(draft.containerWidth)} onChange={(v) => setDraft({ ...draft, containerWidth: `${v}rem` })} />
          <Range label="Glass opacity" min={1} max={14} step={1} unit="%"
            value={draft.glassOpacity} onChange={(v) => setDraft({ ...draft, glassOpacity: v })} />
          <Range label="Display tracking" min={-6} max={2} step={0.5} unit="em/100"
            value={parseFloat(draft.displayTracking) * 100} onChange={(v) => setDraft({ ...draft, displayTracking: `${v / 100}em` })} />
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Default mode</span>
            <select value={draft.defaultMode}
              onChange={(e) => setDraft({ ...draft, defaultMode: e.target.value as ThemeConfig["defaultMode"] })}
              className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm">
              <option value="dark">Luxury obsidian dark</option>
              <option value="light">Minimalist studio light</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
            className="magnetic flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
            {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish theme
          </button>
          <button onClick={() => setDraft(DEFAULT_THEME)}
            className="rounded-xl border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary">
            Reset defaults
          </button>
        </div>
      </div>

      <div className="glass noise rounded-3xl p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Preview · {mode} {previewOn ? "(live on site)" : "(sample only)"}
        </p>
        <div className="mt-5 rounded-2xl p-6"
          style={{
            background: mode === "dark" ? draft.darkBackground : draft.lightBackground,
            color: mode === "dark" ? "#f4f7fb" : "#0b0f19",
            borderRadius: draft.radius,
          }}>
          <p style={{ color: draft.goldAccent, letterSpacing: "0.3em", fontSize: 10, fontWeight: 700 }}>AMBITION SPORTS</p>
          <h3 style={{ fontFamily: draft.displayFont, letterSpacing: draft.displayTracking, fontSize: 30, fontWeight: 800, marginTop: 10 }}>
            Elite Custom Kits
          </h3>
          <p style={{ fontFamily: draft.bodyFont, fontSize: 13, opacity: 0.75, marginTop: 10 }}>
            Sublimation, embroidery and cut &amp; sew manufacturing for teams worldwide.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <span style={{ background: draft.goldAccent, color: "#0b0f19", padding: "10px 16px", borderRadius: draft.radius, fontSize: 10, fontWeight: 800 }}>
              REQUEST QUOTE
            </span>
            <span style={{ border: `1px solid ${draft.cyanAccent}`, color: draft.cyanAccent, padding: "10px 16px", borderRadius: draft.radius, fontSize: 10, fontWeight: 800 }}>
              VIEW CATALOG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Range({
  label, value, min, max, step, unit, onChange,
}: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label} · {value}{unit}
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="mt-3 w-full accent-primary" />
    </label>
  );
}

function BrandingTab() {
  const { savedBranding, setPreview, refresh } = useTheme();
  const [draft, setDraft] = useState<BrandingConfig>(savedBranding);
  const [previewOn, setPreviewOn] = useState(false);
  const persist = useServerFn(saveSetting);

  useEffect(() => setDraft(savedBranding), [savedBranding]);
  useEffect(() => {
    setPreview(previewOn ? { branding: draft } : null);
    return () => setPreview(null);
  }, [previewOn, draft, setPreview]);

  const saveMutation = useMutation({
    mutationFn: () => persist({ data: { key: "branding", value: JSON.stringify(draft) } }),
    onSuccess: () => { toast.success("Branding published"); setPreviewOn(false); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const textFields: [keyof BrandingConfig, string][] = [
    ["logoText", "Brand name"],
    ["logoUrl", "Logo image URL"],
    ["faviconUrl", "Favicon URL"],
    ["notificationText", "Notification bar text"],
    ["footerCreditText", "Footer credit text"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["whatsappNumber", "WhatsApp number"],
  ];

  const toggles: [keyof BrandingConfig, string][] = [
    ["showNotificationBar", "Notification bar"],
    ["showTopInfoBar", "Top info bar"],
    ["showSocialIcons", "Social icons"],
    ["showFooterCredit", "Footer credit"],
    ["showWhatsappButton", "WhatsApp button"],
  ];

  return (
    <div className="glass space-y-6 rounded-3xl p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="min-w-0 truncate text-lg font-extrabold uppercase">Branding &amp; header/footer elements</h2>
        <button onClick={() => setPreviewOn(!previewOn)}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
            previewOn ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
          }`}>
          {previewOn ? <Eye size={13} /> : <EyeOff size={13} />} Live preview
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {textFields.map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
            <input value={String(draft[key] ?? "")}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {toggles.map(([key, label]) => (
          <Toggle key={key} label={label} value={Boolean(draft[key])}
            onChange={(v) => setDraft({ ...draft, [key]: v })} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="magnetic flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
          {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish branding
        </button>
        <button onClick={() => setDraft(DEFAULT_BRANDING)}
          className="rounded-xl border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary">
          Reset defaults
        </button>
      </div>
    </div>
  );
}

function VisitorsTab({ data }: { data: Dash }) {
  return (
    <div className="glass overflow-x-auto rounded-3xl p-6">
      <h2 className="mb-4 text-lg font-extrabold uppercase">Visitor intelligence</h2>
      {data.tracking.length === 0 && <p className="text-xs text-muted-foreground">No visits logged yet.</p>}
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <tr><th className="py-2">When</th><th>Location</th><th>Device</th><th>Browser</th><th>Page</th></tr>
        </thead>
        <tbody>
          {data.tracking.map((t) => (
            <tr key={t.id} className="border-t border-border">
              <td className="py-2">{t.created_at ? new Date(t.created_at).toLocaleString() : "—"}</td>
              <td>{[t.city, t.region, t.country].filter(Boolean).join(", ") || "—"}</td>
              <td>{t.device ?? "—"}{t.os ? ` · ${t.os}` : ""}</td>
              <td>{t.browser ?? "—"}</td>
              <td>{t.page_path ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountsTab({ data, onDone }: { data: Dash; onDone: () => void }) {
  const assign = useServerFn(setUserRole);
  const mutation = useMutation({
    mutationFn: (input: { userId: string; role: "owner" | "admin" | "developer" | "user" }) => assign({ data: input }),
    onSuccess: () => { toast.success("Role updated"); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="mb-2 text-lg font-extrabold uppercase">Accounts &amp; roles</h2>
      <p className="mb-5 text-xs text-muted-foreground">Only developers can allocate roles. Developer accounts are hidden from owners and admins.</p>
      {data.accounts.map((account) => (
        <div key={account.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-4 last:border-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{account.full_name || account.email || account.id}</p>
            <p className="truncate text-xs text-muted-foreground">{account.email}</p>
          </div>
          <select value={account.role} aria-label="Role"
            onChange={(e) => mutation.mutate({ userId: account.id, role: e.target.value as "owner" | "admin" | "developer" | "user" })}
            className="shrink-0 rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-bold uppercase">
            {["user", "admin", "owner", "developer"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}
