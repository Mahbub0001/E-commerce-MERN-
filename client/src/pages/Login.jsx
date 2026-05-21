import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function validate() {
    if (!form.email.trim() || !form.password.trim()) return "Email and password required.";
    if (!EMAIL_RE.test(form.email)) return "Enter valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const user = await login({ email: form.email, password: form.password, rememberMe: form.rememberMe });
      navigate(user.role === "admin" ? "/admin" : "/profile");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <section className="relative overflow-hidden py-8 pb-14 sm:py-12">
        <AnimatedAuthBackground />
        <div className="container-pad relative z-10 grid min-h-[calc(100vh-10rem)] place-items-center">
          <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md rounded-[2rem] p-5 sm:p-10">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-premium">
              <LogIn />
            </div>
            <h1 className="mt-6 text-3xl font-black">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Login to manage cart, wishlist, and orders.</p>

            {error && (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-sm font-bold text-rose-700 dark:border-rose-700/60 dark:bg-rose-500/15 dark:text-rose-200">
                {error}
              </p>
            )}

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Email</span>
                <div className="flex items-center rounded-2xl border bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-slate-950/70">
                  <Mail size={16} className="text-slate-500" />
                  <input
                    className="ml-2 w-full bg-transparent outline-none"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold">Password</span>
                <div className="flex items-center rounded-2xl border bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-slate-950/70">
                  <Lock size={16} className="text-slate-500" />
                  <input
                    className="ml-2 w-full bg-transparent outline-none"
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-slate-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            </div>

            <div className="mt-4 flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center">
              <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm((prev) => ({ ...prev, rememberMe: e.target.checked }))}
                />
                Remember me
              </label>
              <span className="cursor-pointer font-semibold text-brand-600 dark:text-brand-300">Forgot password?</span>
            </div>

            <Button className="mt-6 min-h-12 w-full justify-center" type="submit" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Login"}
            </Button>
            <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
              No account? <Link to="/register" className="font-black text-brand-600 dark:text-brand-300">Create one</Link>
            </p>
          </form>
        </div>
      </section>
    </PageTransition>
  );
}

function AnimatedAuthBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 animate-pulse rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-72 w-72 animate-pulse rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:400ms]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />
    </>
  );
}
