import { motion } from "framer-motion";
import { Flame, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import SectionHeader from "../common/SectionHeader";
import api from "../../services/api";
import { normalizeProduct } from "../../utils/normalizeProduct";

export default function RecommendedShelf() {
  const [activeTab, setActiveTab] = useState("forYou");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    forYou: [],
    trending: [],
    flashDeals: [],
  });

  useEffect(() => {
    let isMounted = true;
    async function loadRecommendations() {
      try {
        const res = await api.get("/api/products/recommendations/personalized");
        const payload = res.data?.data || {};
        if (isMounted) {
          setData({
            forYou: (payload.forYou || []).map(normalizeProduct),
            trending: (payload.trending || []).map(normalizeProduct),
            flashDeals: (payload.flashDeals || []).map(normalizeProduct),
          });
        }
      } catch (err) {
        console.warn("Failed to load recommendations shelf:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRecommendations();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeList = data[activeTab] || [];

  return (
    <section className="container-pad py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Smart Picks"
          title="Curated Recommendations"
          text="Dynamic suggestions tailored by user affinity, ratings, and catalog trends."
        />

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/70 p-1.5 shadow-sm backdrop-blur-md dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setActiveTab("forYou")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
              activeTab === "forYou"
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Sparkles size={15} /> For You
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trending")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
              activeTab === "trending"
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Flame size={15} /> Trending
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flashDeals")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
              activeTab === "flashDeals"
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Zap size={15} /> Top Deals
          </button>
        </div>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 animate-pulse rounded-[1.75rem] border bg-slate-100 dark:border-white/10 dark:bg-slate-900"
              />
            ))}
          </div>
        ) : activeList.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-10 text-center text-slate-500">
            No recommendations in this category yet.
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {activeList.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
