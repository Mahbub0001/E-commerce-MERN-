import { motion } from "framer-motion";

const variants = {
  primary: "gradient-button",
  secondary:
    "bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
};

export default function Button({ children, className = "", variant = "primary", as: Component = "button", ...props }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }} className="inline-flex">
      <Component
        className={`btn-glow relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
}
