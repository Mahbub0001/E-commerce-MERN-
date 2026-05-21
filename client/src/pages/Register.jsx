import { Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function validate() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      return "All fields required.";
    }
    if (!EMAIL_RE.test(form.email)) return "Enter valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
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
      await register({ name: form.name, email: form.email, password: form.password, role: "user" });
      navigate("/profile");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Registration failed.");
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
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-fuchsia-600 text-white shadow-premium">
              <UserPlus />
            </div>
            <h1 className="mt-6 text-3xl font-black">Create account</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Role defaults to user. Admin assigned backend only.</p>

            {error && (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-sm font-bold text-rose-700 dark:border-rose-700/60 dark:bg-rose-500/15 dark:text-rose-200">
                {error}
              </p>
            )}

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Name</span>
                <div className="flex items-center rounded-2xl border bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-slate-950/70">
                  <User size={16} className="text-slate-500" />
                  <input
                    className="ml-2 w-full bg-transparent outline-none"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </label>

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
                    placeholder="Create password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-slate-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold">Confirm password</span>
                <div className="flex items-center rounded-2xl border bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-slate-950/70">
                  <Lock size={16} className="text-slate-500" />
                  <input
                    className="ml-2 w-full bg-transparent outline-none"
                    placeholder="Repeat password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="text-slate-500">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            </div>

            <p className="mt-4 text-sm text-slate-500">Role: <span className="font-bold uppercase">{form.role}</span></p>

            <Button className="mt-6 min-h-12 w-full justify-center" type="submit" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Register"}
            </Button>
            <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
              Already registered? <Link to="/login" className="font-black text-brand-600 dark:text-brand-300">Login</Link>
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
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 animate-pulse rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-20 h-80 w-80 animate-pulse rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:500ms]" />
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-52 w-52 -translate-x-1/2 rounded-full bg-cyan-300/15 blur-3xl" />
    </>
  );
}
