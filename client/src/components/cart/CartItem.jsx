import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const maxQty = item.stock ?? 99;

  return (
    <div className="glass-panel grid gap-4 rounded-[1.5rem] p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
      <img src={item.image} alt={item.name} className="h-28 w-full rounded-2xl object-cover sm:w-28" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.category}</p>
        <h3 className="mt-1 text-lg font-black">{item.name}</h3>
        <p className="mt-2 font-bold">{formatCurrency(item.price)}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center rounded-full border bg-white dark:border-white/10 dark:bg-slate-950">
          <button className="p-3" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
            <Minus size={16} />
          </button>
          <span className="min-w-10 text-center font-black">{item.quantity}</span>
          <button className="p-3" onClick={() => updateQuantity(item._id, Math.min(item.quantity + 1, maxQty))}>
            <Plus size={16} />
          </button>
        </div>
        <button onClick={() => removeFromCart(item._id)} className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-500/20">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
