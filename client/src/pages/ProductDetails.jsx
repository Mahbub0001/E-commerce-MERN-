import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import ProductCard from "../components/product/ProductCard";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import api from "../services/api";
import { normalizeProduct } from "../utils/normalizeProduct";
import { formatCurrency } from "../utils/formatCurrency";

const SAMPLE_REVIEWS = [
  { id: "r-1", name: "Jamal H.", rating: 5, date: "May 03, 2026", content: "Build quality feels premium. Fast shipping and exactly same as photos." },
  { id: "r-2", name: "Ariana M.", rating: 4, date: "April 24, 2026", content: "Great value for price. Packaging clean, performance strong after 3 weeks." },
  { id: "r-3", name: "Noah K.", rating: 5, date: "April 12, 2026", content: "Easy setup. Looks beautiful on desk. Customer support responded quickly." },
];

function buildGallery(product) {
  if (product?.images?.length) return product.images;
  return [
    `${product.image}`,
    `${product.image}&sat=-15`,
    `${product.image}&hue=12`,
    `${product.image}&contrast=5`,
  ];
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedPulse, setAddedPulse] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  async function fetchProduct() {
    setIsLoading(true);
    setError("");

    try {
      let data;
      try {
        const byId = await api.get(`/api/products/${id}`);
        data = byId.data?.data;
      } catch {
        const bySlug = await api.get(`/api/products/slug/${id}`);
        data = bySlug.data?.data;
      }

      const normalized = normalizeProduct(data);
      setProduct(normalized);
      setQuantity(1);
      setActiveImage(0);

      const relatedRes = await api.get("/api/products", {
        params: { category: normalized.category, limit: 4, sort: "newest" },
      });
      const relatedRows = (relatedRes.data?.data?.products || [])
        .map(normalizeProduct)
        .filter((item) => item._id !== normalized._id)
        .slice(0, 4);

      setRelated(relatedRows);
    } catch (err) {
      if (err?.response?.status === 404) {
        setProduct(null);
      } else {
        setError(err?.response?.data?.message || "Failed to load product.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const gallery = product ? buildGallery(product) : [];
  const discountPercent = product ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const stockText =
    product?.stock > 25 ? "In stock, ready to ship" : product?.stock > 0 ? `Only ${product.stock} left in stock` : "Out of stock";

  function onAddToCart() {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 1600);
  }

  function onBuyNow() {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    navigate("/checkout");
  }

  function updateQuantity(next) {
    if (!product) return;
    setQuantity(Math.max(1, Math.min(product.stock, next)));
  }

  if (isLoading) {
    return (
      <PageTransition>
        <section className="container-pad py-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel h-[520px] animate-pulse rounded-[2rem]" />
            <div className="glass-panel h-[520px] animate-pulse rounded-[2rem]" />
          </div>
        </section>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <section className="container-pad py-20 text-center">
          <div className="glass-panel mx-auto max-w-2xl rounded-[2rem] p-10">
            <h1 className="text-3xl font-black text-rose-600">Failed to load product</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={fetchProduct}>Retry</Button>
              <Button as={Link} variant="secondary" to="/products">Back to products</Button>
            </div>
          </div>
        </section>
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition>
        <section className="container-pad py-20">
          <div className="glass-panel mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose-500">404</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Product not found</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Requested product unavailable or removed. Explore latest catalog for similar picks.</p>
            <Button as={Link} to="/products" className="mt-7">Back to products</Button>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="container-pad py-8 pb-12 lg:py-12">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="glass-panel group relative overflow-hidden rounded-[2rem] p-3 sm:p-4">
              <img src={gallery[activeImage]} alt={product.name} className="aspect-square w-full rounded-[1.5rem] object-cover transition duration-500 ease-out group-hover:scale-110" />
              <button type="button" onClick={() => setActiveImage((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-700 shadow-lg transition hover:bg-white sm:left-7"><ChevronLeft size={18} /></button>
              <button type="button" onClick={() => setActiveImage((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-700 shadow-lg transition hover:bg-white sm:right-7"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`glass-panel overflow-hidden rounded-xl border-2 transition ${activeImage === index ? "border-brand-500" : "border-transparent"}`}>
                  <img src={image} alt={`${product.name} preview ${index + 1}`} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="glass-panel rounded-3xl p-6">
              <h2 className="text-xl font-black">Description</h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
            </div>
            <div className="glass-panel rounded-3xl p-6">
              <h2 className="text-xl font-black">Key features</h2>
              <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
                {(product.features?.length ? product.features : [
                  "Premium materials with durable everyday finish",
                  "Performance tested for comfort and reliability",
                  "Modern minimal aesthetic, easy to pair with any setup",
                  "Official warranty and support included",
                ]).map((feature) => (
                  <li key={feature} className="flex items-start gap-2"><CheckCircle2 size={18} className="mt-1 text-emerald-500" />{feature}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="pb-6 lg:sticky lg:top-24 lg:pb-0">
            <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
              <p className="font-bold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-200">{product.category}</p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">{product.name}</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">{product.brand}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-amber-500">
                <Star fill="currentColor" size={18} />
                <span className="font-black text-slate-900 dark:text-white">{product.rating}</span>
                <span className="text-sm text-slate-500">({product.reviews} reviews)</span>
              </div>
              <div className="mt-6 flex flex-wrap items-end gap-3">
                <span className="text-4xl font-black">{formatCurrency(product.price)}</span>
                <span className="text-lg text-slate-400 line-through">{formatCurrency(product.oldPrice)}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Save {discountPercent}%</span>
              </div>
              <p className={`mt-4 text-sm font-bold ${product.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}>{stockText}</p>

              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">Quantity</p>
                <div className="inline-flex items-center rounded-2xl border border-slate-300 bg-white/70 p-1 dark:border-slate-700 dark:bg-slate-900/60">
                  <button type="button" onClick={() => updateQuantity(quantity - 1)} className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Decrease quantity"><Minus size={16} /></button>
                  <span className="w-10 text-center font-black">{quantity}</span>
                  <button type="button" onClick={() => updateQuantity(quantity + 1)} className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Increase quantity"><PlusIcon /></button>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <motion.div animate={addedPulse ? { scale: [1, 1.02, 1] } : { scale: 1 }} transition={{ duration: 0.4 }}>
                  <Button className="w-full justify-center" onClick={onAddToCart} disabled={product.stock <= 0}>
                    <AnimatePresence mode="wait" initial={false}>
                      {addedPulse ? (
                        <motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="inline-flex items-center gap-2"><Sparkles size={16} /> Added to cart</motion.span>
                      ) : (
                        <motion.span key="default" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="inline-flex items-center gap-2"><ShoppingCart size={16} /> Add to cart</motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
                <Button variant="secondary" className="w-full justify-center" onClick={() => toggleWishlist(product)}>
                  <Heart size={16} fill={isWishlisted(product._id) ? "currentColor" : "none"} /> {isWishlisted(product._id) ? "Wishlisted" : "Add to wishlist"}
                </Button>
                <Button variant="ghost" className="w-full justify-center border border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50" onClick={onBuyNow} disabled={product.stock <= 0}>Buy now</Button>
              </div>

              <div className="mt-8 space-y-4 rounded-2xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-700/80 dark:bg-slate-900/40">
                <div className="flex gap-3"><Truck size={18} className="mt-1 text-brand-500" /><div><p className="font-bold">Delivery information</p><p className="text-sm text-slate-600 dark:text-slate-300">Free shipping over ৳250. Standard delivery 3-5 days.</p></div></div>
                <div className="flex gap-3"><ShieldCheck size={18} className="mt-1 text-brand-500" /><div><p className="font-bold">Return policy</p><p className="text-sm text-slate-600 dark:text-slate-300">30-day hassle-free returns with instant refund processing.</p></div></div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-pad pb-12">
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-black">Customer reviews</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {SAMPLE_REVIEWS.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700/80 dark:bg-slate-900/50">
                <div className="flex items-center justify-between"><p className="font-bold">{review.name}</p><span className="text-xs text-slate-500">{review.date}</span></div>
                <div className="mt-2 flex items-center gap-1 text-amber-500">{Array.from({ length: review.rating }).map((_, index) => (<Star key={`${review.id}-${index}`} size={14} fill="currentColor" />))}</div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.content}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-pad pb-20">
          <h2 className="mb-6 text-2xl font-black">Related products</h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{related.map((item) => (<ProductCard key={item._id} product={item} />))}</div>
        </section>
      )}
    </PageTransition>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
