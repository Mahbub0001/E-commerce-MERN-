import { Loader2, Search, Shield, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import PageTransition from "../components/common/PageTransition";
import api from "../services/api";

function roleClass(role) {
  return role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
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

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    regularUsers: users.filter((u) => u.role === "user").length,
  }), [users]);

  return (
    <PageTransition>
      <AdminShell title="User management" subtitle="Browse all users, roles, and account details.">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel rounded-[1.5rem] p-4 text-center">
            <p className="text-3xl font-black text-brand-600">{stats.total}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Total Users</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-4 text-center">
            <p className="text-3xl font-black text-purple-600">{stats.admins}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Admins</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-4 text-center">
            <p className="text-3xl font-black text-blue-600">{stats.regularUsers}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Regular Users</p>
          </div>
        </div>

        <div className="glass-panel rounded-[1.8rem] p-4 sm:p-5">
          <div className="mb-4 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="h-11 w-full rounded-2xl border bg-white pl-9 pr-3 outline-none dark:border-white/10 dark:bg-slate-950"
              placeholder="Search users by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {error && (
            <p className="mb-3 rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-200">
              ⚠️ {error}
            </p>
          )}

          {loading ? (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto mb-2 animate-spin" />
              <p className="text-sm text-slate-500">Loading users...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <User size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {users.length === 0 ? "No users found" : "No users match your search"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="grid gap-3 md:hidden">
                {filtered.map((user) => (
                  <article key={user._id} className="rounded-2xl border bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-bold">{user.name}</p>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black uppercase flex-shrink-0 ${roleClass(user.role)}`}>
                            {user.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                            {user.role}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500 dark:border-white/10">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => (
                      <tr key={user._id} className="border-t dark:border-white/10 hover:bg-white/40 dark:hover:bg-slate-800/40">
                        <td className="py-3 font-bold">{user.name}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase ${roleClass(user.role)}`}>
                            {user.role === "admin" ? <Shield size={14} /> : <User size={14} />}
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
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
