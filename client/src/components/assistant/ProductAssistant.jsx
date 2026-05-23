import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronRight,
  MessageCircle,
  Minus,
  Search,
  Send,
  ShoppingCart,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { sampleProducts } from "../../data/sampleProducts";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { normalizeProduct } from "../../utils/normalizeProduct";

const starterPrompts = [
  "Lowest price product",
  "Best gaming item",
  "Best picks under 500",
  "Best rated product",
];

const needMap = [
  { keys: ["game", "gaming", "console", "play"], category: "Gaming" },
  { keys: ["fitness", "gym", "health", "watch", "workout"], category: "Fitness" },
  { keys: ["home", "room", "desk", "kitchen", "lamp", "coffee", "tea"], category: "Home" },
  { keys: ["fashion", "wear", "jacket", "style", "clothes"], category: "Fashion" },
  { keys: ["headphone", "audio", "music", "focus", "travel"], category: "Electronics" },
  { keys: ["laptop", "study", "student", "creator", "work"], category: "Electronics" },
  { keys: ["dock", "usb", "setup", "workspace", "accessory"], category: "Accessories" },
];

const fillerWords = new Set([
  "some",
  "product",
  "products",
  "suggest",
  "recommend",
  "need",
  "want",
  "best",
  "good",
  "under",
  "below",
  "budget",
  "price",
  "with",
  "for",
  "here",
  "now",
]);

function getUsableProducts(products) {
  const usable = products.filter((product) => Number(product.price) > 0 && Number(product.stock ?? product.countInStock ?? 1) > 0);
  return usable.length ? usable : products.filter((product) => Number(product.price) > 0);
}

function getRecommendationPool(products) {
  const retailProducts = products.filter((product) => product.category && product.category !== "General");
  return retailProducts.length >= 3 ? retailProducts : products;
}

function getQueryWords(query) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !fillerWords.has(word) && !/^\d+$/.test(word));
}

function productScore(product, query, maxPrice, matchedCategory) {
  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.description,
    ...(product.tags || []),
    ...(product.features || []),
  ]
    .join(" ")
    .toLowerCase();

  const words = getQueryWords(query);
  const textScore = words.reduce((sum, word) => sum + (haystack.includes(word) ? 8 : 0), 0);
  const categoryScore = matchedCategory && product.category === matchedCategory ? 22 : 0;
  const budgetScore = maxPrice && product.price <= maxPrice ? 18 + (1 - product.price / maxPrice) * 6 : 0;
  const ratingScore = (Number(product.rating) || 0) * 5;
  const reviewScore = Math.min(Number(product.reviews) || 0, 300) / 30;
  const discountScore = Math.max(0, (product.oldPrice || product.price) - product.price) / 15;
  const stockScore = Number(product.stock ?? product.countInStock ?? 0) > 0 ? 4 : -20;
  const catalogQualityScore = product.category === "General" ? -35 : 8;

  return textScore + categoryScore + budgetScore + ratingScore + reviewScore + discountScore + stockScore + catalogQualityScore;
}

function extractBudget(text) {
  const match =
    text.match(/(?:under|below|less than|within|max|budget|price|cost|\$)\D*(\d+)/i) ||
    text.match(/(\d+)\s*(?:taka|tk|dollars|usd)/i) ||
    text.match(/\b(\d{2,})\b/);
  return match ? Number(match[1]) : null;
}

function getMatchedCategory(text) {
  const lower = text.toLowerCase();
  return needMap.find((need) => need.keys.some((key) => lower.includes(key)))?.category || null;
}

function sortByValue(products) {
  return [...products].sort((a, b) => {
    const aDiscount = (a.oldPrice || a.price) - a.price;
    const bDiscount = (b.oldPrice || b.price) - b.price;
    return b.rating - a.rating || bDiscount - aDiscount || a.price - b.price;
  });
}

function summarizePicks(products, budget) {
  if (!products.length) return "";
  const names = products.map((product) => `${product.name} (${formatCurrency(product.price)})`).join(", ");
  return budget ? `Best options under ${formatCurrency(budget)}: ${names}.` : `Best matching options: ${names}.`;
}

function getRecommendationText(picks, budget, matchedCategory) {
  const lead = picks[0];
  if (!lead) return "No matching products found. Try a higher budget or another category.";

  const scope = matchedCategory ? `${matchedCategory.toLowerCase()} ` : "";
  const budgetText = budget ? ` within ${formatCurrency(budget)}` : "";
  const reason = lead.rating > 0 ? `${lead.rating} stars` : "best available value";
  return `I found ${scope}picks${budgetText}. Start with ${lead.name}: ${formatCurrency(lead.price)}, ${reason}. ${summarizePicks(picks, budget)}`;
}

