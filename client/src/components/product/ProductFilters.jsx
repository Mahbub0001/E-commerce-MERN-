import { Search } from "lucide-react";
import { categories } from "../../data/sampleProducts";

export default function ProductFilters({ search, setSearch, category, setCategory, sort, setSort }) {
  return (
    <div className="glass-panel rounded-[2rem] p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search premium products"
            className="w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-slate-950"
          />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-950">
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-950">
          <option value="featured">Featured</option>
          <option value="price-low">Price low to high</option>
          <option value="price-high">Price high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
    </div>
  );
}
