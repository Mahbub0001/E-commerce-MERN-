import { createContext, useContext, useMemo, useState } from "react";
import { useToast } from "./ToastContext";
import { safeParseJSON } from "../utils/storage";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { showToast } = useToast();
  const [items, setItems] = useState(() => {
    return safeParseJSON(localStorage.getItem("novamart_wishlist"), []);
  });

  function persist(nextItems) {
    localStorage.setItem("novamart_wishlist", JSON.stringify(nextItems));
    setItems(nextItems);
  }

  function toggleWishlist(product) {
    const exists = items.some((item) => item._id === product._id);
    persist(exists ? items.filter((item) => item._id !== product._id) : [...items, product]);
    showToast(exists ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`, "info");
  }

  function isWishlisted(productId) {
    return items.some((item) => item._id === productId);
  }

  const value = useMemo(() => ({ items, toggleWishlist, isWishlisted }), [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
