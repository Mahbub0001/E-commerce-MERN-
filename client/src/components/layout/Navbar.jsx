import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Heart, Menu, Moon, Search, ShoppingCart, Sun, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { useWishlist } from "../../context/WishlistContext";
import api from "../../services/api";
import { normalizeProduct } from "../../utils/normalizeProduct";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Deals", to: "/#deals" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "Cart", to: "/cart" },
  { label: "Login", to: "/login" },
];

const RECENT_SEARCH_KEY = "novamart_recent_searches";
const POPULAR_SEARCHES = ["headphones", "smartwatch", "sneakers", "gaming", "backpack"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem(RECENT_SEARCH_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { count } = useCart();
  const { items } = useWishlist();
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const trimmedQuery = searchText.trim();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (!searchOpen || trimmedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get("/api/products/search", { params: { keyword: trimmedQuery } });
        const rows = (data?.data || []).map(normalizeProduct).slice(0, 6);
        setSuggestions(rows);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [trimmedQuery, searchOpen]);

  function saveRecent(query) {
    const next = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 6);
    setRecentSearches(next);
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
  }

  function clearRecent() {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCH_KEY);
  }

  function submitSearch(queryValue) {
    const query = queryValue.trim();
    setSearchOpen(false);
    if (!query) {
      navigate("/products");
      return;
    }
    saveRecent(query);
    navigate(`/products?q=${encodeURIComponent(query)}`);
  }

  const showEmptyState = useMemo(
    () => trimmedQuery.length >= 2 && !searchLoading && suggestions.length === 0,
    [trimmedQuery, searchLoading, suggestions.length]
  );

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-bold transition ${
      isActive
        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
    }`;

  return (
    <header
      className={`sticky top-0 z-[100] border-b border-white/50 bg-white/90 backdrop-blur-2xl transition-shadow duration-300 dark:border-white/10 dark:bg-slate-950/90 ${
        scrolled ? "shadow-[0_18px_60px_rgba(15,23,42,0.14)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]" : ""
      }`}
    >
      <div className="container-pad flex h-20 items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-fuchsia-600 text-lg font-black text-white shadow-glow">
            N
          </span>
          <span className="text-lg font-black tracking-tight sm:text-xl">Nova Mart</span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button className="hidden rounded-full p-3 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 sm:inline-flex" onClick={() => setSearchOpen(true)} aria-label="Open search">
            <Search size={20} />
          </button>
          <button onClick={toggleTheme} className="rounded-full p-3.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link className="relative rounded-full p-3.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10" to="/wishlist">
            <Heart size={20} />
            {items.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-fuchsia-500 text-xs font-black text-white">{items.length}</span>}
          </Link>
          <Link className="relative rounded-full p-3.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10" to="/cart">
            <ShoppingCart size={20} />
            {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-xs font-black text-white">{count}</span>}
          </Link>
          <Link className="hidden rounded-full p-3 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 sm:inline-flex" to={user ? "/profile" : "/login"}>
            <User size={20} />
          </Link>
          {user && (
            <button onClick={logout} className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 lg:inline-flex">
              Logout
            </button>
          )}
          <button onClick={() => setOpen((value) => !value)} className="rounded-full p-3.5 lg:hidden">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="container-pad border-t border-slate-200 py-4 dark:border-white/10">
              <div className="grid gap-2">
                {[...navItems, ...(isAdmin ? [{ label: "Admin", to: "/admin" }] : []), { label: user ? "Profile" : "Login", to: user ? "/profile" : "/login" }].map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={linkClass}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-start bg-slate-950/55 p-4 pt-24 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -14, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -14, opacity: 0, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="glass-panel mx-auto w-full max-w-2xl rounded-[1.8rem] p-4 sm:p-5"
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch(searchText);
                }}
                className="flex items-center gap-2"
              >
                <Search size={18} className="text-slate-500" />
                <input
                  ref={searchInputRef}
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="h-12 w-full rounded-xl border bg-white px-3 outline-none dark:border-white/10 dark:bg-slate-950"
                />
                {searchText && (
                  <button type="button" onClick={() => setSearchText("")} className="rounded-xl border px-3 py-3 text-sm font-bold dark:border-white/10">
                    Clear
                  </button>
                )}
                <button type="submit" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                  Search
                </button>
              </form>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Recent</p>
                    {recentSearches.length > 0 && (
                      <button type="button" onClick={clearRecent} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
                        Clear all
                      </button>
                    )}
                  </div>
                  {recentSearches.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent searches.</p>
                  ) : (
                    <div className="grid gap-2">
                      {recentSearches.map((term) => (
                        <button key={term} type="button" onClick={() => submitSearch(term)} className="flex items-center gap-2 rounded-xl bg-white/75 px-3 py-2 text-left text-sm font-semibold hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900">
                          <Clock3 size={14} className="text-slate-500" />
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Popular</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button key={term} type="button" onClick={() => submitSearch(term)} className="rounded-full border bg-white/75 px-3 py-1.5 text-xs font-bold dark:border-white/10 dark:bg-slate-900/70">
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Suggestions</p>
                {searchLoading ? (
                  <div className="grid gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    ))}
                  </div>
                ) : showEmptyState ? (
                  <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-slate-500 dark:border-white/10">
                    No matching products found.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {suggestions.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => submitSearch(product.name)}
                        className="flex items-center gap-3 rounded-xl bg-white/75 p-2 text-left hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900"
                      >
                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
