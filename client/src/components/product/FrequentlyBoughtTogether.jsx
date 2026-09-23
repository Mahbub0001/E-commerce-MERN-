import { motion } from "framer-motion";
import { Check, Plus, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";

export default function FrequentlyBoughtTogether({ bundle }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!bundle || !bundle.bundleProduct) return null;

  const { mainProduct, bundleProduct, discountPercent, bundlePrice, originalTotal, savings } =
    bundle;

  function handleAddBoth() {
    addToCart(mainProduct, 1);
    addToCart(bundleProduct, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <section className="mt-12 rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white via-mist/50 to-brand-50/20 p-6 shadow-sm dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/40 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <Sparkles size={20} />
          </span>
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">
              Frequently Bought Together
            </h3>
            <p className="text-xs font-bold text-slate-500">
              Bundle and save {discountPercent}% instantly
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Tag size={13} /> Save {formatCurrency(savings)}
        </span>
      </div>

      <div className="mt-8 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr_auto]">
        {/* Main Product Card */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950/60">
          <img
            src={mainProduct.image}
            alt={mainProduct.name}
            className="h-20 w-20 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              This Item
            </span>
            <p className="truncate text-sm font-black text-slate-900 dark:text-white">
              {mainProduct.name}
            </p>
            <p className="mt-1 text-sm font-black text-brand-600 dark:text-brand-300">
              {formatCurrency(mainProduct.price)}
            </p>
          </div>
        </div>

        {/* Plus Symbol */}
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Plus size={20} />
        </div>

        {/* Companion Product Card */}
        <Link
          to={`/products/${bundleProduct._id}`}
          className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-950/60"
        >
          <img
            src={bundleProduct.image}
            alt={bundleProduct.name}
            className="h-20 w-20 rounded-xl object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-600">
              Recommended Companion
            </span>
            <p className="truncate text-sm font-black text-slate-900 transition group-hover:text-brand-600 dark:text-white">
              {bundleProduct.name}
            </p>
            <p className="mt-1 text-sm font-black text-brand-600 dark:text-brand-300">
              {formatCurrency(bundleProduct.price)}
            </p>
          </div>
        </Link>

        {/* Bundle Action */}
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{formatCurrency(bundlePrice)}</span>
              <span className="text-xs text-slate-400 line-through dark:text-slate-500">
                {formatCurrency(originalTotal)}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-400 dark:text-emerald-700">
              Includes {discountPercent}% bundle savings
            </p>
          </div>

          <Button
            type="button"
            onClick={handleAddBoth}
            className={`min-h-11 w-full justify-center transition ${
              added
                ? "bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:text-white"
                : ""
            }`}
          >
            {added ? (
              <>
                <Check size={16} /> Both Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Add Both to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
