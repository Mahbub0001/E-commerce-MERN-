import { Boxes, LayoutDashboard, PackageCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Boxes },
  { label: "Orders", to: "/admin/orders", icon: PackageCheck },
  { label: "Users", to: "/admin/users", icon: Users },
];

export default function AdminQuickLinks() {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/admin"}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
              isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200"
            }`
          }
        >
          <link.icon size={16} />
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}
