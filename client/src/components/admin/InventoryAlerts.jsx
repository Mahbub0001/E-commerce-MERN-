import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";

export default function InventoryAlerts({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-slate-500">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
          ✓
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-200">Inventory Healthy</p>
        <p className="text-xs text-slate-400 mt-0.5">All products have sufficient inventory.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {products.map((product) => {
        const isCritical = (product.countInStock ?? 0) <= 3;
        return (
          <div
            key={product._id}
            className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/70 p-3.5 dark:border-slate-800/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-11 w-11 shrink-0 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-400">
                  IMG
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{product.category}</span>
                  <span>•</span>
                  <span>{formatCurrency(product.price)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                  isCritical
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                <AlertTriangle size={12} />
                {product.countInStock} left
              </span>

              <Link
                to="/admin/products"
                className="rounded-xl p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Manage product"
              >
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
