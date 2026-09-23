import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  Lightbulb,
  Loader2,
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const PRESET_PROMPTS = [
  { label: "🎙️ Podcast studio setup under $300", query: "I want a podcast studio setup under $300" },
  { label: "☕ Gift for a coffee enthusiast", query: "Suggest a premium gift for a coffee lover under $150" },
  { label: "🌸 Skincare routine for glowing skin", query: "Suggest a skincare routine for radiant glowing skin" },
  { label: "🎮 Budget gaming accessories", query: "Best accessories for PC and console gaming under $200" },
  { label: "✒️ Study and stationery essentials", query: "Premium stationery and desk setup for writing and study" },
];

export default function AIShoppingAdvisorModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [addedIds, setAddedIds] = useState(new Set());
  const { addToCart } = useCart();

  async function handleAskAI(customQuery) {
    const textToAsk = (customQuery || query).trim();
    if (!textToAsk) return;

    setLoading(true);
    setError("");
    setQuery(textToAsk);

    try {
      const res = await api.post("/api/products/recommendations/ai-advisor", {
        query: textToAsk,
      });
      const data = res.data?.data;
      if (data) {
        setResult(data);
      } else {
        setError("Could not retrieve AI recommendations. Please try again.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "AI recommendation service is temporarily busy. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(product) {
    addToCart(product, 1);
    setAddedIds((prev) => new Set(prev).add(product._id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product._id);
        return next;
      });
    }, 2500);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950"
        >
          {/* Header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-brand-600 via-indigo-600 to-fuchsia-600 p-6 text-white dark:border-white/10 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 shadow-glow backdrop-blur-md">
                  <Sparkles size={24} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black sm:text-2xl">Nova AI Shopping Advisor</h2>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                      Gemini AI
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/80 sm:text-sm">
                    Tell us what you are looking for, your budget, or occasion.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-5 sm:p-7">
            {/* Quick Prompt Chips */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Popular suggestions:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {PRESET_PROMPTS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={loading}
                    onClick={() => handleAskAI(preset.query)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:bg-brand-950/40"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI();
              }}
              className="mt-5 flex gap-2"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask e.g. 'I want a fitness tracker under $200 with heart monitor'"
                className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-slate-900"
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="min-h-12 shrink-0 px-5"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-8 space-y-4 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
                  <Bot size={26} className="animate-pulse" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Analyzing 62 catalog products with Gemini AI...
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
                  <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
                </div>
              </div>
            )}

            {/* Results Section */}
            {result && !loading && (
              <div className="mt-6 space-y-6">
                {/* AI Summary Box */}
                <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 p-4 text-sm leading-relaxed text-slate-800 dark:border-brand-500/20 dark:bg-brand-950/20 dark:text-brand-100">
                  <div className="mb-2 flex items-center gap-2 font-black text-brand-700 dark:text-brand-300">
                    <Sparkles size={16} /> Nova AI Recommendation
                  </div>
                  <p>{result.summary}</p>
                </div>

                {/* Recommended Product Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {(result.products || []).map((prod) => {
                    const isAdded = addedIds.has(prod._id);
                    return (
                      <div
                        key={prod._id}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900"
                      >
                        <div className="flex gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              {prod.category}
                            </span>
                            <h4 className="truncate text-sm font-black text-slate-900 dark:text-white">
                              {prod.name}
                            </h4>
                            <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                              <Star size={13} fill="currentColor" />
                              <span className="font-bold">{prod.rating}</span>
                              <span className="text-slate-400">({prod.numReviews || 0})</span>
                            </div>
                            <p className="mt-1 text-sm font-black text-brand-600 dark:text-brand-300">
                              {formatCurrency(prod.price)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t pt-3 dark:border-white/10">
                          <Link
                            to={`/products/${prod._id}`}
                            onClick={onClose}
                            className="flex-1 text-center text-xs font-bold text-slate-600 hover:text-brand-600 dark:text-slate-300"
                          >
                            View details
                          </Link>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleAddToCart(prod)}
                            className={`min-h-9 px-3 text-xs ${
                              isAdded
                                ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                : ""
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check size={14} /> Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} /> Add
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shopping Tips Box */}
                {result.tips && result.tips.length > 0 && (
                  <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                    <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-bold">Pro Tip:</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {result.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
