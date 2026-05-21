import { BarChart3, Boxes, DollarSign, Loader2, ShoppingBag, Users } from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import StatCard from "../components/admin/StatCard";
import PageTransition from "../components/common/PageTransition";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  async function fetchDashboard() {
    setLoading(true);
    setError("");
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get("/products", { params: { limit: 200 } }),
        api.get("/orders"),
        api.get("/users"),
      ]);

      setProducts(productsRes.data?.data?.products || []);
      setOrders(ordersRes.data?.data || []);
      setUsers(usersRes.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const totalSales = useMemo(() => orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0), [orders]);
  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);
  const lowStock = useMemo(() => products.filter((product) => (product.countInStock ?? 0) <= 10).slice(0, 6), [products]);

  const salesByMonth = useMemo(() => {
    const map = new Map();
    for (const order of orders) {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + (order.totalPrice || 0));
    }
    const rows = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    const max = Math.max(...rows.map(([, value]) => value), 1);
    return rows.map(([label, value]) => ({ label, value, width: (value / max) * 100 }));
  }, [orders]);

  const categoryDistribution = useMemo(() => {
    const count = {};
    for (const product of products) {
      const key = product.category || "Other";
      count[key] = (count[key] || 0) + 1;
    }
    const rows = Object.entries(count).sort((a, b) => b[1] - a[1]);
    const total = rows.reduce((sum, [, value]) => sum + value, 0) || 1;
    return rows.map(([label, value]) => ({ label, value, percent: Math.round((value / total) * 100) }));
  }, [products]);

  return (
    <PageTransition>
      <AdminShell title="Admin dashboard" subtitle="Business overview, inventory health, and order insights.">
        {loading ? (
          <div className="glass-panel rounded-[1.8rem] p-10 text-center"><Loader2 className="mx-auto animate-spin" /><p className="mt-3">Loading dashboard...</p></div>
        ) : error ? (
          <div className="glass-panel rounded-[1.8rem] p-10 text-center"><h2 className="text-2xl font-black text-rose-600">Dashboard error</h2><p className="mt-3 text-slate-600 dark:text-slate-300">{error}</p></div>
        ) : (
          <div className="grid gap-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={DollarSign} label="Total sales" value={<CurrencyCounter value={totalSales} />} tone="green" />
              <StatCard icon={ShoppingBag} label="Total orders" value={<NumberCounter value={orders.length} />} />
              <StatCard icon={Boxes} label="Total products" value={<NumberCounter value={products.length} />} tone="orange" />
              <StatCard icon={Users} label="Total users" value={<NumberCounter value={users.length} />} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="glass-panel rounded-[1.8rem] p-6">
                <h2 className="mb-5 inline-flex items-center gap-2 text-xl font-black"><BarChart3 size={20} /> Sales chart</h2>
                <div className="grid gap-3">
                  {salesByMonth.length === 0 ? (
                    <p className="text-sm text-slate-500">No sales data yet.</p>
                  ) : (
                    salesByMonth.map((row) => (
                      <div key={row.label}>
                        <div className="mb-1 flex justify-between text-sm"><span>{row.label}</span><span className="font-bold">{formatCurrency(row.value)}</span></div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500" style={{ width: `${row.width}%` }} /></div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="glass-panel rounded-[1.8rem] p-6">
                <h2 className="mb-5 text-xl font-black">Category distribution</h2>
                <div className="grid gap-3">
                  {categoryDistribution.length === 0 ? (
                    <p className="text-sm text-slate-500">No category data yet.</p>
                  ) : (
                    categoryDistribution.map((row) => (
                      <div key={row.label} className="rounded-2xl bg-white/70 p-3 dark:bg-slate-900/60">
                        <div className="flex justify-between text-sm"><span className="font-semibold">{row.label}</span><span>{row.value} ({row.percent}%)</span></div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="glass-panel rounded-[1.8rem] p-6">
                <h2 className="mb-4 text-xl font-black">Recent orders</h2>
                <div className="grid gap-2">
                  {recentOrders.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between rounded-2xl bg-white/70 p-3 dark:bg-slate-900/60">
                      <div>
                        <p className="font-bold">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black">{formatCurrency(order.totalPrice)}</p>
                        <p className="text-xs text-slate-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-panel rounded-[1.8rem] p-6">
                <h2 className="mb-4 text-xl font-black">Low stock products</h2>
                <div className="grid gap-2">
                  {lowStock.length === 0 ? <p className="text-sm text-slate-500">All products healthy stock.</p> : lowStock.map((product) => (
                    <div key={product._id} className="flex items-center justify-between rounded-2xl bg-white/70 p-3 dark:bg-slate-900/60">
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{product.countInStock} left</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </AdminShell>
    </PageTransition>
  );
}

function NumberCounter({ value }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

function CurrencyCounter({ value }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => formatCurrency(Math.round(latest)));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}
