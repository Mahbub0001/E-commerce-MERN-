import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Filter,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminKpiCard from "../components/admin/AdminKpiCard";
import AdminShell from "../components/admin/AdminShell";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import api from "../services/api";

function getSentimentBadge(sentiment, score) {
  if (sentiment === "Positive") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Positive {score ? `${score}%` : ""}
      </span>
    );
  }
  if (sentiment === "Negative") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Negative {score ? `${score}%` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Neutral
    </span>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  async function fetchReviews() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/products/reviews/all");
      setReviews(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load customer reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleDeleteReview(review) {
    setDeletingId(review._id);
    try {
      await api.delete(`/api/products/${review.productId}/reviews/${review._id}`);
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
      setConfirmModal(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  }

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        (rev.productName || "").toLowerCase().includes(q) ||
        (rev.name || "").toLowerCase().includes(q) ||
        (rev.comment || "").toLowerCase().includes(q);

      let matchFilter = true;
      if (selectedFilter === "flagged") {
        matchFilter = Boolean(rev.isFlagged || rev.isSpam);
      } else if (selectedFilter !== "all") {
        matchFilter = String(rev.rating) === String(selectedFilter);
      }

      return matchQuery && matchFilter;
    });
  }, [reviews, searchQuery, selectedFilter]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    if (!total)
      return { total: 0, avg: "0.0", fiveStars: 0, flaggedCount: 0, positiveCount: 0 };

    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = (sum / total).toFixed(1);
    const fiveStars = reviews.filter((r) => Number(r.rating) === 5).length;
    const flaggedCount = reviews.filter((r) => r.isFlagged || r.isSpam).length;
    const positiveCount = reviews.filter((r) => r.sentiment === "Positive" || r.rating >= 4).length;

    return {
      total,
      avg,
      fiveStarsPercent: Math.round((fiveStars / total) * 100),
      positivePercent: Math.round((positiveCount / total) * 100),
      flaggedCount,
    };
  }, [reviews]);

  return (
    <PageTransition>
      <AdminShell
        title="Customer Reviews"
        subtitle="AI sentiment analysis, automated spam detection, and review moderation."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReviews}
            className="flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        }
      >
        {/* KPI Metrics Row */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard
            title="Total Reviews"
            value={stats.total}
            change={`${stats.total} Published`}
            isPositive={true}
            icon={MessageSquare}
            tone="brand"
            subtitle="Customer community feedback"
          />

          <AdminKpiCard
            title="Store Average Rating"
            value={`${stats.avg} ★`}
            change={`${stats.positivePercent}% Positive`}
            isPositive={Number(stats.avg) >= 4.0}
            icon={Star}
            tone="green"
            subtitle="Overall consumer sentiment"
          />

          <AdminKpiCard
            title="5-Star Ratings"
            value={`${stats.fiveStarsPercent || 0}%`}
            change="Top Tier Quality"
            isPositive={true}
            icon={Sparkles}
            tone="sky"
            subtitle="Highest satisfaction ratio"
          />

          <AdminKpiCard
            title="AI Flagged / Spam"
            value={stats.flaggedCount || 0}
            change={stats.flaggedCount > 0 ? "Action Required" : "Clean"}
            isPositive={stats.flaggedCount === 0}
            icon={ShieldAlert}
            tone="amber"
            subtitle="Automated Gemini moderation"
          />
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-panel mb-6 rounded-[2rem] p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, customer, or comment..."
              className="w-full rounded-2xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900/90 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={16} className="text-slate-400 shrink-0 ml-1" />
            <button
              onClick={() => setSelectedFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                selectedFilter === "all"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              All Reviews
            </button>

            <button
              onClick={() => setSelectedFilter("flagged")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedFilter === "flagged"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
              }`}
            >
              <AlertTriangle size={13} />
              <span>Flagged / Spam ({stats.flaggedCount})</span>
            </button>

            {["5", "4", "3", "2", "1"].map((rt) => (
              <button
                key={rt}
                onClick={() => setSelectedFilter(rt)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                  selectedFilter === rt
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {rt} ★
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Data Table */}
        <div className="glass-panel rounded-[2rem] p-6 sm:p-7">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-10 text-center">
              <Loader2 className="animate-spin text-brand-600" size={32} />
              <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                Loading customer reviews...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle size={32} className="mx-auto text-rose-500" />
              <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>
              <Button onClick={fetchReviews} className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <MessageSquare size={36} className="mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No reviews found</p>
              <p className="text-xs mt-1">
                {searchQuery || selectedFilter !== "all"
                  ? "Try resetting your search filters."
                  : "No customer reviews have been published yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 dark:border-slate-800">
                    <th className="pb-3.5 font-semibold">Product</th>
                    <th className="pb-3.5 font-semibold">Customer</th>
                    <th className="pb-3.5 font-semibold">Rating</th>
                    <th className="pb-3.5 font-semibold">AI Sentiment & Flags</th>
                    <th className="pb-3.5 font-semibold">Comment</th>
                    <th className="pb-3.5 font-semibold">Date</th>
                    <th className="pb-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredReviews.map((rev) => {
                    const formattedDate = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A";

                    const isSuspicious = rev.isFlagged || rev.isSpam;

                    return (
                      <tr
                        key={rev._id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition ${
                          isSuspicious ? "bg-rose-50/20 dark:bg-rose-950/10" : ""
                        }`}
                      >
                        {/* Product info */}
                        <td className="py-4">
                          <Link
                            to={`/products/${rev.productSlug || rev.productId}`}
                            target="_blank"
                            className="flex items-center gap-3 group max-w-[200px]"
                          >
                            {rev.productImage ? (
                              <img
                                src={rev.productImage}
                                alt={rev.productName}
                                className="h-10 w-10 shrink-0 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-400 dark:bg-slate-800">
                                PROD
                              </div>
                            )}
                            <span className="truncate font-bold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 transition">
                              {rev.productName || "Product"}
                            </span>
                          </Link>
                        </td>

                        {/* Customer info */}
                        <td className="py-4 font-bold text-slate-800 dark:text-slate-200">
                          {rev.name}
                        </td>

                        {/* Rating stars */}
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={13}
                                fill={star <= rev.rating ? "currentColor" : "none"}
                                className={
                                  star <= rev.rating
                                    ? "text-amber-400"
                                    : "text-slate-300 dark:text-slate-700"
                                }
                              />
                            ))}
                            <span className="ml-1 text-xs font-black text-slate-700 dark:text-slate-300">
                              {rev.rating}
                            </span>
                          </div>
                        </td>

                        {/* AI Sentiment & Flag Badge */}
                        <td className="py-4">
                          <div className="flex flex-col items-start gap-1">
                            {getSentimentBadge(rev.sentiment, rev.sentimentScore)}
                            {isSuspicious && (
                              <span
                                className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/40"
                                title={rev.flagReason || "Flagged as spam"}
                              >
                                <AlertTriangle size={11} />
                                {rev.flagReason || "Spam Detected"}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Review comment */}
                        <td className="py-4 text-slate-600 dark:text-slate-300 max-w-[280px]">
                          <p className="line-clamp-2">{rev.comment}</p>
                        </td>

                        {/* Date */}
                        <td className="py-4 text-slate-400 text-xs whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Delete Action */}
                        <td className="py-4 text-right">
                          <button
                            onClick={() => setConfirmModal(rev)}
                            disabled={deletingId === rev._id}
                            className="inline-flex items-center justify-center rounded-xl p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition"
                            title="Delete this review"
                          >
                            {deletingId === rev._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setConfirmModal(null)}
            />
            <div className="glass-panel relative w-full max-w-md rounded-[2rem] p-6 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-4">
                <Trash2 size={22} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Delete Customer Review?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to permanently remove this review by{" "}
                <span className="font-bold">{confirmModal.name}</span>? The product rating will
                be automatically recalculated.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setConfirmModal(null)}>
                  Cancel
                </Button>
                <button
                  onClick={() => handleDeleteReview(confirmModal)}
                  className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-black text-white hover:bg-rose-500 transition shadow-lg shadow-rose-500/20"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </PageTransition>
  );
}
