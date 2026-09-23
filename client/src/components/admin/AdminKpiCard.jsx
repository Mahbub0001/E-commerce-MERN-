import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const toneStyles = {
  brand: {
    bg: "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400",
    border: "border-brand-500/20",
    badge: "bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300",
  },
  green: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  sky: {
    bg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
};

export default function AdminKpiCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  tone = "brand",
  subtitle,
}) {
  const currentTone = toneStyles[tone] || toneStyles.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-panel relative overflow-hidden rounded-[2rem] p-6 border ${currentTone.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${currentTone.bg} shadow-sm`}>
            <Icon size={24} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
              isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
            }`}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </span>
        )}

        {subtitle && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
}
