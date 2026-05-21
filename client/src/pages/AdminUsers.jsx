import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import PageTransition from "../components/common/PageTransition";
import api from "../services/api";

function roleClass(role) {
  return role === "admin" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-700";
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => users.filter((user) => {
    const q = query.toLowerCase();
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
  }), [users, query]);

  return (
    <PageTransition>
      <AdminShell title="User management" subtitle="Browse users, roles, and account details.">
        <div className="glass-panel rounded-[1.8rem] p-4 sm:p-5">
          <div className="mb-4 max-w-md relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="h-11 w-full rounded-2xl border bg-white pl-9 pr-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          {error && <p className="mb-3 rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}

          {loading ? (
            <div className="py-10 text-center"><Loader2 className="mx-auto animate-spin" /></div>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {filtered.map((user) => (
                  <article key={user._id} className="rounded-2xl border bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/60">
                    <p className="font-bold">{user.name}</p>
                    <p className="mt-1 text-sm">{user.email}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${roleClass(user.role)}`}>{user.role}</span>
                      <span className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead><tr className="text-left text-slate-500"><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Role</th><th className="pb-3">Joined</th></tr></thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user._id} className="border-t dark:border-white/10">
                      <td className="py-3 font-bold">{user.name}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${roleClass(user.role)}`}>{user.role}</span></td>
                      <td className="py-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </AdminShell>
    </PageTransition>
  );
}
