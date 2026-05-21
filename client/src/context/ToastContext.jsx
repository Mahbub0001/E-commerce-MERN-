import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const toneStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200",
  error: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200",
  info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200",
};

function ToneIcon({ tone }) {
  if (tone === "success") return <CheckCircle2 size={18} />;
  if (tone === "error") return <TriangleAlert size={18} />;
  return <Info size={18} />;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, tone = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => removeToast(id), 2600);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-24 z-[120] flex w-[92vw] max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-2xl border p-3 shadow-lg backdrop-blur ${toneStyles[toast.tone]}`}
            >
              <div className="flex items-start gap-2">
                <ToneIcon tone={toast.tone} />
                <p className="flex-1 text-sm font-semibold">{toast.message}</p>
                <button onClick={() => removeToast(toast.id)} className="opacity-70 transition hover:opacity-100">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
