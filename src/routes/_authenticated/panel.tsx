import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Eye, EyeOff, Loader2, LogOut, Package, Palette, Save, Settings2,
  ShieldCheck, Users, Globe2, Inbox, History, Download, Upload,
  Search, BarChart3, TrendingUp, MapPin, Smartphone,
  ArrowRight, GripVertical, Check, Wand2, FileJson,
  Layout, ShoppingBag, FileText, Activity, Mail, Layers, Play, Subtitles, X,
  Trash2, CheckSquare, Square, DownloadCloud
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
  inviteUser, backupSettings, restoreSettings, listSettings,
} from "@/lib/admin.functions";
import { saveThemeVersion, getThemeHistory, scheduleReport } from "@/lib/history.functions";
import { getPageSeo, savePageSeo } from "@/lib/seo.functions";
import { getSeoBulk, saveSeoBulk, autoGenerateSeo } from "@/lib/seo-bulk.functions";
import { logAuditAction, getAuditLogs, getEmailLogs, exportAuditLogs } from "@/lib/logs.functions";
import { applyTemplate } from "@/lib/templates.functions";
import { 
  getCustomizationVideos, 
  upsertCustomizationVideo, 
  deleteCustomizationVideo, 
  getEngagementStats,
  bulkActionCustomizationVideos 
} from "@/lib/customization.functions";
import { DEFAULT_BRANDING, DEFAULT_THEME, FONT_PRESETS, THEME_PRESETS, type BrandingConfig, type ThemeConfig } from "@/lib/theme";

// PDF export will be handled by dynamic import in AnalyticsDashboard

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

type Tab = "overview" | "inbox" | "products" | "theme" | "branding" | "seo" | "customization" | "visitors" | "analytics" | "accounts" | "logs";

