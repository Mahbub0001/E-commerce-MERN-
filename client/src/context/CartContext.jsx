import { createContext, useContext, useMemo, useState } from "react";
import { useToast } from "./ToastContext";
import { safeParseJSON } from "../utils/storage";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { showToast } = useToast();
  const [items, setItems] = useState(() => {
    return safeParseJSON(localStorage.getItem("novamart_cart"), []);
  });

  function persist(nextItems) {
    localStorage.setItem("novamart_cart", JSON.stringify(nextItems));
    setItems(nextItems);
  }

  function addToCart(product, quantity = 1) {
    const safeQty = Math.max(1, Number(quantity) || 1);
    const maxStock = product.stock ?? product.countInStock ?? 999;
    const exists = items.find((item) => item._id === product._id);
    const nextItems = exists
      ? items.map((item) =>
          item._id === product._id ? { ...item, quantity: Math.min(item.quantity + safeQty, maxStock) } : item
        )
      : [...items, { ...product, quantity: Math.min(safeQty, maxStock) }];

    persist(nextItems);
    showToast(`${product.name} added to cart`, "success");
  }

  function updateQuantity(productId, quantity) {
    const safeQty = Math.max(0, Number(quantity) || 0);
    const nextItems = items
      .map((item) => {
        if (item._id !== productId) return item;
        const maxStock = item.stock ?? item.countInStock ?? 999;
        return { ...item, quantity: Math.min(safeQty, maxStock) };
      })
      .filter((item) => item.quantity > 0);
    persist(nextItems);
  }

  function removeFromCart(productId) {
    const target = items.find((item) => item._id === productId);
    persist(items.filter((item) => item._id !== productId));
    if (target) showToast(`${target.name} removed`, "info");
  }

  function clearCart() {
    persist([]);
    showToast("Cart cleared", "info");
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 && subtotal < 250 ? 12 : 0;
  const total = subtotal + shipping;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({ items, count, subtotal, shipping, total, addToCart, updateQuantity, removeFromCart, clearCart }),
    [items, count, subtotal, shipping, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
