import { Menu, Users, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { label: "Dashboard", to: "/admin" },
  { label: "Products", to: "/admin/products" },
  { label: "Orders", to: "/admin/orders" },
  { label: "Users", to: "/admin/users", icon: Users },
];

export default function AdminShell({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="container-pad py-6 pb-16 lg:py-10 lg:pb-12">
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <h1 className="text-2xl font-black">Admin</h1>
        <button onClick={() => setOpen(true)} className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-5 shadow-2xl dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">NovaMart Admin</h2>
              <button onClick={() => setOpen(false)} className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800"><X size={18} /></button>
            </div>
            <SidebarLinks close={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass-panel hidden h-fit rounded-[1.8rem] p-5 lg:block lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-black">NovaMart Admin</h2>
          <SidebarLinks />
        </aside>

        <main className="min-w-0">
          <div className="glass-panel mb-6 rounded-[1.8rem] p-6">
            <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-slate-600 dark:text-slate-300">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </section>
  );
}

function SidebarLinks({ close }) {
  return (
    <nav className="grid gap-2">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/admin"}
          onClick={close}
          className={({ isActive }) =>
            `rounded-2xl px-4 py-3 text-sm font-bold transition ${
              isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
