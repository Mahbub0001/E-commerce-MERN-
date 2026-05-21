import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const statusList = ["Processing", "Shipped", "Delivered", "Cancelled"];

function statusClass(status) {
  if (status === "Delivered") return "bg-emerald-100 text-emerald-700";
  if (status === "Shipped") return "bg-sky-100 text-sky-700";
  if (status === "Cancelled") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders");
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

  async function changeStatus(orderId, status) {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((order) => order._id === orderId ? { ...order, status } : order));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status.");
    }
  }

  const filtered = useMemo(() => orders.filter((order) => {
    const q = query.toLowerCase();
    return (
      order._id.toLowerCase().includes(q) ||
      order.user?.name?.toLowerCase().includes(q) ||
      order.user?.email?.toLowerCase().includes(q)
    );
  }), [orders, query]);

  return (
    <PageTransition>
      <AdminShell title="Order management" subtitle="Track, inspect, and update fulfillment status.">
        <div className="glass-panel rounded-[1.8rem] p-4 sm:p-5">
          <div className="mb-4 max-w-md relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="h-11 w-full rounded-2xl border bg-white pl-9 pr-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Search by order or customer" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          {error && <p className="mb-3 rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}

          {loading ? (
            <div className="py-10 text-center"><Loader2 className="mx-auto animate-spin" /></div>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {filtered.map((order) => (
                  <article key={order._id} className="rounded-2xl border bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(order.status)}`}>{order.status}</span>
                    </div>
                    <p className="mt-2 text-sm">{order.user?.name || "N/A"}</p>
                    <p className="text-xs text-slate-500">{order.user?.email || "-"}</p>
                    <p className="mt-2 font-black">{formatCurrency(order.totalPrice)}</p>
                    <div className="mt-3 grid gap-2">
                      <select className="h-10 rounded-xl border bg-white px-3 dark:border-white/10 dark:bg-slate-950" value={order.status} onChange={(e) => changeStatus(order._id, e.target.value)}>{statusList.map((s) => <option key={s}>{s}</option>)}</select>
                      <Button variant="secondary" className="w-full justify-center" onClick={() => setSelected(order)}>Details</Button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[920px] text-sm">
                <thead><tr className="text-left text-slate-500"><th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Total</th><th className="pb-3">Status</th><th className="pb-3">Update</th><th className="pb-3">Actions</th></tr></thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order._id} className="border-t dark:border-white/10">
                      <td className="py-3"><p className="font-bold">#{order._id.slice(-8).toUpperCase()}</p><p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p></td>
                      <td className="py-3"><p>{order.user?.name || "N/A"}</p><p className="text-xs text-slate-500">{order.user?.email || "-"}</p></td>
                      <td className="py-3 font-black">{formatCurrency(order.totalPrice)}</td>
                      <td className="py-3"><span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(order.status)}`}>{order.status}</span></td>
                      <td className="py-3"><select className="rounded-xl border bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-950" value={order.status} onChange={(e) => changeStatus(order._id, e.target.value)}>{statusList.map((s) => <option key={s}>{s}</option>)}</select></td>
                      <td className="py-3"><Button variant="secondary" className="px-3 py-2" onClick={() => setSelected(order)}>Details</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4">
            <div className="glass-panel w-full max-w-2xl rounded-[1.8rem] p-4 sm:p-6">
              <h2 className="text-2xl font-black">Order details</h2>
              <p className="mt-1 text-sm text-slate-500">#{selected._id}</p>
              <div className="mt-4 grid gap-3">
                <p><strong>Customer:</strong> {selected.user?.name} ({selected.user?.email})</p>
                <p><strong>Payment:</strong> {selected.paymentMethod}</p>
                <p><strong>Shipping:</strong> {selected.shippingAddress?.address}, {selected.shippingAddress?.city}, {selected.shippingAddress?.country}</p>
                <p><strong>Total:</strong> {formatCurrency(selected.totalPrice)}</p>
              </div>
              <div className="mt-4 rounded-2xl bg-white/70 p-4 dark:bg-slate-900/60">
                <p className="mb-2 font-bold">Items</p>
                <div className="grid gap-2">{selected.orderItems.map((item) => <div key={item.product} className="flex justify-between text-sm"><span>{item.name} x {item.quantity}</span><span>{formatCurrency(item.price * item.quantity)}</span></div>)}</div>
              </div>
              <div className="mt-5"><Button onClick={() => setSelected(null)}>Close</Button></div>
            </div>
          </div>
        )}
      </AdminShell>
    </PageTransition>
  );
}
