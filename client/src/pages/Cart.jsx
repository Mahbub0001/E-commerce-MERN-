import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Tag, Truck, XCircle } from "lucide-react";
import CartItem from "../components/cart/CartItem";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function Cart() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const discount = subtotal >= 300 ? subtotal * 0.08 : 0;
  const finalTotal = Math.max(total - discount, 0);

  if (items.length === 0) {
    return (
      <PageTransition>
        <section className="container-pad py-20">
          <div className="glass-panel mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">
              <ShoppingBag size={30} />
            </div>
            <h1 className="mt-6 text-3xl font-black">Cart is empty</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              No items yet. Explore catalog and add products you love.
            </p>
            <Button as={Link} to="/products" className="mt-6">
              Continue shopping
            </Button>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="container-pad grid gap-8 py-8 pb-14 sm:py-12 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-black">Shopping cart</h1>
            <Button variant="ghost" className="min-h-11 border border-rose-300 text-rose-600 hover:bg-rose-50" onClick={clearCart}>
              <XCircle size={16} /> Clear cart
            </Button>
          </div>
          <div className="grid gap-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.98 }}
                  transition={{ duration: 0.26 }}
                >
                  <CartItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <aside className="glass-panel h-fit rounded-[2rem] p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl font-black">Order summary</h2>
          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><Tag size={14} /> Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><Truck size={14} /> Estimated shipping</span>
              <strong>{formatCurrency(shipping)}</strong>
            </div>
            <div className="flex items-center justify-between text-emerald-600">
              <span className="inline-flex items-center gap-2"><Tag size={14} /> Discount</span>
              <strong>-{formatCurrency(discount)}</strong>
            </div>
            <div className="border-t pt-3 text-lg font-black flex justify-between"><span>Total</span><span>{formatCurrency(finalTotal)}</span></div>
          </div>
          <Button as={Link} to="/checkout" className="mt-6 min-h-12 w-full justify-center">
            Checkout <ArrowRight size={16} />
          </Button>
          <p className="mt-3 text-xs text-slate-500">Discount auto-applied for orders above {formatCurrency(300)}.</p>
        </aside>
      </section>
    </PageTransition>
  );
}