const TABS: { id: Tab; label: string; icon: any; roles?: ("owner" | "admin" | "developer")[] }[] = [
  { id: "overview", label: "Overview", icon: ShieldCheck },
  { id: "inbox", label: "Inbox", icon: Inbox, roles: ["owner", "admin", "developer"] },
  { id: "products", label: "Products", icon: Package, roles: ["owner", "admin", "developer"] },
  { id: "theme", label: "Theme Studio", icon: Palette, roles: ["owner", "admin", "developer"] },
  { id: "branding", label: "Branding", icon: Settings2, roles: ["owner", "admin", "developer"] },
  { id: "seo", label: "SEO Editor", icon: Globe2, roles: ["owner", "admin", "developer"] },
  { id: "customization", label: "Studio Manager", icon: Layers, roles: ["owner", "admin", "developer"] },
  { id: "visitors", label: "Visitors", icon: Globe2, roles: ["owner", "admin", "developer"] },
  { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["owner", "admin", "developer"] },
  { id: "accounts", label: "Accounts", icon: Users, roles: ["developer"] },
  { id: "logs", label: "Logs", icon: Activity, roles: ["admin", "owner", "developer"] },
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
  const visibleTabs = TABS.filter((t) => !t.roles || t.roles.includes(role as any));

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
        {tab === "customization" && <CustomizationTab onDone={() => void refetch()} />}
        {tab === "visitors" && <VisitorsTab data={data!} />}
        { tab === "analytics" && <AnalyticsDashboard data={data!} />}
        { tab === "accounts" && role === "developer" && <AccountsTab data={data!} onDone={() => void refetch()} />}
        { tab === "logs" && role === "developer" && <LogsTab />}
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
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold uppercase">System Control</h2>
            <p className="text-xs text-muted-foreground">Manage site-wide backups and templates.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BackupButton />
            <RestoreButton />
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Inquiries" value={data.inquiries.length} />
        <Card title="Quote Requests" value={data.quotes.length} hint={`${data.quotes.filter(q => q.status === 'pending').length} pending`} />
        <Card title="Orders" value={data.orders.length} />
        <Card title="Countries" value={countries} hint={`${data.tracking.length} visits logged`} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TemplateCard 
          title="One-Click Business Site" 
          description="Transform into a professional manufacturer showcase with optimized branding and service sections."
          icon={Layout}
          type="business"
        />
        <TemplateCard 
          title="One-Click Online Store" 
          description="Launch a full retail setup with sample products, optimized checkout, and high-conversion layouts."
          icon={ShoppingBag}
          type="store"
        />
      </div>

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

function TemplateCard({ title, description, icon: Icon, type }: { title: string, description: string, icon: any, type: 'business' | 'store' }) {
  const apply = useServerFn(applyTemplate);
  const mutation = useMutation({
    mutationFn: () => apply({ data: { type } }),
    onSuccess: () => {
      toast.success(`${title} template applied!`);
      window.location.reload();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to apply template"),
  });

  return (
    <div className="glass noise rounded-3xl p-6 flex flex-col justify-between items-start gap-4">
      <div className="space-y-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-widest">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => {
          if (confirm("This will update your site branding and settings. Continue?")) {
            mutation.mutate();
          }
        }}
        disabled={mutation.isPending}
        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-primary/30 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
      >
        {mutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        Apply Template
      </button>
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

function SortableImage({ id, url, isCover, onSetCover }: { id: string; url: string; isCover: boolean; onSetCover: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="relative w-16 h-16 group cursor-grab active:cursor-grabbing">
      <img src={url} alt="Product" className={`w-full h-full object-cover rounded-lg border-2 ${isCover ? 'border-primary shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'border-border'}`} />
      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-bl-lg">
        <GripVertical size={12} className="text-white drop-shadow-md" {...attributes} {...listeners} />
      </div>
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onSetCover(); }}
        className={`absolute bottom-0 left-0 right-0 py-0.5 text-[8px] font-bold uppercase transition-all ${isCover ? 'bg-primary text-primary-foreground opacity-100' : 'bg-black/60 text-white opacity-0 group-hover:opacity-100'}`}
      >
        {isCover ? 'Cover' : 'Set Cover'}
      </button>
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
                        <SortableImage 
                          key={img} 
                          id={img} 
                          url={img} 
                          isCover={form.images.split(',')[0] === img} 
                          onSetCover={() => {
                            const imgs = form.images.split(',').map(s => s.trim()).filter(Boolean);
                            const next = [img, ...imgs.filter(i => i !== img)];
                            setForm({ ...form, images: next.join(',') });
                          }}
                        />
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
  const [diffMode, setDiffMode] = useState(false);
  const [diffPreset, setDiffPreset] = useState<ThemeConfig | null>(null);
  const [localHistory, setLocalHistory] = useState<ThemeConfig[]>([]);
  
  const historyQuery = useQuery({
    queryKey: ["theme-history"],
    queryFn: useServerFn(getThemeHistory)
  });
  
  const saveHistoryMutation = useMutation({
    mutationFn: useServerFn(saveThemeVersion),
    onSuccess: () => historyQuery.refetch()
  });

  const themeKeys: (keyof ThemeConfig)[] = [
    "goldAccent", "cyanAccent", "darkBackground", "lightBackground",
    "displayFont", "bodyFont", "radius", "sectionSpace", "containerWidth",
    "glassOpacity", "displayTracking"
  ];

  const DiffView = ({ oldTheme, newTheme }: { oldTheme: ThemeConfig, newTheme: ThemeConfig }) => (
    <div className="space-y-4 p-4 glass border border-primary/20 rounded-2xl">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Visual Diff</h4>
        <button onClick={() => setDiffMode(false)} className="text-[10px] text-muted-foreground hover:text-foreground">Close</button>
      </div>
      <div className="grid gap-2">
        {themeKeys.map(key => {
          const oldVal = oldTheme[key];
          const newVal = newTheme[key];
          if (oldVal === newVal) return null;
          return (
            <div key={key} className="grid grid-cols-3 gap-2 text-[10px] items-center border-b border-border/50 pb-2 last:border-0">
              <span className="font-bold uppercase tracking-tighter opacity-70">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="line-through text-red-500/70 truncate">{String(oldVal)}</span>
              <span className="text-green-500 font-bold truncate">→ {String(newVal)}</span>
            </div>
          );
        })}
      </div>
      <button 
        onClick={() => { setDraft(newTheme); setDiffMode(false); }}
        className="w-full mt-2 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase"
      >
        Apply Changes
      </button>
    </div>
  );

  const persist = useServerFn(saveSetting);

  useEffect(() => setDraft(savedTheme), [savedTheme]);
  useEffect(() => {
    setPreview(previewOn ? { theme: draft } : null);
    return () => setPreview(null);
  }, [previewOn, draft, setPreview]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const log = useServerFn(logAuditAction);
      await log({ data: { action: "theme_publish", action_type: "theme", details: { config: draft } } });
      await saveHistoryMutation.mutateAsync({ data: { name: `Version ${new Date().toLocaleString()}`, config: draft } });
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

        {localHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
              <History size={10} /> Local Session History
            </p>
            <div className="flex flex-wrap gap-2">
              {localHistory.map((h, i) => (
                <button key={i} onClick={() => setDraft(h)} className="glass rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-border hover:border-primary">
                  Rev {localHistory.length - i}
                </button>
              ))}
            </div>
          </div>
        )}

        {diffMode && diffPreset && (
          <DiffView oldTheme={draft} newTheme={diffPreset} />
        )}

        <div className="flex flex-wrap gap-2">
          {Object.entries(THEME_PRESETS).map(([id, preset]) => (
            <button key={id}
              onClick={() => {
                setDiffPreset(preset);
                setDiffMode(true);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary"
            >
              Preview: {id}
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

function SeoBulkEditor() {
  const getBulk = useServerFn(getSeoBulk);
  const saveBulk = useServerFn(saveSeoBulk);
  const autoSeo = useServerFn(autoGenerateSeo);
  const [search, setSearch] = useState("");
  const [updates, setUpdates] = useState<Record<string, { title: string; description: string; ogImage: string }>>({});

  const { data, refetch } = useQuery({
    queryKey: ["seo-bulk"],
    queryFn: () => getBulk(),
  });

  const mutation = useMutation({
    mutationFn: () => saveBulk({ data: { updates: Object.entries(updates).map(([path, val]) => ({ path, ...val })) } }),
    onSuccess: () => { toast.success("Bulk SEO updated"); refetch(); setUpdates({}); },
  });

  if (!data) return <Loader2 className="animate-spin mx-auto" />;

  const allItems = [
    ...["/", "/sportswear", "/activewear", "/casual-wear", "/about", "/contact", "/track"].map(p => ({
      id: p,
      name: p === "/" ? "Home" : p.replace("/", "").replace("-", " "),
      type: "page" as const,
      seo: data.content.find(c => c.page === p)
    })),
    ...data.products.map(p => ({
      id: `/product/${p.slug}`,
      name: p.name,
      type: "product" as const,
      seo: data.content.find(c => c.page === `/product/${p.slug}`),
      description: p.description
    }))
  ];

  const filtered = allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass rounded-3xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-lg font-extrabold uppercase">Bulk SEO Editor</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-transparent border border-border rounded-full text-xs outline-none focus:border-primary w-full sm:w-64"
          />
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {filtered.map(item => {
          const currentSeo = updates[item.id] || (item.seo ? JSON.parse(item.seo.body || "{}") : { title: "", description: "", ogImage: "" });
          const hasChanges = !!updates[item.id];
          const isTitleTooLong = currentSeo.title.length > 60;
          const isDescTooLong = currentSeo.description.length > 160;
          const isDescTooShort = currentSeo.description.length > 0 && currentSeo.description.length < 120;

          return (
            <div key={item.id} className={`p-4 rounded-2xl border transition-colors ${hasChanges ? "border-primary/50 bg-primary/5" : "border-border bg-black/20"}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.type}</p>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">{item.id}</p>
                </div>
                <button 
                  onClick={async () => {
                    const generated = await autoSeo({ data: { type: item.type, name: item.name, description: item.type === "product" ? (item as any).description : undefined } });
                    setUpdates(prev => ({ ...prev, [item.id]: { ...currentSeo, ...generated } }));
                    toast.success("SEO generated");
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors"
                >
                  <Wand2 size={12} /> Auto SEO
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">Title</span>
                  <input 
                    value={currentSeo.title}
                    onChange={(e) => setUpdates(prev => ({ ...prev, [item.id]: { ...currentSeo, title: e.target.value } }))}
                    className={`mt-1 w-full bg-transparent border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary ${isTitleTooLong ? 'border-red-500/50' : 'border-border/50'}`}
                  />
                  {isTitleTooLong && <p className="text-[8px] text-red-500 mt-0.5">Title is too long ({currentSeo.title.length}/60)</p>}
                </label>
                <label className="block">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">Description</span>
                  <input 
                    value={currentSeo.description}
                    onChange={(e) => setUpdates(prev => ({ ...prev, [item.id]: { ...currentSeo, description: e.target.value } }))}
                    className={`mt-1 w-full bg-transparent border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary ${isDescTooLong || isDescTooShort ? 'border-amber-500/50' : 'border-border/50'}`}
                  />
                  {isDescTooLong && <p className="text-[8px] text-red-500 mt-0.5">Description is too long ({currentSeo.description.length}/160)</p>}
                  {isDescTooShort && <p className="text-[8px] text-amber-500 mt-0.5">Description is a bit short ({currentSeo.description.length}/120+ recommended)</p>}
                </label>
                <label className="block">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">OG Image</span>
                  <input 
                    value={currentSeo.ogImage}
                    onChange={(e) => setUpdates(prev => ({ ...prev, [item.id]: { ...currentSeo, ogImage: e.target.value } }))}
                    className="mt-1 w-full bg-transparent border border-border/50 rounded-lg px-2 py-1.5 text-xs focus:border-primary outline-none"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border flex justify-between items-center">
        <p className="text-[10px] text-muted-foreground">
          {Object.keys(updates).length} items modified
        </p>
        <button 
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || Object.keys(updates).length === 0}
          className="magnetic flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All Changes
        </button>
      </div>
    </div>
  );
}

function AnalyticsDashboard({ data }: { data: Dash }) {
  const [filter, setFilter] = useState({ 
    country: "all", 
    device: "all", 
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exportWizardOpen, setExportWizardOpen] = useState(false);
  const [exportColumns, setExportColumns] = useState(["When", "Location", "Device", "Browser", "Page"]);

  const filteredData = useMemo(() => {
    return data.tracking.filter(t => {
      const countryMatch = filter.country === "all" || t.country === filter.country;
      const deviceMatch = filter.device === "all" || t.device === filter.device;
      
      const date = t.created_at ? new Date(t.created_at).getTime() : 0;
      const start = new Date(filter.startDate || 0).getTime();
      const end = new Date(filter.endDate || 0).getTime() + (24 * 60 * 60 * 1000); // end of day
      const dateMatch = date >= start && date <= end;
      
      return countryMatch && deviceMatch && dateMatch;
    });
  }, [data.tracking, filter]);

  const stats = useMemo(() => {
    const countries: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const pages: Record<string, number> = {};
    const dates: Record<string, number> = {};

    filteredData.forEach(t => {
      if (t.country) countries[t.country] = (countries[t.country] || 0) + 1;
      if (t.device) devices[t.device] = (devices[t.device] || 0) + 1;
      if (t.page_path) pages[t.page_path] = (pages[t.page_path] || 0) + 1;
      
      const date = t.created_at ? new Date(t.created_at).toLocaleDateString() : "Unknown";
      dates[date] = (dates[date] || 0) + 1;
    });

    const format = (obj: Record<string, number>) => 
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return {
      countries: format(countries),
      devices: format(devices),
      pages: format(pages).slice(0, 10),
      trend: Object.entries(dates).map(([name, value]) => ({ name, value }))
    };
  }, [filteredData]);

  const COLORS = ['#d4af37', '#7fe9ff', '#39ff14', '#00f3ff', '#ff00ff'];

  const ScheduleReportModal = () => {
    const [reportForm, setReportForm] = useState({
      name: "",
      frequency: "weekly" as const,
      recipient_email: "",
      columns: ["When", "Location", "Device", "Page"],
      date_range_type: "last_7d",
      format: "pdf" as const
    });
    
    const schedule = useServerFn(scheduleReport);
    const mutation = useMutation({
      mutationFn: (data: any) => schedule({ data }),
      onSuccess: () => {
        toast.success("Report scheduled successfully!");
        setReportForm({ ...reportForm, name: "", recipient_email: "" });
      },
      onError: (e) => toast.error("Failed to schedule report")
    });

    return (
      <div className="glass p-6 rounded-3xl border border-neon-cyan/20 space-y-4 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Mail size={14} className="text-neon-cyan" /> Schedule Email Reports
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input 
            placeholder="Report Name" 
            value={reportForm.name} 
            onChange={e => setReportForm({...reportForm, name: e.target.value})}
            className="bg-transparent border border-border rounded-xl px-4 py-2 text-xs w-full"
          />
          <input 
            placeholder="Recipient Email" 
            value={reportForm.recipient_email} 
            onChange={e => setReportForm({...reportForm, recipient_email: e.target.value})}
            className="bg-transparent border border-border rounded-xl px-4 py-2 text-xs w-full"
          />
          <select 
            value={reportForm.frequency} 
            onChange={e => setReportForm({...reportForm, frequency: e.target.value as any})}
            className="bg-transparent border border-border rounded-xl px-4 py-2 text-xs"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button 
            onClick={() => mutation.mutate(reportForm)}
            disabled={mutation.isPending}
            className="bg-neon-cyan text-background py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neon-lime transition-all"
          >
            {mutation.isPending ? "Scheduling..." : "Schedule Now"}
          </button>
        </div>
      </div>
    );
  };

  const exportToCsv = () => {
    const rows = filteredData.map(t => {
      const allData: Record<string, string> = {
        "When": t.created_at ? new Date(t.created_at).toLocaleString() : "",
        "Location": [t.city, t.region, t.country].filter(Boolean).join(", "),
        "Device": `${t.device ?? ""}${t.os ? ` · ${t.os}` : ""}`,
        "Browser": t.browser ?? "",
        "Page": t.page_path ?? ""
      };
      return exportColumns.map(col => allData[col]);
    });
    
    const csvContent = [exportColumns, ...rows].map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ambition-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success("CSV Exported");
    setExportWizardOpen(false);
  };

  const exportToPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.text("Ambition Sports Analytics Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Range: ${filter.startDate} to ${filter.endDate}`, 14, 22);
    
    const rows = filteredData.map(t => {
      const allData: Record<string, string> = {
        "When": t.created_at ? new Date(t.created_at).toLocaleString() : "",
        "Location": [t.city, t.region, t.country].filter(Boolean).join(", "),
        "Device": `${t.device ?? ""}${t.os ? ` · ${t.os}` : ""}`,
        "Browser": t.browser ?? "",
        "Page": t.page_path ?? ""
      };
      return exportColumns.map(col => allData[col]);
    });

    (doc as any).autoTable({
      head: [exportColumns],
      body: rows,
      startY: 30,
    });

    doc.save(`ambition-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF Exported");
    setExportWizardOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold uppercase">Visitor Analytics</h2>
        <button 
          onClick={() => setExportWizardOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors"
        >
          <FileText size={14} /> Export Wizard
        </button>
      </div>

      <ScheduleReportModal />

      {exportWizardOpen && (
        <div className="glass p-6 rounded-3xl border border-primary/20 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest">Export Wizard</h3>
            <button onClick={() => setExportWizardOpen(false)} className="text-xs text-muted-foreground">Cancel</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">Date Range</span>
              <div className="flex gap-2">
                <input type="date" value={filter.startDate} onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))} className="bg-transparent border border-border rounded px-2 py-1 text-xs w-full" />
                <input type="date" value={filter.endDate} onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))} className="bg-transparent border border-border rounded px-2 py-1 text-xs w-full" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">Columns</span>
              <div className="flex flex-wrap gap-2">
                {["When", "Location", "Device", "Browser", "Page"].map(col => (
                  <button 
                    key={col}
                    onClick={() => setExportColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                    className={`px-2 py-1 rounded-full border text-[9px] uppercase font-bold ${exportColumns.includes(col) ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={exportToCsv} className="flex-1 py-2 rounded-lg bg-white/5 border border-border text-[10px] font-bold uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Download size={12} /> CSV
              </button>
              <button onClick={exportToPdf} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase flex items-center justify-center gap-2">
                <FileText size={12} /> PDF
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass p-6 rounded-3xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filtered Visits</p>
          <p className="text-3xl font-extrabold mt-2">{filteredData.length}</p>
        </div>
        <div className="glass p-6 rounded-3xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Countries</p>
          <p className="text-3xl font-extrabold mt-2">{stats.countries.length}</p>
        </div>
        <div className="glass p-6 rounded-3xl col-span-2">
          <div className="flex gap-4 h-full items-center">
            <select 
              value={filter.country} 
              onChange={(e) => setFilter(prev => ({ ...prev, country: e.target.value }))}
              className="bg-transparent border border-border rounded-lg px-3 py-2 text-xs flex-1"
            >
              <option value="all">All Countries</option>
              {Array.from(new Set(data.tracking.map(t => t.country).filter(Boolean))).map(c => (
                <option key={c} value={c!}>{c}</option>
              ))}
            </select>
            <select 
              value={filter.device} 
              onChange={(e) => setFilter(prev => ({ ...prev, device: e.target.value }))}
              className="bg-transparent border border-border rounded-lg px-3 py-2 text-xs flex-1"
            >
              <option value="all">All Devices</option>
              {Array.from(new Set(data.tracking.map(t => t.device).filter(Boolean))).map(d => (
                <option key={d} value={d!}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Traffic Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
              <ReTooltip contentStyle={{ background: '#080a0f', border: '1px solid #ffffff20', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="value" stroke="#d4af37" fill="#d4af3720" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Top Pages</h3>
          <div className="space-y-4">
            {stats.pages.map((p, i) => (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{p.name}</span>
                  <span className="font-bold">{p.value}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${stats.pages[0] ? (p.value / stats.pages[0].value) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.devices}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] as string} />
                ))}
              </Pie>
              <ReTooltip contentStyle={{ background: '#080a0f', border: '1px solid #ffffff20', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stats.devices.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] as string }} />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Geographic Reach</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.countries.map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-primary" />
                  <span className="text-xs font-bold">{c.name}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{c.value} visits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsTab() {
  const [filterType, setFilterType] = useState<string>("all");
  const auditLogs = useQuery({ queryKey: ["audit-logs"], queryFn: useServerFn(getAuditLogs) });
  const emailLogs = useQuery({ queryKey: ["email-logs"], queryFn: useServerFn(getEmailLogs) });

  const filteredAudit = auditLogs.data?.filter(l => filterType === "all" || l.action_type === filterType);

  return (
    <div className="space-y-8">
      <div className="glass overflow-x-auto rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold uppercase text-primary">System Audit Log</h2>
          <div className="flex gap-2">
            {["all", "theme", "role", "export", "backup", "template", "security"].map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${filterType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr><th className="py-2">User</th><th>Action</th><th>Type</th><th>Details</th><th>Date</th></tr>
          </thead>
          <tbody>
            {filteredAudit?.map(l => (
              <tr key={l.id} className="border-t border-border/50 group hover:bg-white/5 transition-colors">
                <td className="py-3 font-bold">{(l.profiles as any)?.email}</td>
                <td><span className="bg-primary/5 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">{l.action}</span></td>
                <td className="uppercase font-bold tracking-tighter opacity-70">{l.action_type}</td>
                <td className="font-mono text-[10px] max-w-xs truncate">{JSON.stringify(l.details)}</td>
                <td className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="glass overflow-x-auto rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Email Logs (Confirmations)</h2>
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr><th className="py-2">Recipient</th><th>Subject</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {emailLogs.data?.map(l => (
              <tr key={l.id} className="border-t border-border">
                <td className="py-3">{l.recipient}</td>
                <td>{l.subject}</td>
                <td className={l.status === 'sent' ? 'text-green-500' : 'text-red-500'}>{l.status}</td>
                <td>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BackupButton() {
  const backup = useServerFn(backupSettings);
  const mutation = useMutation({
    mutationFn: () => backup(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ambition-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success("Backup downloaded");
    },
    onError: (e) => toast.error("Backup failed"),
  });

  return (
    <button 
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors"
    >
      {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
      Export Site Backup
    </button>
  );
}

function RestoreButton() {
  const [dryRunData, setDryRunData] = useState<any>(null);
  const restore = useServerFn(restoreSettings);
  const mutation = useMutation({
    mutationFn: (data: any) => restore({ data }),
    onSuccess: () => {
      toast.success("Settings restored! Reloading...");
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: (e) => toast.error("Restore failed"),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setDryRunData(data);
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <label className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-muted-foreground text-[10px] font-bold uppercase hover:border-primary hover:text-foreground cursor-pointer transition-colors">
        {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
        Restore from Backup
        <input type="file" accept=".json" onChange={handleFile} className="hidden" />
      </label>

      {dryRunData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-2xl rounded-[2rem] p-8 border border-primary/20 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-black uppercase tracking-widest text-primary mb-4">Restore Dry-Run Preview</h3>
            <p className="text-xs text-muted-foreground mb-6 uppercase tracking-wider">The following sections will be overwritten:</p>
            
            <div className="space-y-4 mb-8">
              {Object.keys(dryRunData).map(key => (
                <div key={key} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold uppercase text-primary mb-2">{key}</p>
                  <pre className="text-[9px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(dryRunData[key], null, 2).slice(0, 300)}...
                  </pre>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => mutation.mutate(dryRunData)}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] transition-all"
              >
                Confirm Restore
              </button>
              <button 
                onClick={() => setDryRunData(null)}
                className="flex-1 bg-white/5 text-foreground py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



function CustomizationTab({ onDone }: { onDone: () => void }) {
  const getVideosFn = useServerFn(getCustomizationVideos);
  const upsertVideoFn = useServerFn(upsertCustomizationVideo);
  const deleteVideoFn = useServerFn(deleteCustomizationVideo);
  const getStatsFn = useServerFn(getEngagementStats);
  
  const { data: videos, refetch } = useQuery({
    queryKey: ['admin-customization-videos'],
    queryFn: () => getVideosFn({ data: { all: true } }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-customization-stats'],
    queryFn: () => getStatsFn(),
  });

  const [editing, setEditing] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const mutation = useMutation({
    mutationFn: (data: any) => upsertVideoFn({ data }),
    onSuccess: () => {
      toast.success("Video saved");
      setEditing(null);
      refetch();
      onDone();
    },
    onError: (e: any) => toast.error(e.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVideoFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Video deleted");
      refetch();
      onDone();
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('studio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('studio-assets')
        .getPublicUrl(filePath);

      setEditing({ ...editing, video_url: publicUrl });
      toast.success("Video uploaded successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-extrabold uppercase">Studio Manager</h2>
          <p className="text-xs text-muted-foreground">Manage manufacturing process videos and descriptions.</p>
        </div>
        <button 
          onClick={() => setEditing({ title: '', description: '', video_url: '', display_order: (videos?.length || 0) + 1, is_published: true, captions: [] })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase"
        >
          Add Video
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats?.map((s: any) => (
          <div key={s.id} className="glass p-4 rounded-2xl">
            <p className="text-[8px] font-bold uppercase text-muted-foreground truncate">{s.title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black">{s.total_plays || 0}</span>
              <span className="text-[8px] text-muted-foreground uppercase font-bold">Plays</span>
            </div>
            <p className="text-[8px] mt-1 text-muted-foreground uppercase font-bold">
              {Math.round((s.total_time_watched || 0) / 60)}m watched
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos?.map((v: any) => (
          <div key={v.id} className="glass rounded-3xl overflow-hidden flex flex-col">
            <div className="aspect-video bg-black relative">
              <video src={v.video_url} className="w-full h-full object-cover opacity-60" muted />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Play size={32} className="text-white/50" />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <a 
                  href={v.video_url} 
                  download 
                  className="p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                  title="Download"
                >
                  <Download size={14} />
                </a>
              </div>
            </div>
            <div className="p-4 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold uppercase text-sm truncate">{v.title}</h3>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${v.is_published ? 'border-primary/30 text-primary' : 'border-white/10 text-muted-foreground'}`}>
                  {v.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{v.description}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditing(v)}
                  className="flex-grow glass border border-white/10 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-white/5"
                >
                  Edit
                </button>
                <button 
                  onClick={() => confirm("Delete this video?") && deleteMutation.mutate(v.id)}
                  className="px-3 border border-red-500/30 text-red-500 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] p-8 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic">Video Details</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {editing.id ? 'Review Mode' : 'New Draft'}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Title</label>
                  <input 
                    placeholder="Title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={editing.title}
                    onChange={e => setEditing({...editing, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Description</label>
                  <textarea 
                    placeholder="Description"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[100px]"
                    value={editing.description}
                    onChange={e => setEditing({...editing, description: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Video Asset</label>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Video URL"
                      className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      value={editing.video_url}
                      onChange={e => setEditing({...editing, video_url: e.target.value})}
                    />
                    <label className="cursor-pointer bg-white/10 border border-white/10 px-4 py-3 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      <input type="file" className="hidden" accept="video/mp4" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="space-y-1 flex-grow">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Display Order</label>
                    <input 
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                      value={editing.display_order}
                      onChange={e => setEditing({...editing, display_order: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editing.is_published}
                        onChange={e => setEditing({...editing, is_published: e.target.checked})}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Published</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Subtitles size={12} /> Captions / Subtitles
                  </label>
                  <button 
                    onClick={() => {
                      const caps = [...(editing.captions || [])];
                      caps.push({ start: 0, end: 5, text: '' });
                      setEditing({ ...editing, captions: caps });
                    }}
                    className="text-[8px] font-bold uppercase text-primary border border-primary/20 px-2 py-1 rounded"
                  >
                    Add Row
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {(editing.captions || []).map((c: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0" 
                        className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px]"
                        value={c.start}
                        onChange={e => {
                          const caps = [...editing.captions];
                          caps[idx].start = parseFloat(e.target.value);
                          setEditing({ ...editing, captions: caps });
                        }}
                      />
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="5.0" 
                        className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px]"
                        value={c.end}
                        onChange={e => {
                          const caps = [...editing.captions];
                          caps[idx].end = parseFloat(e.target.value);
                          setEditing({ ...editing, captions: caps });
                        }}
                      />
                      <input 
                        placeholder="Text..." 
                        className="flex-grow bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px]"
                        value={c.text}
                        onChange={e => {
                          const caps = [...editing.captions];
                          caps[idx].text = e.target.value;
                          setEditing({ ...editing, captions: caps });
                        }}
                      />
                      <button 
                        onClick={() => {
                          const caps = editing.captions.filter((_: any, i: number) => i !== idx);
                          setEditing({ ...editing, captions: caps });
                        }}
                        className="text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {(!editing.captions || editing.captions.length === 0) && (
                    <p className="text-[10px] text-muted-foreground text-center py-4 italic">No captions added yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button 
                onClick={() => setEditing(null)}
                className="flex-grow glass border border-white/10 py-3 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button 
                onClick={() => mutation.mutate(editing)}
                disabled={mutation.isPending || isUploading}
                className="flex-grow bg-primary text-primary-foreground py-3 rounded-xl text-xs font-bold uppercase"
              >
                {mutation.isPending ? 'Saving...' : 'Save Draft / Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

