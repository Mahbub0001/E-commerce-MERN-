import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navSections = [
  {
    title: "Overview",
    links: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Catalog & Sales",
    links: [
      { label: "Products", to: "/admin/products", icon: Boxes },
      { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
      { label: "Reviews", to: "/admin/reviews", icon: Star },
      { label: "Support Tickets", to: "/admin/tickets", icon: LifeBuoy },
      { label: "Users", to: "/admin/users", icon: Users },
    ],
  },
];

export default function AdminShell({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("novamart_admin_collapsed") === "true";
  });
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("novamart_admin_collapsed", String(next));
      return next;
    });
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <section className="container-pad py-6 pb-20 lg:py-8 lg:pb-16 min-h-screen">
      {/* Mobile Topbar */}
      <div className="mb-6 flex items-center justify-between lg:hidden glass-panel rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-fuchsia-600 text-white font-black shadow-md">
            NM
          </div>
          <div>
            <h1 className="text-lg font-black leading-tight">NovaMart Admin</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-slate-700 dark:text-slate-200"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl bg-slate-950 p-2.5 text-white dark:bg-white dark:text-slate-950 shadow-md"
            aria-label="Open Navigation"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-950 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-fuchsia-600 text-white font-black">
                    NM
                  </div>
                  <div>
                    <h2 className="text-base font-black">NovaMart Admin</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={12} /> Administrator
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <SidebarContent close={() => setMobileOpen(false)} />
            </div>

            <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <UserProfileBadge user={user} onLogout={handleLogout} />
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Main Grid */}
      <div
        className={`grid gap-6 transition-all duration-300 lg:grid-cols-[${
          collapsed ? "84px" : "260px"
        }_1fr]`}
        style={{
          gridTemplateColumns: collapsed ? "84px 1fr" : "260px 1fr",
        }}
      >
        {/* Desktop Sticky Sidebar */}
        <aside
          className={`glass-panel hidden h-fit rounded-[2rem] p-4 lg:flex lg:flex-col lg:sticky lg:top-24 transition-all duration-300 ${
            collapsed ? "items-center px-3" : "p-5"
          }`}
        >
          {/* Logo & Collapse button */}
          <div
            className={`flex items-center mb-6 w-full ${
              collapsed ? "flex-col gap-3 justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-fuchsia-600 text-white font-black shadow-md shadow-brand-500/20">
                NM
              </div>
              {!collapsed && (
                <div>
                  <h2 className="text-base font-black tracking-tight">NovaMart</h2>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block -mt-0.5">
                    Admin Portal
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={toggleCollapsed}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Links */}
          <SidebarContent collapsed={collapsed} />

          {/* User & Theme Section */}
          <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 w-full flex flex-col gap-3">
            {!collapsed ? (
              <>
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-slate-400">Theme</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
                    <span>{isDark ? "Dark" : "Light"}</span>
                  </button>
                </div>
                <UserProfileBadge user={user} onLogout={handleLogout} />
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="rounded-xl p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Toggle theme"
                >
                  {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-xl p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="min-w-0">
          {/* Header Bar */}
          <div className="glass-panel mb-6 rounded-[2rem] p-6 sm:p-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                <span>Admin Suite</span>
                <span>/</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{title}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 font-normal">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {actions ? (
                actions
              ) : (
                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-brand-500/20 hover:brightness-110 active:scale-95 transition"
                >
                  <Plus size={16} />
                  <span>New Product</span>
                </Link>
              )}
            </div>
          </div>

          {children}
        </main>
      </div>
    </section>
  );
}

function SidebarContent({ close, collapsed = false }) {
  return (
    <nav className="grid gap-6 w-full">
      {navSections.map((section) => (
        <div key={section.title} className="grid gap-1.5">
          {!collapsed && (
            <p className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.title}
            </p>
          )}
          {section.links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/admin"}
                onClick={close}
                title={collapsed ? link.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    collapsed
                      ? "justify-center p-3"
                      : "px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-brand-600 to-fuchsia-600 text-white shadow-lg shadow-brand-500/25"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={19} className="shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </div>
      ))}

      {/* Storefront External Link */}
      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
        <Link
          to="/"
          onClick={close}
          title={collapsed ? "Go to Storefront" : undefined}
          className={`flex items-center gap-3 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition ${
            collapsed ? "justify-center p-3" : "px-3.5 py-2.5"
          }`}
        >
          <ExternalLink size={18} className="shrink-0" />
          {!collapsed && <span>View Storefront</span>}
        </Link>
      </div>
    </nav>
  );
}

function UserProfileBadge({ user, onLogout }) {
  const displayName = user?.name || "Admin Manager";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-100/80 p-2.5 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white text-xs font-black">
          {initials}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-xs font-bold">{displayName}</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {user?.email || "admin@novamart.com"}
          </p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="rounded-xl p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
        title="Sign Out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
