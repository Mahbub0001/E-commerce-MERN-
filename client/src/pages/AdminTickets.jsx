import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  LifeBuoy,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminKpiCard from "../components/admin/AdminKpiCard";
import AdminShell from "../components/admin/AdminShell";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import Pagination from "../components/common/Pagination";
import api from "../services/api";

function getPriorityBadge(priority) {
  switch (priority) {
    case "Urgent":
    case "High":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          {priority}
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Medium
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Low
        </span>
      );
  }
}

function getStatusBadge(status) {
  switch (status) {
    case "Open":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-black text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
          <Clock size={12} /> Open
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          <RefreshCw size={12} className="animate-spin" /> In Progress
        </span>
      );
    case "Resolved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {status}
        </span>
      );
  }
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTicket, setActiveTicket] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);

  async function fetchTickets() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/tickets");
      setTickets(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  async function handleUpdateStatus(ticketId, newStatus) {
    setUpdatingId(ticketId);
    try {
      const { data } = await api.put(`/api/tickets/${ticketId}`, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
      );
      if (activeTicket && activeTicket._id === ticketId) {
        setActiveTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveNotes() {
    if (!activeTicket) return;
    setUpdatingId(activeTicket._id);
    try {
      const { data } = await api.put(`/api/tickets/${activeTicket._id}`, { notes: adminNotes });
      setTickets((prev) =>
        prev.map((t) => (t._id === activeTicket._id ? { ...t, notes: adminNotes } : t))
      );
      setActiveTicket((prev) => ({ ...prev, notes: adminNotes }));
      alert("Notes saved successfully.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save internal notes.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteTicket(ticket) {
    setDeletingId(ticket._id);
    try {
      await api.delete(`/api/tickets/${ticket._id}`);
      setTickets((prev) => prev.filter((t) => t._id !== ticket._id));
      setConfirmDeleteModal(null);
      if (activeTicket && activeTicket._id === ticket._id) {
        setActiveTicket(null);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete ticket.");
    } finally {
      setDeletingId(null);
    }
  }

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        (t.ticketId || "").toLowerCase().includes(q) ||
        (t.customerName || "").toLowerCase().includes(q) ||
        (t.customerEmail || "").toLowerCase().includes(q) ||
        (t.subject || "").toLowerCase().includes(q) ||
        (t.message || "").toLowerCase().includes(q);

      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;

      return matchQuery && matchStatus && matchPriority && matchCategory;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "Open").length;
    const inProgress = tickets.filter((t) => t.status === "In Progress").length;
    const resolved = tickets.filter((t) => t.status === "Resolved").length;
    const high = tickets.filter((t) => t.priority === "High" || t.priority === "Urgent").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return { total, open, inProgress, resolved, high, resolutionRate };
  }, [tickets]);

  return (
    <AdminShell
      title="Support Tickets"
      subtitle="Track customer complaints, auto-escalations from NovaBot, and issue resolutions."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTickets}
          className="flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
      }
    >
      <PageTransition className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminKpiCard
            title="Total Tickets"
            value={stats.total}
            trend={{ direction: "neutral", label: "All logged issues" }}
            icon={LifeBuoy}
            color="brand"
          />
          <AdminKpiCard
            title="Open Tickets"
            value={stats.open}
            trend={{ direction: stats.open > 0 ? "down" : "up", label: `${stats.open} awaiting action` }}
            icon={Clock}
            color="amber"
          />
          <AdminKpiCard
            title="High Priority"
            value={stats.high}
            trend={{ direction: stats.high > 0 ? "down" : "neutral", label: "Urgent or complaints" }}
            icon={ShieldAlert}
            color="rose"
          />
          <AdminKpiCard
            title="Resolution Rate"
            value={`${stats.resolutionRate}%`}
            trend={{ direction: "up", label: `${stats.resolved} resolved tickets` }}
            icon={CheckCircle2}
            color="emerald"
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search by ticket ID, customer, email, subject, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-brand-500 focus:bg-white dark:border-white/10 dark:bg-slate-950/50 dark:focus:border-brand-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              <option value="Refund">Refund</option>
              <option value="Damaged Item">Damaged Item</option>
              <option value="Delivery Delay">Delivery Delay</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Product Inquiry">Product Inquiry</option>
              <option value="General">General</option>
            </select>

            {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-600" size={32} />
            <p className="text-sm font-semibold text-slate-500">Loading support tickets...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-950 dark:bg-rose-950/20">
            <AlertCircle className="text-rose-600" size={32} />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchTickets}>
              Try Again
            </Button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <LifeBuoy size={24} />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white">No Tickets Found</p>
            <p className="max-w-md text-xs font-semibold text-slate-500">
              {tickets.length === 0
                ? "No support tickets have been created yet. When customers report issues to NovaBot, tickets will automatically appear here."
                : "No tickets match your active search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Ticket ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                  {paginatedTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-slate-950 dark:text-white">
                            {ticket.ticketId}
                          </span>
                          <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-300">
                            {ticket.source || "NovaBot AI"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ticket.customerName}
                          </span>
                          <span className="text-xs text-slate-500">{ticket.customerEmail}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">{getPriorityBadge(ticket.priority)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={ticket.status}
                          disabled={updatingId === ticket._id}
                          onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-700 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTicket(ticket);
                              setAdminNotes(ticket.notes || "");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-brand-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-white/5"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteModal(ticket)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:hover:bg-rose-950/30"
                            title="Delete Ticket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredTickets.length}
              onPageChange={setCurrentPage}
              className="mt-4 border-t border-slate-100 p-4 pt-3 dark:border-white/10"
            />
          </div>
        )}

        {/* Ticket Details & Notes Modal */}
        {activeTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                    <LifeBuoy size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950 dark:text-white">
                      Ticket #{activeTicket.ticketId}
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      Logged via {activeTicket.source || "NovaBot AI"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5 text-sm">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-950/50">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
                    <p className="font-bold text-slate-900 dark:text-white">{activeTicket.customerName}</p>
                    <p className="text-xs text-slate-500">{activeTicket.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status & Priority</p>
                    <div className="mt-1 flex items-center gap-2">
                      {getStatusBadge(activeTicket.status)}
                      {getPriorityBadge(activeTicket.priority)}
                    </div>
                  </div>
                </div>

                {/* Subject & Category */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Subject</p>
                  <p className="mt-1 font-black text-slate-900 dark:text-white">{activeTicket.subject}</p>
                  <p className="mt-0.5 text-xs text-brand-600 dark:text-brand-400">Category: {activeTicket.category}</p>
                </div>

                {/* Customer Message */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Statement / Inquiry</p>
                  <div className="mt-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-800 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-200">
                    {activeTicket.message}
                  </div>
                </div>

                {/* Admin Internal Notes */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Internal Staff Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal resolution notes, actions taken, refund transaction ID, etc..."
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-slate-950"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={updatingId === activeTicket._id}
                    >
                      {updatingId === activeTicket._id ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 dark:bg-rose-950/50">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">Delete Ticket</h3>
                  <p className="text-xs text-slate-500">Ticket #{confirmDeleteModal.ticketId}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                Are you sure you want to permanently delete this support ticket? This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeleteModal(null)}
                  disabled={deletingId}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={() => handleDeleteTicket(confirmDeleteModal)}
                  disabled={deletingId}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {deletingId ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageTransition>
    </AdminShell>
  );
}
