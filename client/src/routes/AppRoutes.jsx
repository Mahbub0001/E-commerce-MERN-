import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../pages/AdminDashboard";
import AdminOrders from "../pages/AdminOrders";
import AdminProducts from "../pages/AdminProducts";
import AdminUsers from "../pages/AdminUsers";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Orders from "../pages/Orders";
import ProductDetails from "../pages/ProductDetails";
import Products from "../pages/Products";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import Wishlist from "../pages/Wishlist";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/profile" replace />;
}

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
