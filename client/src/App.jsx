import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnimatePresence mode="wait" initial={false}>
                <AppRoutes key={location.pathname} />
              </AnimatePresence>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
