import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  category: "General",
  brand: "NovaMart",
  image: "",
  price: 0,
  oldPrice: 0,
  countInStock: 0,
  isFeatured: false,
};

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products", { params: { limit: 300, sort: "newest" } });
      setProducts(data?.data?.products || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);

  const filtered = useMemo(() => products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesQuery && matchesCategory;
  }), [products, query, category]);

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setShowModal(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      category: product.category || "General",
      brand: product.brand || "NovaMart",
      image: product.image || "",
      price: product.price || 0,
      oldPrice: product.oldPrice || 0,
      countInStock: product.countInStock || 0,
      isFeatured: Boolean(product.isFeatured),
    });
    setShowModal(true);
  }

  async function submitProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: Number(form.oldPrice),
        countInStock: Number(form.countInStock),
      };

      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      setShowModal(false);
      await fetchProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(productId) {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await api.delete(`/products/${productId}`);
      await fetchProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete product.");
    }
  }

  return (
    <PageTransition>
      <AdminShell title="Product management" subtitle="Create, edit, search, and monitor stock.">
        <div className="glass-panel rounded-[1.8rem] p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input className="h-11 w-full rounded-2xl border bg-white pl-10 pr-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <select className="h-11 rounded-2xl border bg-white px-4 outline-none dark:border-white/10 dark:bg-slate-950" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Button onClick={openCreate}><Plus size={16} /> Add product</Button>
          </div>

          {error && <p className="mb-3 rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}

          {loading ? (
            <div className="py-10 text-center"><Loader2 className="mx-auto animate-spin" /></div>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {filtered.map((product) => {
                  const stock = product.countInStock ?? 0;
                  const badge = stock === 0 ? ["Out", "bg-rose-100 text-rose-700"] : stock <= 10 ? ["Low", "bg-amber-100 text-amber-700"] : ["In Stock", "bg-emerald-100 text-emerald-700"];
                  return (
                    <article key={product._id} className="rounded-2xl border bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/60">
                      <div className="flex items-start gap-3">
                        <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{product.name}</p>
                          <p className="truncate text-xs text-slate-500">{product.slug}</p>
                          <p className="mt-2 text-sm">{product.category}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-black">{formatCurrency(product.price)}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${badge[1]}`}>{badge[0]}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Stock: {stock}</span>
                        <div className="flex gap-2">
                          <Button variant="secondary" className="px-3 py-2" onClick={() => openEdit(product)}>Edit</Button>
                          <Button variant="ghost" className="border border-rose-300 px-3 py-2 text-rose-600" onClick={() => deleteProduct(product._id)}><Trash2 size={14} /></Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const stock = product.countInStock ?? 0;
                    const badge = stock === 0 ? ["Out", "bg-rose-100 text-rose-700"] : stock <= 10 ? ["Low", "bg-amber-100 text-amber-700"] : ["In Stock", "bg-emerald-100 text-emerald-700"];
                    return (
                      <tr key={product._id} className="border-t dark:border-white/10">
                        <td className="py-3"><div className="flex items-center gap-3"><img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover" /><div><p className="font-bold">{product.name}</p><p className="text-xs text-slate-500">{product.slug}</p></div></div></td>
                        <td className="py-3">{product.category}</td>
                        <td className="py-3 font-bold">{formatCurrency(product.price)}</td>
                        <td className="py-3">{stock}</td>
                        <td className="py-3"><span className={`rounded-full px-3 py-1 text-xs font-black ${badge[1]}`}>{badge[0]}</span></td>
                        <td className="py-3"><div className="flex gap-2"><Button variant="secondary" className="px-3 py-2" onClick={() => openEdit(product)}>Edit</Button><Button variant="ghost" className="px-3 py-2 border border-rose-300 text-rose-600" onClick={() => deleteProduct(product._id)}><Trash2 size={14} /></Button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4">
            <form onSubmit={submitProduct} className="glass-panel w-full max-w-2xl rounded-[1.8rem] p-4 sm:p-6">
              <h2 className="text-2xl font-black">{editing ? "Edit product" : "Add product"}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input className="rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                <input className="rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />
                <input className="rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required />
                <input className="rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Brand" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} required />
                <input type="number" min="0" className="rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Price" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
                <input type="number" min="0" className="rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Old price" value={form.oldPrice} onChange={(e) => setForm((p) => ({ ...p, oldPrice: e.target.value }))} />
                <input type="number" min="0" className="rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Stock" value={form.countInStock} onChange={(e) => setForm((p) => ({ ...p, countInStock: e.target.value }))} required />
                <input className="rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Image URL" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} required />
              </div>
              <textarea className="mt-3 h-24 w-full rounded-xl border bg-white px-3 py-2 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
              <label className="mt-3 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} /> Featured</label>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Button type="submit" disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : (editing ? "Save" : "Create")}</Button><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button></div>
            </form>
          </div>
        )}
      </AdminShell>
    </PageTransition>
  );
}
