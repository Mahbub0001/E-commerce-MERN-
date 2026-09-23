import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const toneStyles = {
  brand: {
    iconBg: "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400",
    border: "border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/40 dark:hover:border-brand-500/40",
    glow: "group-hover:shadow-brand-500/10",
  },
  green: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    border: "border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40",
    glow: "group-hover:shadow-emerald-500/10",
  },
  sky: {
    iconBg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400",
    border: "border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/40 dark:hover:border-sky-500/40",
    glow: "group-hover:shadow-sky-500/10",
  },
  amber: {
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    border: "border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-500/40",
    glow: "group-hover:shadow-amber-500/10",
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
      className={`glass-panel group relative flex flex-col justify-between rounded-[1.8rem] p-5 sm:p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${currentTone.border} ${currentTone.glow}`}
    >
      <div>
        {/* Top Row: Title and Icon */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          {Icon && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentTone.iconBg} transition-transform duration-300 group-hover:scale-110 shadow-sm`}
            >
              <Icon size={20} />
            </div>
          )}
        </div>

        {/* Middle Row: Large Value with Full Width */}
        <div className="mt-3 text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
          {value}
        </div>
      </div>

      {/* Bottom Row: Trend and Subtitle */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black shrink-0 ${
              isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
            }`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
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
