import { Edit3, Loader2, LogOut, Mail, PackageCheck, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [summary, setSummary] = useState({ orders: 0, spent: 0, processing: 0 });
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    async function loadProfileData() {
      setBootLoading(true);
      setError("");
      try {
        const profile = await refreshProfile();
        setForm({ name: profile?.name || "", email: profile?.email || "" });

        const { data } = await api.get("/api/orders/my-orders");
        const orders = data?.data || [];
        const spent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const processing = orders.filter((order) => order.status === "Processing").length;
        setSummary({ orders: orders.length, spent, processing });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load profile.");
      } finally {
        setBootLoading(false);
      }
    }

    loadProfileData();
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email required.");
      return;
    }

    setSaved(false);
    setError("");
    setLoading(true);
    try {
      const { data } = await api.put("/auth/profile", { name: form.name, email: form.email });
      const updated = data?.data || data;
      await refreshProfile();
      setForm({ name: updated.name, email: updated.email });
      setIsEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  const summaryCards = [
    { id: "orders", label: "Orders", value: String(summary.orders), icon: PackageCheck },
    { id: "spent", label: "Total spent", value: `$${summary.spent.toFixed(2)}`, icon: Shield },
    { id: "processing", label: "Processing", value: String(summary.processing), icon: User },
  ];

  return (
    <PageTransition>
      <section className="relative overflow-hidden py-12">
        <AnimatedAuthBackground />
        <div className="container-pad relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-[2rem] p-7 sm:p-8">
            {bootLoading ? (
              <div className="grid place-items-center py-20"><Loader2 className="animate-spin" /></div>
            ) : (
              <>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-600 text-white shadow-premium"><User size={28} /></div>
                    <div>
                      <h1 className="text-3xl font-black">{user?.name || form.name}</h1>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{user?.email || form.email}</p>
                      <p className="mt-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-black uppercase text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">{user?.role || "user"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsEditing((prev) => !prev)}><Edit3 size={16} /> {isEditing ? "Cancel" : "Edit profile"}</Button>
                    <Button variant="ghost" className="border border-rose-300 text-rose-600 hover:bg-rose-50" onClick={logout}><LogOut size={16} /> Logout</Button>
                  </div>
                </div>

                {error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}

                <form onSubmit={handleSave} className="mt-8 grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Name</span>
                    <div className="flex items-center rounded-2xl border bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-slate-950/70">
                      <User size={16} className="text-slate-500" />
                      <input disabled={!isEditing} className="ml-2 w-full bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-70" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                    </div>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Email</span>
                    <div className="flex items-center rounded-2xl border bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-slate-950/70">
                      <Mail size={16} className="text-slate-500" />
                      <input disabled={!isEditing} className="ml-2 w-full bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-70" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                    </div>
                  </label>
                  {isEditing && <Button type="submit" className="mt-2 w-full justify-center" disabled={loading}>{loading ? <Loader2 size={18} className="animate-spin" /> : "Save changes"}</Button>}
                  {saved && <p className="text-sm font-bold text-emerald-600">Profile updated successfully.</p>}
                </form>
              </>
            )}
          </div>

          <aside className="glass-panel h-fit rounded-[2rem] p-6 lg:sticky lg:top-24">
            <h2 className="text-2xl font-black">Order summary</h2>
            <div className="mt-5 grid gap-3">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.id} className="rounded-2xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-slate-900/55">
                    <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{card.label}</p><Icon size={16} className="text-brand-500" /></div>
                    <p className="mt-2 text-2xl font-black">{card.value}</p>
                  </article>
                );
              })}
            </div>
            <Button as={Link} to="/orders" className="mt-5 w-full justify-center"><PackageCheck size={16} /> View orders</Button>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}

function AnimatedAuthBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -left-16 top-16 h-60 w-60 animate-pulse rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-12 h-72 w-72 animate-pulse rounded-full bg-fuchsia-500/15 blur-3xl [animation-delay:450ms]" />
    </>
  );
}
