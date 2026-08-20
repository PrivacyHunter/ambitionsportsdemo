import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Eye, EyeOff, Loader2, LogOut, Package, Palette, Save, Settings2,
  ShieldCheck, Users, Globe2, Inbox, History, Download, Upload,
  Search, BarChart3, TrendingUp, MapPin, Smartphone,
  ArrowRight, GripVertical, Check, Wand2
} from "lucide-react";
import { SiGooglechrome as Chrome } from "react-icons/si";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import {
  deleteProduct, getDashboard, saveSetting, setUserRole, updateStatus, upsertProduct,
} from "@/lib/admin.functions";
import { getPageSeo, savePageSeo } from "@/lib/seo.functions";
import { getSeoBulk, saveSeoBulk, autoGenerateSeo } from "@/lib/seo-bulk.functions";
import { DEFAULT_BRANDING, DEFAULT_THEME, FONT_PRESETS, THEME_PRESETS, type BrandingConfig, type ThemeConfig } from "@/lib/theme";

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

type Tab = "overview" | "inbox" | "products" | "theme" | "branding" | "seo" | "accounts" | "visitors" | "analytics";

const TABS: { id: Tab; label: string; icon: typeof Inbox; developerOnly?: boolean }[] = [
  { id: "overview", label: "Overview", icon: ShieldCheck },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "products", label: "Products", icon: Package },
  { id: "theme", label: "Theme Studio", icon: Palette },
  { id: "branding", label: "Branding", icon: Settings2 },
  { id: "seo", label: "SEO Editor", icon: Globe2 },
  { id: "visitors", label: "Visitors", icon: Globe2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
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
        {tab === "seo" && <SeoTab />}
        {tab === "visitors" && <VisitorsTab data={data!} />}
        { tab === "analytics" && <AnalyticsDashboard data={data!} />}
        { tab === "accounts" && role === "developer" && <AccountsTab data={data!} onDone={() => void refetch()} />}
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

function SortableImage({ id, url }: { id: string; url: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative w-16 h-16 group cursor-grab active:cursor-grabbing">
      <img src={url} alt="Product" className="w-full h-full object-cover rounded-lg border border-border" />
      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={12} className="text-white drop-shadow-md" />
      </div>
    </div>
  );
}

function ProductsTab({ data, onDone }: { data: Dash; onDone: () => void }) {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const save = useServerFn(upsertProduct);
  const remove = useServerFn(deleteProduct);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        ] as const).map(([key, label]) => {
          const value = form[key as keyof typeof form];
          const isRequired = key === "name" || key === "slug";
          
          if (key === "images") {
            const currentImages = form.images.split(",").map((s) => s.trim()).filter(Boolean);
            return (
              <div key={key} className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    if (over && active.id !== over.id) {
                      const oldIndex = currentImages.indexOf(active.id as string);
                      const newIndex = currentImages.indexOf(over.id as string);
                      const next = arrayMove(currentImages, oldIndex, newIndex);
                      setForm({ ...form, images: next.join(",") });
                    }
                  }}
                >
                  <SortableContext items={currentImages} strategy={horizontalListSortingStrategy}>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {currentImages.map((img) => (
                        <SortableImage key={img} id={img} url={img} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <input
                  required={isRequired}
                  value={String(value ?? "")}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="URL 1, URL 2..."
                />
              </div>
            );
          }
          return (
            <label key={key} className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
              <input
                required={isRequired}
                value={String(value ?? "")}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          );
        })}


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
  const { savedTheme, setPreview, mode, refresh } = useTheme();
  const [draft, setDraft] = useState<ThemeConfig>(savedTheme);
  const [previewOn, setPreviewOn] = useState(false);
  const [history, setHistory] = useState<ThemeConfig[]>([]);
  const persist = useServerFn(saveSetting);

  useEffect(() => setDraft(savedTheme), [savedTheme]);
  useEffect(() => {
    setPreview(previewOn ? { theme: draft } : null);
    return () => setPreview(null);
  }, [previewOn, draft, setPreview]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      setHistory(prev => [draft, ...prev.slice(0, 9)]);
      return persist({ data: { key: "theme", value: JSON.stringify(draft) } });
    },
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
            {previewOn ? <EyeOff size={14} /> : <Eye size={14} />} {previewOn ? "Preview ON" : "Live Preview"}
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `ambition-theme-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-[10px] font-bold uppercase tracking-widest hover:border-primary"
          >
            Export JSON
          </button>
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border py-3 text-[10px] font-bold uppercase tracking-widest hover:border-primary">
            Import JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (re) => {
                  try {
                    const imported = JSON.parse(re.target?.result as string);
                    setDraft({ ...DEFAULT_THEME, ...imported });
                    toast.success("Theme imported (click publish to save)");
                  } catch {
                    toast.error("Invalid theme file");
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>

        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
              <History size={10} /> History / Rollback
            </p>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <button key={i} onClick={() => setDraft(h)} className="glass rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-border hover:border-primary">
                  Rev {history.length - i}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {Object.entries(THEME_PRESETS).map(([id, preset]) => (
            <button key={id}
              onClick={() => setDraft(preset)}
              className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary"
            >
              Preset: {id}
            </button>
          ))}
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

function SeoTab() {
  const [view, setView] = useState<"single" | "bulk">("single");
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setView("single")} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${view === "single" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
          Single Page
        </button>
        <button onClick={() => setView("bulk")} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${view === "bulk" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
          Bulk Editor
        </button>
      </div>
      {view === "single" ? <SeoSingleView /> : <SeoBulkEditor />}
    </div>
  );
}

function SeoSingleView() {
  const [path, setPath] = useState("/");
  const getSeo = useServerFn(getPageSeo);
  const saveSeo = useServerFn(savePageSeo);

  const { data: seo, refetch } = useQuery({
    queryKey: ["seo", path],
    queryFn: () => getSeo({ data: { path } }),
  });

  const [draft, setDraft] = useState({ title: "", description: "", ogImage: "" });

  useEffect(() => {
    if (seo) setDraft(seo);
    else setDraft({ title: "", description: "", ogImage: "" });
  }, [seo]);

  const { refresh } = useTheme();

  const mutation = useMutation({
    mutationFn: () => saveSeo({ data: { path, seo: draft } }),
    onSuccess: () => { 
      toast.success("SEO updated"); 
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="glass space-y-6 rounded-3xl p-6">
      <h2 className="text-lg font-extrabold uppercase">SEO &amp; Meta Editor</h2>
      
      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Select Page</span>
        <select value={path} onChange={(e) => setPath(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="/">Home</option>
          <option value="/sportswear">Sportswear</option>
          <option value="/activewear">Activewear</option>
          <option value="/casual-wear">Casual Wear</option>
          <option value="/about">About Us</option>
          <option value="/contact">Contact</option>
          <option value="/track">Order Tracking</option>
        </select>
      </label>

      <div className="space-y-4">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Meta Title</span>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Meta Description</span>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">OG Image URL (Optional)</span>
          <input value={draft.ogImage} onChange={(e) => setDraft({ ...draft, ogImage: e.target.value })}
            placeholder="https://..."
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Preview (Search Result)</h3>
        <div className="glass p-6 rounded-2xl bg-white max-w-xl text-left">
          <p className="text-[#1a0dab] text-xl font-medium truncate mb-1">{draft.title || "Page Title"}</p>
          <p className="text-[#006621] text-sm mb-1">https://ambitionsports.com{path}</p>
          <p className="text-[#545454] text-sm line-clamp-2">{draft.description || "Page description goes here..."}</p>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Preview (Social Card)</h3>
        <div className="glass overflow-hidden rounded-2xl border border-border max-w-sm text-left bg-[#1c1e21]">
          {draft.ogImage && <img src={draft.ogImage} alt="OG Preview" className="w-full h-48 object-cover" />}
          <div className="p-4">
            <p className="text-[10px] uppercase text-muted-foreground mb-1">ambitionsports.com</p>
            <p className="font-bold text-white truncate">{draft.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{draft.description}</p>
          </div>
        </div>
      </div>


      <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
        className="magnetic flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
        {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Metadata
      </button>
    </div>
  );
}
