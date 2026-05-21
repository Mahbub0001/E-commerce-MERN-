import { ShoppingBag } from "lucide-react";
import Button from "./Button";

export default function EmptyState({ title, text, actionLabel = "Explore products", to = "/products" }) {
  return (
    <div className="glass-panel mx-auto max-w-xl rounded-[2rem] p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">
        <ShoppingBag size={30} />
      </div>
      <h2 className="mt-6 text-2xl font-black">{title}</h2>
      <p className="mt-3 text-slate-600 dark:text-slate-300">{text}</p>
      <Button as="a" href={to} className="mt-6">
        {actionLabel}
      </Button>
    </div>
  );
}
