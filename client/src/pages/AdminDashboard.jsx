import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Boxes,
  CreditCard,
  DollarSign,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminKpiCard from "../components/admin/AdminKpiCard";
import AdminShell from "../components/admin/AdminShell";
import CategorySalesChart from "../components/admin/CategorySalesChart";
import InventoryAlerts from "../components/admin/InventoryAlerts";
import OrderStatusChart from "../components/admin/OrderStatusChart";
import RecentOrdersTable from "../components/admin/RecentOrdersTable";
import RevenueChart from "../components/admin/RevenueChart";
import PageTransition from "../components/common/PageTransition";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  async function fetchDashboard(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get("/api/products", { params: { limit: 300 } }),
        api.get("/api/orders"),
        api.get("/api/users"),
      ]);

      setProducts(productsRes.data?.data?.products || []);
      setOrders(ordersRes.data?.data || []);
      setUsers(usersRes.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Aggregate Metrics
  const totalSales = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  }, [orders]);

  const avgOrderValue = useMemo(() => {
    if (!orders.length) return 0;
    return Math.round(totalSales / orders.length);
  }, [orders, totalSales]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => (o.status || "Processing") === "Processing");
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => (p.countInStock ?? 0) <= 10).slice(0, 6);
  }, [products]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 6);
  }, [orders]);

  // Timeline Revenue Data for Recharts AreaChart
  const revenueTimeline = useMemo(() => {
    const monthMap = new Map();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize with recent 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthMap.set(key, { label: key, revenue: 0, orders: 0 });
    }

    // Populate from orders
    for (const order of orders) {
      if (!order.createdAt) continue;
      const d = new Date(order.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthMap.has(key)) {
        const item = monthMap.get(key);
        item.revenue += order.totalPrice || 0;
        item.orders += 1;
      } else {
        monthMap.set(key, {
          label: key,
          revenue: order.totalPrice || 0,
          orders: 1,
        });
      }
    }

    return Array.from(monthMap.values()).slice(-6);
  }, [orders]);

  // Order Status Breakdown Data for Donut Chart
  const orderStatusData = useMemo(() => {
    const counts = {
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    for (const o of orders) {
      const s = o.status || "Processing";
      if (counts[s] !== undefined) {
        counts[s]++;
      } else {
        counts.Processing++;
      }
    }

    return [
      { name: "Delivered", value: counts.Delivered, color: "#10b981" },
      { name: "Shipped", value: counts.Shipped, color: "#0284c7" },
      { name: "Processing", value: counts.Processing, color: "#f59e0b" },
      { name: "Cancelled", value: counts.Cancelled, color: "#ef4444" },
    ];
  }, [orders]);

  // Category Breakdown for BarChart
  const categoryData = useMemo(() => {
    const count = {};
    for (const p of products) {
      const cat = p.category || "General";
      count[cat] = (count[cat] || 0) + 1;
    }

    const total = products.length || 1;
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, qty]) => ({
        category,
        count: qty,
        percentage: Math.round((qty / total) * 100),
      }));
  }, [products]);

  // Header Actions
  const headerActions = (
    <div className="flex items-center gap-2.5">
      <button
        onClick={() => fetchDashboard(true)}
        disabled={refreshing || loading}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 transition active:scale-95 disabled:opacity-60 shadow-sm"
        title="Refresh data"
      >
        <RefreshCw size={15} className={refreshing ? "animate-spin text-brand-600" : ""} />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-brand-500/20 hover:brightness-110 active:scale-95 transition"
      >
        <Plus size={16} />
        <span>Add Product</span>
      </Link>
    </div>
  );

  return (
    <PageTransition>
      <AdminShell
        title="Admin Dashboard"
        subtitle="Real-time sales analytics, inventory tracking, and fulfillment overview."
        actions={headerActions}
      >
        {loading ? (
          <div className="glass-panel flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Loader2 className="animate-spin" size={28} />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
              Loading Control Center...
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Synchronizing orders, inventory, and analytics.
            </p>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-[2rem] p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle size={24} />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
              Unable to load dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{error}</p>
            <button
              onClick={() => fetchDashboard(false)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* KPI Cards Row */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <AdminKpiCard
                title="Total Revenue"
                value={formatCurrency(totalSales)}
                change="+14.2%"
                isPositive={true}
                icon={DollarSign}
                tone="green"
                subtitle="Fulfilled & active orders"
              />

              <AdminKpiCard
                title="Total Orders"
                value={orders.length}
                change={pendingOrders.length > 0 ? `${pendingOrders.length} pending` : "All cleared"}
                isPositive={pendingOrders.length === 0}
                icon={ShoppingBag}
                tone="brand"
                subtitle="Customer checkouts"
              />

              <AdminKpiCard
                title="Average Order Value"
                value={formatCurrency(avgOrderValue)}
                change="+5.8%"
                isPositive={true}
                icon={CreditCard}
                tone="sky"
                subtitle="Per transaction average"
              />

              <AdminKpiCard
                title="Catalog Inventory"
                value={products.length}
                change={lowStockProducts.length > 0 ? `${lowStockProducts.length} low stock` : "Optimal"}
                isPositive={lowStockProducts.length === 0}
                icon={Boxes}
                tone="amber"
                subtitle={`${users.length} registered users`}
              />
            </div>

            {/* Quick Insights Banner */}
            {pendingOrders.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[1.8rem] bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-transparent p-5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-black shadow-md">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Action Required: {pendingOrders.length} {pendingOrders.length === 1 ? "order needs" : "orders need"} processing
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Review customer shipping addresses and mark ready packages as Shipped.
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-sm"
                >
                  <span>Manage Orders</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid gap-6 xl:grid-cols-3">
              {/* Revenue Trend Area Chart */}
              <div className="glass-panel xl:col-span-2 rounded-[2rem] p-6 sm:p-7">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <BarChart3 size={20} className="text-brand-600" />
                      Revenue Trajectory
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sales velocity and volume across the last 6 months
                    </p>
                  </div>

                  <span className="self-start sm:self-auto rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                    Gross: {formatCurrency(totalSales)}
                  </span>
                </div>

                <RevenueChart data={revenueTimeline} />
              </div>

              {/* Order Status Breakdown Chart */}
              <div className="glass-panel rounded-[2rem] p-6 sm:p-7">
                <div className="mb-4">
                  <h3 className="text-lg font-black tracking-tight">Fulfillment Status</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ratio of delivered, shipped & pending orders
                  </p>
                </div>

                <OrderStatusChart data={orderStatusData} />
              </div>
            </div>

            {/* Secondary Visuals & Operational Grids */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Sales Distribution */}
              <div className="glass-panel rounded-[2rem] p-6 sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Category Distribution</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Product counts by retail catalog category
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {products.length} Items Total
                  </span>
                </div>

                <CategorySalesChart data={categoryData} />
              </div>

              {/* Low Stock Alerts */}
              <div className="glass-panel rounded-[2rem] p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black tracking-tight">Low Stock Alerts</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Products with 10 or fewer units in inventory
                      </p>
                    </div>
                    <Link
                      to="/admin/products"
                      className="text-xs font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition"
                    >
                      View Catalog
                    </Link>
                  </div>

                  <InventoryAlerts products={lowStockProducts} />
                </div>
              </div>
            </div>

            {/* Recent Orders Operational Table */}
            <div className="glass-panel rounded-[2rem] p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Recent Orders</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Latest customer transactions across NovaMart
                  </p>
                </div>
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition"
                >
                  <span>See all orders</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <RecentOrdersTable orders={recentOrders} />
            </div>
          </div>
        )}
      </AdminShell>
    </PageTransition>
  );
}
