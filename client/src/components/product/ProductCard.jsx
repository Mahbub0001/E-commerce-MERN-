import { motion } from "framer-motion";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wished = isWishlisted(product._id);
  const discount =
    product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition hover:shadow-premium dark:border-white/10 dark:bg-slate-900"
    >
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          {discount > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-brand-700 backdrop-blur">
              {discount}% OFF
            </span>
          )}
          <span className="absolute right-4 top-4 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-black text-white backdrop-blur">
            {product.badge}
          </span>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{product.category}</p>
            <Link to={`/products/${product._id}`} className="mt-2 block text-lg font-black text-slate-950 transition hover:text-brand-600 dark:text-white">
              {product.name}
            </Link>
          </div>
          <motion.button
            whileTap={{ scale: 0.84 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => {
              toggleWishlist(product);
            }}
            className={`rounded-full p-2 transition ${wished ? "bg-fuchsia-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"}`}
          >
            <Heart size={18} fill={wished ? "currentColor" : "none"} />
          </motion.button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-500">
          <Star size={16} fill="currentColor" />
          <span className="font-bold">{product.rating}</span>
          <span className="text-slate-500">({product.reviews})</span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <span className="text-2xl font-black">{formatCurrency(product.price)}</span>
            {product.oldPrice > product.price && (
              <span className="ml-2 text-sm text-slate-400 line-through">{formatCurrency(product.oldPrice)}</span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ y: -1 }}
            onClick={() => addToCart(product)}
            className="rounded-2xl bg-slate-950 p-3 text-white transition hover:bg-brand-600 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-100"
          >
            <ShoppingCart size={18} />
          </motion.button>
        </div>
        {onQuickView ? (
          <button
            onClick={() => onQuickView(product)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:text-slate-200"
          >
            <Eye size={17} /> Quick View
          </button>
        ) : (
          <Link
            to={`/products/${product._id}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:text-slate-200"
          >
            <Eye size={17} /> Quick View
          </Link>
        )}
      </div>
    </motion.article>
  );
}
