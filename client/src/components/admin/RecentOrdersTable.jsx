import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";

function getStatusBadge(status) {
  switch (status) {
    case "Delivered":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
    case "Shipped":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300";
    case "Cancelled":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
    case "Processing":
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
  }
}

export default function RecentOrdersTable({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        No recent orders found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 text-slate-400 dark:border-slate-800">
            <th className="pb-3 font-semibold">Order</th>
            <th className="pb-3 font-semibold">Customer</th>
            <th className="pb-3 font-semibold">Date</th>
            <th className="pb-3 font-semibold">Amount</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {orders.map((order) => {
            const shortId = (order._id || "").slice(-8).toUpperCase();
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "N/A";

            return (
              <tr
                key={order._id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition"
              >
                <td className="py-3.5 font-black text-slate-900 dark:text-white">
                  #{shortId}
                </td>
                <td className="py-3.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                    {order.user?.name || "Guest Customer"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {order.user?.email || "No email"}
                  </p>
                </td>
                <td className="py-3.5 text-slate-500 dark:text-slate-400">
                  {dateStr}
                </td>
                <td className="py-3.5 font-black text-slate-900 dark:text-white">
                  {formatCurrency(order.totalPrice || 0)}
                </td>
                <td className="py-3.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status || "Processing"}
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    <span>View</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
