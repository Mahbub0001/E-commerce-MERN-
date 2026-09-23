import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Lock,
  Minus,
  MessageSquare,
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
import FrequentlyBoughtTogether from "../components/product/FrequentlyBoughtTogether";
import ProductCard from "../components/product/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import api from "../services/api";
import { normalizeProduct } from "../utils/normalizeProduct";
import { formatCurrency } from "../utils/formatCurrency";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

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
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedPulse, setAddedPulse] = useState(false);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

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

      // Intelligent Recommendations (Related products + Bundle pairing)
      try {
        const recRes = await api.get(`/api/products/${normalized._id}/recommendations`);
        const recData = recRes.data?.data;
        if (recData) {
          if (Array.isArray(recData.related)) {
            setRelated(recData.related.map(normalizeProduct));
          }
          if (recData.bundle) {
            setBundle(recData.bundle);
          }
        }
      } catch {
        // Fallback to simple category matching if recommendations endpoint is pending
        const relatedRes = await api.get("/api/products", {
          params: { category: normalized.category, limit: 4, sort: "newest" },
        });
        const relatedRows = (relatedRes.data?.data?.products || [])
          .map(normalizeProduct)
          .filter((item) => item._id !== normalized._id)
          .slice(0, 4);
        setRelated(relatedRows);
      }
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

  const reviews = useMemo(() => {
    return product?.reviewsList || [];
  }, [product]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      const val = Math.min(5, Math.max(1, Math.round(r.rating || 0)));
      if (counts[val] !== undefined) counts[val]++;
    }
    return counts;
  }, [reviews]);

  const hasReviewed = useMemo(() => {
    if (!user || !reviews.length) return false;
    return reviews.some((r) => (r.user?._id || r.user)?.toString() === user._id?.toString());
  }, [user, reviews]);

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

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError("Please enter your review feedback.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const res = await api.post(`/api/products/${product._id}/reviews`, {
        rating,
        comment: comment.trim(),
      });

      const updated = normalizeProduct(res.data?.data);
      setProduct(updated);
      setComment("");
      setReviewSuccess("Thank you! Your review has been published.");
    } catch (err) {
      setReviewError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
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
      {/* Product Hero & Info */}
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
                  <img
                    src={image}
                    alt={`${product.name} preview ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-full object-cover"
                  />
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
                <span className="font-black text-slate-900 dark:text-white">
                  {(product.rating || 0).toFixed(1)}
                </span>
                <span className="text-sm text-slate-500">({product.numReviews || 0} reviews)</span>
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
                <div className="flex gap-3"><Truck size={18} className="mt-1 text-brand-500" /><div><p className="font-bold">Delivery information</p><p className="text-sm text-slate-600 dark:text-slate-300">Free shipping over {formatCurrency(250)}. Standard delivery 3-5 days.</p></div></div>
                <div className="flex gap-3"><ShieldCheck size={18} className="mt-1 text-brand-500" /><div><p className="font-bold">Return policy</p><p className="text-sm text-slate-600 dark:text-slate-300">30-day hassle-free returns with instant refund processing.</p></div></div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Frequently Bought Together Bundle */}
      {bundle && (
        <div className="container-pad pb-12">
          <FrequentlyBoughtTogether bundle={bundle} />
        </div>
      )}

      {/* Customer Reviews & Rating Section */}
      <section className="container-pad pb-16">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-10">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Customer Reviews & Ratings</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Honest feedback from verified buyers and community members
              </p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[340px_1fr]">
            {/* Left: Overall Rating Breakdown */}
            <div className="rounded-[1.8rem] bg-slate-50/80 p-6 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 h-fit">
              <div className="text-center pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="text-5xl font-black text-slate-900 dark:text-white">
                  {(product.rating || 0).toFixed(1)}
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      fill={star <= Math.round(product.rating || 0) ? "currentColor" : "none"}
                      className={star <= Math.round(product.rating || 0) ? "text-amber-400" : "text-slate-300 dark:text-slate-700"}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>

              {/* Star Breakdown Bars */}
              <div className="mt-6 space-y-2.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars] || 0;
                  const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <span>{stars}</span>
                        <Star size={12} fill="currentColor" className="text-amber-400" />
                      </span>
                      <div className="h-2.5 flex-1 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium text-slate-400">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Submit Form & Reviews List */}
            <div className="space-y-8">
              {/* Review Form Area */}
              <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
                {!isAuthenticated ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          Have you used this product?
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Please sign in to write an authentic customer review.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-black text-white hover:bg-brand-500 transition shadow-md shadow-brand-500/20"
                    >
                      Login to Review
                    </Link>
                  </div>
                ) : hasReviewed ? (
                  <div className="flex items-center gap-3 p-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={24} className="shrink-0 text-emerald-500" />
                    <div>
                      <p className="font-black text-sm">You have already reviewed this product</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Thank you for contributing your rating to the NovaMart shopping community.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit}>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                      Write a Customer Review
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                      Share your experience, rating, and build quality observations.
                    </p>

                    {reviewError && (
                      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                        <AlertCircle size={16} />
                        <span>{reviewError}</span>
                      </div>
                    )}

                    {reviewSuccess && (
                      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                        <CheckCircle2 size={16} />
                        <span>{reviewSuccess}</span>
                      </div>
                    )}

                    {/* Interactive Star Picker */}
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 transition-transform hover:scale-125 focus:outline-none"
                            >
                              <Star
                                size={26}
                                fill={
                                  star <= (hoverRating || rating)
                                    ? "currentColor"
                                    : "none"
                                }
                                className={
                                  star <= (hoverRating || rating)
                                    ? "text-amber-400"
                                    : "text-slate-300 dark:text-slate-700"
                                }
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-500 px-2 py-0.5 rounded-lg bg-amber-500/10">
                          {RATING_LABELS[hoverRating || rating]}
                        </span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Review Comments
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {comment.length} / 1000
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={1000}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you like or dislike? How does it perform in daily use?"
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-950/90 dark:text-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview || !comment.trim()}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-brand-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-60"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Publishing Review...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare size={16} />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Customer Feedback ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                  <div className="rounded-[1.8rem] border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                    <p className="font-bold text-slate-800 dark:text-slate-200">No reviews yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Be the first customer to share your thoughts and rate this product!
                    </p>
                  </div>
                ) : (
                  reviews.map((rev, index) => {
                    const revInitial = (rev.name || "Customer")[0].toUpperCase();
                    const dateFormatted = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently";

                    return (
                      <article
                        key={rev._id || index}
                        className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/50 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-fuchsia-600 text-white font-black text-xs">
                              {revInitial}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">
                                {rev.name}
                              </p>
                              <span className="text-[11px] text-slate-400">
                                {dateFormatted}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                fill={star <= rev.rating ? "currentColor" : "none"}
                                className={
                                  star <= rev.rating
                                    ? "text-amber-400"
                                    : "text-slate-300 dark:text-slate-700"
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <p className="mt-3.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {rev.comment}
                        </p>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="container-pad pb-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                You May Also Like
              </p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">Related Products</h2>
            </div>
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-sm font-bold text-brand-600 transition hover:underline dark:text-brand-300"
            >
              Explore more {product.category} →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
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