function getAuthorityReply(text) {
  const lower = text.toLowerCase();
  const asksOwner =
    /(who|what).*(made|created|built|developed|owner|authority|founder)/i.test(lower) ||
    /(owner|creator|developer|founder|authority).*(bot|website|site|novabot|nova mart|novamart)/i.test(lower);
  const asksSiteName = /(what|which).*(name).*(website|site|shop|store)/i.test(lower) || /(website|site).*(name)/i.test(lower);

  if (asksOwner) {
    return {
      text: "Mahbub Ul Alam Bhuiyan created me and owns this website. He is an EdTech engineer from UFTB.",
      products: [],
    };
  }

  if (asksSiteName) {
    return {
      text: "The website name is Nova Mart.",
      products: [],
    };
  }

  return null;
}

function ProductMiniCard({ product, onAddToCart }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950">
      <div className="flex gap-3 p-3">
        <img src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-black text-slate-950 dark:text-white">{product.name}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{product.category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-base font-black text-brand-600 dark:text-brand-100">{formatCurrency(product.price)}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
              <Star size={13} fill="currentColor" /> {product.rating}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-slate-100 dark:border-white/10">
        <Link
          to={`/products/${product._id}`}
          className="inline-flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
        >
          View <ChevronRight size={14} />
        </Link>
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="inline-flex items-center justify-center gap-1 border-l border-slate-100 px-3 py-2.5 text-xs font-black text-brand-700 transition hover:bg-brand-50 dark:border-white/10 dark:text-brand-100 dark:hover:bg-white/5"
        >
          <ShoppingCart size={14} /> Add
        </button>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-3 py-2 dark:bg-white/10">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.12 }}
          className="h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-300"
        />
      ))}
    </div>
  );
}

