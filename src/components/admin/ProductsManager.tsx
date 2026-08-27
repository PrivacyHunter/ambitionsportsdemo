import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, Edit3, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct, duplicateProduct, upsertProduct } from "@/lib/admin.functions";
import { copyToClipboard, downloadUrl } from "@/lib/media";
import { MediaField } from "./MediaField";

type Product = {
  id: string; name: string; slug: string; category: string; description: string | null;
  price: number | null; stock: number; images: unknown; sizes: unknown; colors: unknown;
  cover_image: string | null; is_featured: boolean; is_active: boolean; status: string;
  scheduled_publish_at: string | null; sort_order: number;
};

type Form = {
  id?: string; name: string; slug: string; category: "sportswear" | "activewear" | "casualwear";
  description: string; price: number; stock: number; images: string[]; sizes: string; colors: string;
  is_featured: boolean; is_active: boolean; status: "draft" | "published" | "scheduled";
  scheduled_publish_at: string | null; sort_order: number;
};

const EMPTY: Form = { name: "", slug: "", category: "sportswear", description: "", price: 0, stock: 0, images: [], sizes: "", colors: "", is_featured: false, is_active: true, status: "published", scheduled_publish_at: null, sort_order: 0 };
const strings = (value: unknown) => Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

export function ProductsManager({ products, onDone }: { products: Product[]; onDone: () => void }) {
  const [form, setForm] = useState<Form | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const save = useServerFn(upsertProduct);
  const remove = useServerFn(deleteProduct);
  const duplicate = useServerFn(duplicateProduct);

  const rows = useMemo(() => products.filter((p) => {
    const matchText = `${p.name} ${p.slug}`.toLowerCase().includes(search.toLowerCase());
    return matchText && (category === "all" || p.category === category);
  }), [products, search, category]);

  const saveMutation = useMutation({
    mutationFn: (value: Form) => save({ data: {
      ...value, cover_image: value.images[0] ?? null,
      sizes: value.sizes.split(",").map((v) => v.trim()).filter(Boolean),
      colors: value.colors.split(",").map((v) => v.trim()).filter(Boolean),
    }}),
    onSuccess: () => { toast.success("Product saved"); setForm(null); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: () => { toast.success("Product deleted"); onDone(); } });
  const duplicateMutation = useMutation({ mutationFn: (id: string) => duplicate({ data: { id } }), onSuccess: () => { toast.success("Draft copy created"); onDone(); } });

  const edit = (p: Product) => setForm({
    id: p.id, name: p.name, slug: p.slug, category: p.category as Form["category"], description: p.description ?? "",
    price: Number(p.price ?? 0), stock: p.stock, images: strings(p.images).length ? strings(p.images) : (p.cover_image ? [p.cover_image] : []),
    sizes: strings(p.sizes).join(", "), colors: strings(p.colors).join(", "), is_featured: p.is_featured, is_active: p.is_active,
    status: (p.status as Form["status"]) ?? "published", scheduled_publish_at: p.scheduled_publish_at, sort_order: p.sort_order ?? 0,
  });

  return <div className="space-y-6">
    <div className="glass flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-end sm:justify-between">
      <div><h2 className="text-lg font-extrabold uppercase">Products</h2><p className="text-xs text-muted-foreground">Manage the live catalog and product media.</p></div>
      <button onClick={() => setForm({ ...EMPTY })} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase text-primary-foreground"><Plus size={14}/> Add product</button>
    </div>
    <div className="glass rounded-3xl p-4 sm:p-6">
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_190px]">
        <label className="flex items-center gap-2 rounded-xl border border-border px-3"><Search size={15}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm"><option value="all">All categories</option><option value="sportswear">Sportswear</option><option value="activewear">Activewear</option><option value="casualwear">Casual wear</option></select>
      </div>
      <div className="divide-y divide-border">
        {rows.map((p) => { const image = p.cover_image || strings(p.images)[0] || ""; return <div key={p.id} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
          <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">{image && <img src={image} alt={p.name} className="h-full w-full object-cover"/>}</div>
          <div className="min-w-0"><p className="truncate text-sm font-black uppercase">{p.name}</p><p className="text-[10px] font-bold uppercase tracking-wider text-primary">{p.category}</p><p className="text-xs text-muted-foreground">{p.status} · stock {p.stock} · {p.price ? `${p.price}` : "Custom quote"}</p></div>
          <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
            <Action icon={Edit3} label="Edit" onClick={() => edit(p)}/><Action icon={Copy} label="Duplicate" onClick={() => duplicateMutation.mutate(p.id)}/>
            {image && <><Action icon={Copy} label="Copy link" onClick={async () => { await copyToClipboard(image); toast.success("Link copied"); }}/><Action icon={Download} label="Download" onClick={() => downloadUrl(image, `${p.slug}.jpg`)}/></>}
            <Action icon={Trash2} label="Delete" danger onClick={() => confirm(`Delete ${p.name}?`) && deleteMutation.mutate(p.id)}/>
          </div>
        </div>; })}
        {!rows.length && <p className="py-10 text-center text-xs text-muted-foreground">No matching products.</p>}
      </div>
    </div>
    {form && <div className="fixed inset-0 z-[70] grid place-items-center bg-background/90 p-4 backdrop-blur-md" onClick={() => setForm(null)}><form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="glass max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl p-6">
      <div className="flex items-center justify-between"><h3 className="font-black uppercase">{form.id ? "Update product" : "Add product"}</h3><button type="button" onClick={() => setForm(null)}>Close</button></div>
      <MediaField label="Product image" value={form.images[0] ?? ""} folder="products" accept="image/*" onChange={(url) => setForm({ ...form, images: url ? [url, ...form.images.slice(1)] : form.images.slice(1) })}/>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })}/><Field label="Slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })}/></div>
      <Field label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })}/>
      <div className="grid gap-3 sm:grid-cols-3"><Select label="Category" value={form.category} options={["sportswear","activewear","casualwear"]} onChange={(category) => setForm({ ...form, category: category as Form["category"] })}/><NumberField label="Price" value={form.price} onChange={(price) => setForm({ ...form, price })}/><NumberField label="Stock" value={form.stock} onChange={(stock) => setForm({ ...form, stock })}/></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Sizes (comma separated)" value={form.sizes} onChange={(sizes) => setForm({ ...form, sizes })}/><Field label="Colors (comma separated)" value={form.colors} onChange={(colors) => setForm({ ...form, colors })}/></div>
      <div className="grid gap-3 sm:grid-cols-3"><Select label="Status" value={form.status} options={["published","draft","scheduled"]} onChange={(status) => setForm({ ...form, status: status as Form["status"] })}/><NumberField label="Display order" value={form.sort_order} onChange={(sort_order) => setForm({ ...form, sort_order })}/><label><span className="text-[10px] font-bold uppercase text-muted-foreground">Publish at</span><input type="datetime-local" value={form.scheduled_publish_at?.slice(0,16) ?? ""} onChange={(e) => setForm({ ...form, scheduled_publish_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"/></label></div>
      <div className="flex gap-3"><Toggle label="Featured" value={form.is_featured} onChange={(is_featured) => setForm({ ...form, is_featured })}/><Toggle label="Active" value={form.is_active} onChange={(is_active) => setForm({ ...form, is_active })}/></div>
      <button disabled={saveMutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-black uppercase text-primary-foreground">{saveMutation.isPending && <Loader2 size={14} className="animate-spin"/>} Save product</button>
    </form></div>}
  </div>;
}

function Action({ icon: Icon, label, onClick, danger = false }: { icon: typeof Copy; label: string; onClick: () => void; danger?: boolean }) { return <button type="button" title={label} onClick={onClick} className={`flex items-center gap-1 rounded-lg border px-2.5 py-2 text-[9px] font-bold uppercase ${danger ? "border-destructive/40 text-destructive" : "border-border hover:border-primary hover:text-primary"}`}><Icon size={12}/>{label}</button>; }
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <label><span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span><input required value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"/></label>; }
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) { return <label><span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span><input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"/></label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) { return <label><span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) { return <button type="button" onClick={() => onChange(!value)} className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase ${value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{label}</button>; }