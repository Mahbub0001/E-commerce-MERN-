import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function Wishlist() {
  const { items, toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();

  function moveToCart(product) {
    addToCart(product, 1);
    if (isWishlisted(product._id)) toggleWishlist(product);
  }

  return (
    <PageTransition>
      <section className="container-pad py-12">
        <h1 className="mb-8 text-4xl font-black">Wishlist</h1>
        {items.length === 0 ? (
          <div className="glass-panel mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
              <Heart size={30} />
            </div>
            <h2 className="mt-6 text-3xl font-black">Wishlist is empty</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Tap heart on products to save favorites for later.</p>
            <Button as={Link} to="/products" className="mt-6">
              Continue shopping
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {items.map((product, index) => (
                <motion.article
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="glass-panel overflow-hidden rounded-[1.6rem]"
                >
                  <div className="group relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.08 }}
                      onClick={() => toggleWishlist(product)}
                      className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-rose-500 shadow-md"
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={18} fill="currentColor" />
                    </motion.button>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{product.category}</p>
                    <h3 className="mt-2 text-xl font-black">{product.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{product.brand}</p>
                    <p className="mt-4 text-2xl font-black">{formatCurrency(product.price)}</p>
                    <div className="mt-4 grid gap-2">
                      <Button className="w-full justify-center" onClick={() => moveToCart(product)}>
                        <ShoppingCart size={16} /> Move to cart
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-center border border-slate-300 bg-white/75 dark:border-slate-700 dark:bg-slate-900/50"
                        onClick={() => toggleWishlist(product)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </PageTransition>
  );
}