export default function ProductAssistant() {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState(sampleProducts.map(normalizeProduct));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "Hi, I am NovaBot. Ask me for lowest price, best-rated picks, product suggestions, or budget matches.",
      products: sortByValue(sampleProducts.map(normalizeProduct)).slice(0, 2),
    },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const { data } = await api.get("/api/products", {
          params: { limit: 100, sort: "newest" },
        });
        const products = (data?.data?.products || []).map(normalizeProduct);
        if (active && products.length > 0) setCatalog(products);
      } catch {
        if (active) setCatalog(sampleProducts.map(normalizeProduct));
      }
    }

    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const catalogFacts = useMemo(() => {
    const usableCatalog = getUsableProducts(catalog);
    const cheapest = [...usableCatalog].sort((a, b) => a.price - b.price)[0];
    const highest = [...usableCatalog].sort((a, b) => b.price - a.price)[0];
    const bestRated = [...usableCatalog].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)[0];
    const categories = [...new Set(usableCatalog.map((product) => product.category).filter(Boolean))];
    return { cheapest, highest, bestRated, categories, usableCatalog };
  }, [catalog]);

  function buildReply(rawText) {
    const text = rawText.trim();
    const lower = text.toLowerCase();
    const authorityReply = getAuthorityReply(text);
    const budget = extractBudget(text);
    const matchedCategory = getMatchedCategory(text);
    const usableCatalog = catalogFacts.usableCatalog;
    const recommendationPool = getRecommendationPool(usableCatalog);
    const wantsFree = /\b(free|zero|0)\b/i.test(text);
    const wantsRecommendation = /(suggest|recommend|need|want|looking|best|good|pick|option|buy|for|under|below|budget)/i.test(text);
    const wantsCheapest = /(lowest|cheapest|low price|least expensive)/i.test(text);

    if (authorityReply) return authorityReply;

    if (!usableCatalog.length && !wantsFree) {
      return {
        text: "I can see catalog items, but none have valid price and stock yet. Add real prices in admin products, then I can recommend properly.",
        products: [],
      };
    }

    if (wantsFree) {
      const freeProducts = catalog.filter((product) => Number(product.price) === 0).slice(0, 3);
      return {
        text: freeProducts.length
          ? `Free products found: ${freeProducts.map((product) => product.name).join(", ")}. Check details before ordering because zero price may be admin test data.`
          : "No free products found.",
        products: freeProducts,
      };
    }

    if (wantsCheapest && !wantsRecommendation && catalogFacts.cheapest) {
      return {
        text: `${catalogFacts.cheapest.name} is lowest valid-price product here at ${formatCurrency(catalogFacts.cheapest.price)}. It is cheapest among products with real price and stock.`,
        products: [catalogFacts.cheapest],
      };
    }

    if (/(highest|expensive|premium|costliest)/i.test(text) && catalogFacts.highest) {
      return {
        text: `${catalogFacts.highest.name} is premium-priced pick at ${formatCurrency(catalogFacts.highest.price)}. Good when performance matters more than budget.`,
        products: [catalogFacts.highest],
      };
    }

    if (/(best rated|top rated|rating|reviews|popular)/i.test(text) && catalogFacts.bestRated) {
      const picks = sortByValue(recommendationPool).slice(0, 3);
      return {
        text: `${picks[0].name} is strongest rated retail pick with ${picks[0].rating} stars and ${picks[0].reviews} reviews.`,
        products: picks,
      };
    }

    if (/(category|categories|what.*sell|available)/i.test(text) && !wantsRecommendation) {
      return {
        text: `NovaMart carries ${catalogFacts.categories.join(", ")}. Tell me use case or budget and I will narrow it down.`,
        products: sortByValue(usableCatalog).slice(0, 3),
      };
    }

    let candidates = recommendationPool;
    if (matchedCategory) candidates = candidates.filter((product) => product.category === matchedCategory);
    if (budget) candidates = candidates.filter((product) => product.price <= budget);

    if (budget && candidates.length === 0) {
      const nearest = [...recommendationPool].sort((a, b) => a.price - b.price).slice(0, 3);
      return {
        text: `I found no valid products under ${formatCurrency(budget)}. Closest lower-price options start at ${formatCurrency(nearest[0]?.price)}.`,
        products: nearest,
      };
    }

    const ranked = candidates
      .map((product) => ({ product, score: productScore(product, text, budget, matchedCategory) }))
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product)
      .slice(0, 3);

    const picks = ranked.length ? ranked : sortByValue(recommendationPool).slice(0, 3);
    const lead = picks[0];

    if (budget || matchedCategory || wantsRecommendation || lower.includes("compare")) {
      return {
        text: getRecommendationText(picks, budget, matchedCategory),
        products: picks,
      };
    }

    return {
      text: lead
        ? `I would start with ${lead.name}. It matches your need, costs ${formatCurrency(lead.price)}, and has ${lead.rating} stars. I added a few alternatives too.`
        : "I could not find exact match. Try asking by product type, budget, or category.",
      products: picks,
    };
  }

  function sendMessage(text = input) {
    const cleanText = text.trim();
    if (!cleanText || loading) return;

    setInput("");
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: cleanText }]);
    setLoading(true);

    setTimeout(() => {
      const reply = buildReply(cleanText);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: reply.text,
          products: reply.products,
        },
      ]);
      setLoading(false);
    }, 420);
  }

  function deleteMessage(messageId) {
    setMessages((current) => current.filter((message) => message.id !== messageId));
  }

  return (
    <div className="fixed bottom-5 right-4 z-[110] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="mb-4 flex h-[min(680px,calc(100vh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-premium backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95 sm:w-[410px]"
          >
            <div className="bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-700 shadow-glow dark:bg-slate-950 dark:text-brand-100">
                    <Bot size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-black">NovaBot</p>
                    <p className="line-clamp-1 text-xs font-semibold text-white/70 dark:text-slate-600">
                      Product-aware shopping assistant
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white/10 p-2 transition hover:bg-white/20 dark:bg-slate-950/10 dark:hover:bg-slate-950/20"
                  aria-label="Close chat"
                >
                  <Minus size={18} />
                </button>
              </div>
            </div>

            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/45">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-mist/70 p-4 dark:bg-slate-950/70">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`group/message relative max-w-[88%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                    {message.id !== "welcome" && (
                      <button
                        type="button"
                        onClick={() => deleteMessage(message.id)}
                        className={`absolute top-1 z-10 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-500 opacity-0 shadow-lg backdrop-blur transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:opacity-100 group-hover/message:opacity-100 dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:bg-rose-500/15 ${
                          message.role === "user" ? "left-1" : "right-1"
                        }`}
                        aria-label="Delete chat message"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === "user"
                          ? "bg-brand-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.products?.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {message.products.map((product) => (
                          <ProductMiniCard key={`${message.id}-${product._id}`} product={product} onAddToCart={addToCart} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <TypingDots />
                </div>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="border-t border-slate-100 bg-white p-3 dark:border-white/10 dark:bg-slate-900"
            >
              <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-400 dark:border-white/10 dark:bg-slate-950">
                <Search size={17} className="shrink-0 text-slate-400" />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask: best laptop under 1200"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-100"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </label>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="group relative ml-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-premium transition hover:bg-brand-600 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-100"
        aria-label={open ? "Close NovaBot chat" : "Open NovaBot chat"}
      >
        <span className="absolute -left-36 top-1/2 hidden -translate-y-1/2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 sm:block">
          Ask NovaBot
        </span>
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}>
              <X size={25} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }}>
              <MessageCircle size={26} />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white ring-4 ring-mist dark:ring-slate-950">
            <Sparkles size={13} />
          </span>
        )}
      </motion.button>
    </div>
  );
}
