import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/orders/my-orders");
      setOrders(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <PageTransition>
      <section className="container-pad py-12">
        <h1 className="mb-8 text-4xl font-black">Order history</h1>

        {loading ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center"><Loader2 className="mx-auto animate-spin" /><p className="mt-3">Loading orders...</p></div>
        ) : error ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center">
            <h2 className="text-2xl font-black text-rose-600">Could not load orders</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{error}</p>
            <Button className="mt-5" onClick={fetchOrders}>Retry</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center"><h2 className="text-2xl font-black">No orders yet</h2><p className="mt-3 text-slate-600 dark:text-slate-300">Place first order from checkout.</p></div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] border bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            {orders.map((order) => (
              <div key={order._id} className="grid gap-4 border-b p-5 last:border-b-0 dark:border-white/10 md:grid-cols-4 md:items-center">
                <strong>{order._id.slice(-8).toUpperCase()}</strong>
                <span className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="font-black">{formatCurrency(order.totalPrice)}</span>
                <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">{order.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
