import { Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react";
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
  imageFile: null,
  imagePreview: "",
  price: 0,
  oldPrice: 0,
  countInStock: 0,
  rating: 0,
  numReviews: 0,
  tags: "",
  features: "",
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
      const { data } = await api.get("/api/products", { params: { limit: 300, sort: "newest" } });
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
      imageFile: null,
      imagePreview: product.image || "",
      price: product.price || 0,
      oldPrice: product.oldPrice || 0,
      countInStock: product.countInStock || 0,
      rating: product.rating || 0,
      numReviews: product.numReviews || 0,
      tags: (product.tags && Array.isArray(product.tags) ? product.tags.join(", ") : "") || "",
      features: (product.features && Array.isArray(product.features) ? product.features.join("\n") : "") || "",
      isFeatured: Boolean(product.isFeatured),
    });
    setShowModal(true);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress image before converting to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if larger than 800px
        if (width > 800 || height > 800) {
          const ratio = Math.min(800 / width, 800 / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with quality 0.75
        const base64String = canvas.toDataURL("image/jpeg", 0.75);
        setForm((p) => ({
          ...p,
          imageFile: file,
          image: base64String,
          imagePreview: base64String,
        }));
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  }

  async function submitProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        category: form.category,
        brand: form.brand,
        image: form.image,
        price: Number(form.price),
        oldPrice: Number(form.oldPrice),
        countInStock: Number(form.countInStock),
        rating: Number(form.rating),
        numReviews: Number(form.numReviews),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter((t) => t) : [],
        features: form.features ? form.features.split("\n").map((f) => f.trim()).filter((f) => f) : [],
        isFeatured: form.isFeatured,
      };

      if (editing) {
        await api.put(`/api/products/${editing._id}`, payload);
      } else {
        await api.post("/api/products", payload);
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
      await api.delete(`/api/products/${productId}`);
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
          <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/60 p-4">
            <form onSubmit={submitProduct} className="glass-panel w-full max-w-4xl rounded-[1.8rem] p-4 sm:p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">{editing ? "Edit Product" : "Add New Product"}</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={24} />
                </button>
              </div>

              {/* IMAGE SECTION */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <h3 className="mb-4 text-lg font-bold text-slate-700 dark:text-slate-200">📸 Product Image</h3>
                <div className="rounded-xl border-2 border-dashed border-blue-400/50 bg-blue-50/30 p-6 dark:border-blue-500/30 dark:bg-blue-500/5">
                  <div className="flex items-end gap-6">
                    <label className="flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-blue-300 bg-blue-100/50 px-6 py-8 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/15 dark:hover:bg-blue-500/20 flex-1">
                      <Upload size={32} className="mb-2 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Click to upload or drag & drop</span>
                      <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WebP (max 5MB)</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    {form.imagePreview && (
                      <div className="relative">
                        <div className="text-center">
                          <img src={form.imagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover border-2 border-green-400" />
                          <p className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">✓ Image ready</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, image: "", imageFile: null, imagePreview: "" }))}
                          className="absolute -right-3 -top-3 rounded-full bg-rose-500 p-1.5 text-white hover:bg-rose-600 shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BASIC INFO SECTION */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <h3 className="mb-4 text-lg font-bold text-slate-700 dark:text-slate-200">📝 Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Product Name *</span>
                    <input className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="e.g., Aurora Noise-Cancel Headphones" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">The display name of your product</p>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Slug (URL) *</span>
                    <input className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="e.g., aurora-headphones-1" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">URL-friendly name (lowercase, hyphens only)</p>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Category *</span>
                    <input className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="e.g., Electronics, Fashion, Home" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Product category for filtering</p>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Brand *</span>
                    <input className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="e.g., Aurora Audio, Nike" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} required />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manufacturer or brand name</p>
                  </label>
                </div>
              </div>

              {/* PRICING SECTION */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <h3 className="mb-4 text-lg font-bold text-slate-700 dark:text-slate-200">💰 Pricing & Stock</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Selling Price *</span>
                    <input type="number" min="0" step="0.01" className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="0.00" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Current selling price</p>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Original Price (Optional)</span>
                    <input type="number" min="0" step="0.01" className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="0.00" value={form.oldPrice} onChange={(e) => setForm((p) => ({ ...p, oldPrice: e.target.value }))} />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Leave blank if no sale. Shows discount % on frontend</p>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Stock Quantity *</span>
                    <input type="number" min="0" className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="0" value={form.countInStock} onChange={(e) => setForm((p) => ({ ...p, countInStock: e.target.value }))} required />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Available units in inventory</p>
                  </label>
                </div>
              </div>

              {/* RATINGS SECTION */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <h3 className="mb-4 text-lg font-bold text-slate-700 dark:text-slate-200">⭐ Ratings & Reviews</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Average Rating</span>
                    <input type="number" min="0" max="5" step="0.1" className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="4.5" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Rating from 0 to 5 stars (e.g., 4.8)</p>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Number of Reviews</span>
                    <input type="number" min="0" className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="0" value={form.numReviews} onChange={(e) => setForm((p) => ({ ...p, numReviews: e.target.value }))} />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total number of customer reviews</p>
                  </label>
                </div>
              </div>

              {/* DESCRIPTION SECTION */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <label className="block">
                  <span className="mb-2 text-lg font-bold text-slate-700 dark:text-slate-200">📄 Description *</span>
                  <textarea className="h-28 w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Write a detailed product description. Include key features, benefits, and specifications..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Detailed product description displayed on product pages (max 4000 characters)</p>
                </label>
              </div>

              {/* TAGS SECTION */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <label className="block">
                  <span className="mb-2 text-lg font-bold text-slate-700 dark:text-slate-200">🏷️ Tags</span>
                  <input className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="wireless, premium, audio, noise-cancellation, lightweight" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Comma-separated keywords for searchability (max 20 tags)</p>
                </label>
              </div>

              {/* FEATURES SECTION */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <label className="block">
                  <span className="mb-2 text-lg font-bold text-slate-700 dark:text-slate-200">✨ Key Features</span>
                  <textarea className="h-24 w-full rounded-lg border bg-white px-3 py-2.5 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Active noise cancellation&#10;40-hour battery life&#10;Bluetooth 5.0 connectivity&#10;Premium leather earcups" value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">One feature per line. Displayed as bullet points on product page (max 30 features)</p>
                </label>
              </div>

              {/* OPTIONS SECTION */}
              <div className="mb-6">
                <label className="flex items-center gap-3 rounded-lg border-2 border-amber-200/50 bg-amber-50/30 p-3 dark:border-amber-500/30 dark:bg-amber-500/5 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} className="h-5 w-5 cursor-pointer rounded" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">⭐ Featured Product</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(Shows on homepage)</span>
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)} className="order-2 sm:order-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="order-1 sm:order-2">
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    editing ? "✓ Save Changes" : "✓ Create Product"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </AdminShell>
    </PageTransition>
  );
}
