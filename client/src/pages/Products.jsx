import { AnimatePresence, motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import ProductCard from "../components/product/ProductCard";
import api from "../services/api";
import { normalizeProduct } from "../utils/normalizeProduct";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price Low to High", value: "price_asc" },
  { label: "Price High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating_desc" },
];

const ratingOptions = [4.5, 4, 3.5, 3];
const fallbackCategories = ["All", "Electronics", "Fashion", "Fitness", "Gaming", "Home", "Accessories"];

function SkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.75rem] border bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="h-56 animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-4 p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterPanel({ filters, setFilters, clearFilters, categories, maxPrice }) {
  return (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500">Category</p>
        <div className="grid gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilters((current) => ({ ...current, category }))}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                filters.category === category
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Max Price</p>
          <span className="text-sm font-black">${filters.priceRange}</span>
        </div>
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={filters.priceRange}
          onChange={(event) => setFilters((current) => ({ ...current, priceRange: Number(event.target.value) }))}
          className="w-full accent-brand-600"
        />
        <div className="mt-2 flex justify-between text-xs font-bold text-slate-500">
          <span>$0</span>
          <span>${maxPrice}</span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500">Rating</p>
        <div className="grid gap-2">
          <button
            onClick={() => setFilters((current) => ({ ...current, rating: 0 }))}
            className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${filters.rating === 0 ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white dark:bg-slate-950"}`}
          >
            All ratings
          </button>
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters((current) => ({ ...current, rating }))}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                filters.rating === rating
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
            >
              <Star size={16} fill="currentColor" className="text-amber-500" /> {rating}+ stars
            </button>
          ))}
        </div>
      </div>

      <Button variant="secondary" onClick={clearFilters} className="w-full">
        Clear filters
      </Button>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [filters, setFilters] = useState({
    search: queryFromUrl,
    category: "All",
    priceRange: 1500,
    rating: 0,
    sort: "newest",
  });

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort,
      };

      if (filters.search.trim()) params.keyword = filters.search.trim();
      if (filters.category !== "All") params.category = filters.category;
      if (filters.priceRange > 0) params.maxPrice = filters.priceRange;
      if (filters.rating > 0) params.rating = filters.rating;

      const { data } = await api.get("/api/products", { params });
      const payload = data?.data || {};
      const rows = (payload.products || []).map(normalizeProduct);
      setProducts(rows);

      const serverPagination = payload.pagination || { page: 1, pages: 1, total: rows.length, limit: pagination.limit };
      setPagination((prev) => ({ ...prev, ...serverPagination }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, pagination.limit, filters.search, filters.category, filters.priceRange, filters.rating, filters.sort]);

  useEffect(() => {
    setFilters((current) => ({ ...current, search: queryFromUrl }));
    setPagination((current) => ({ ...current, page: 1 }));
  }, [queryFromUrl]);

  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 1500;
    return Math.max(...products.map((product) => product.price), 100);
  }, [products]);

  const categories = useMemo(() => {
    const dynamic = new Set(products.map((product) => product.category).filter(Boolean));
    if (dynamic.size === 0) return fallbackCategories;
    return ["All", ...Array.from(dynamic)];
  }, [products]);

  function clearFilters() {
    setFilters({ search: "", category: "All", priceRange: maxProductPrice, rating: 0, sort: "newest" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  return (
    <PageTransition>
      <section className="container-pad py-8 pb-14 sm:py-10 sm:pb-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-black uppercase tracking-[0.24em] text-brand-600 dark:text-brand-100">Shop</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">Explore products</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{loading ? "Loading products..." : `${pagination.total || products.length} products found`}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:min-w-[520px]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                value={filters.search}
                onChange={(event) => {
                  const next = event.target.value;
                  setFilters((current) => ({ ...current, search: next }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  if (next.trim()) setSearchParams({ q: next });
                  else setSearchParams({});
                }}
                placeholder="Search by product name"
                className="h-14 w-full rounded-2xl border bg-white pl-12 pr-4 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-slate-900"
              />
            </label>
            <select
              value={filters.sort}
              onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
              className="h-14 rounded-2xl border bg-white px-4 text-sm font-black outline-none dark:border-white/10 dark:bg-slate-900"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
          <span className="text-sm font-bold text-slate-500">{pagination.total || products.length} results</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="glass-panel sticky top-28 rounded-[2rem] p-5">
              <div className="mb-6 flex items-center gap-3">
                <Filter className="text-brand-600" />
                <h2 className="text-xl font-black">Filters</h2>
              </div>
              <FilterPanel filters={filters} setFilters={setFilters} clearFilters={clearFilters} categories={categories} maxPrice={maxProductPrice} />
            </div>
          </aside>

          <div>
            {loading ? (
              <SkeletonGrid />
            ) : error ? (
              <div className="glass-panel rounded-[2rem] p-8 text-center">
                <h2 className="text-2xl font-black text-rose-600">Failed to load products</h2>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{error}</p>
                <Button className="mt-5" onClick={fetchProducts}>Retry</Button>
              </div>
            ) : products.length === 0 ? (
              <div className="glass-panel rounded-[2rem] p-10 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">
                  <Search size={28} />
                </div>
                <h2 className="mt-6 text-2xl font-black">No products found</h2>
                <p className="mx-auto mt-3 max-w-md text-slate-600 dark:text-slate-300">
                  Try changing search, category, price, or rating filters.
                </p>
                <Button onClick={clearFilters} className="mt-6">
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} onQuickView={setQuickView} />
                  ))}
                </motion.div>
                <div className="mt-8 flex items-center justify-center gap-3">
                  <Button variant="secondary" disabled={pagination.page <= 1} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}>Prev</Button>
                  <span className="text-sm font-bold">Page {pagination.page} of {pagination.pages || 1}</span>
                  <Button variant="secondary" disabled={pagination.page >= (pagination.pages || 1)} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}>Next</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-[80] max-h-[86vh] overflow-y-auto rounded-t-[2rem] bg-mist p-5 shadow-premium dark:bg-slate-950 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black">Filters</h2>
                <button onClick={() => setDrawerOpen(false)} className="rounded-full bg-white p-3 dark:bg-slate-900">
                  <X size={20} />
                </button>
              </div>
              <FilterPanel filters={filters} setFilters={setFilters} clearFilters={clearFilters} categories={categories} maxPrice={maxProductPrice} />
              <Button onClick={() => setDrawerOpen(false)} className="mt-5 w-full">
                Show {pagination.total || products.length} products
              </Button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={() => setQuickView(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(event) => event.stopPropagation()}
              className="glass-panel w-full max-w-3xl overflow-hidden rounded-[2rem]"
            >
              <div className="grid md:grid-cols-2">
                <img src={quickView.image} alt={quickView.name} className="h-full min-h-80 w-full object-cover" />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">{quickView.category}</p>
                      <h3 className="mt-3 text-3xl font-black">{quickView.name}</h3>
                    </div>
                    <button onClick={() => setQuickView(null)} className="rounded-full bg-white p-3 dark:bg-slate-950">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-amber-500">
                    <Star size={18} fill="currentColor" />
                    <span className="font-black">{quickView.rating}</span>
                    <span className="text-slate-500">({quickView.reviews} reviews)</span>
                  </div>
                  <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">{quickView.description}</p>
                  <div className="mt-6 flex items-end gap-3">
                    <span className="text-4xl font-black">${quickView.price}</span>
                    <span className="text-lg text-slate-400 line-through">${quickView.oldPrice}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
