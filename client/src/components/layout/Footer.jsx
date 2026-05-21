import { Facebook, Github, Instagram, Mail, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const company = ["About", "Careers", "Press", "Affiliates"];
  const support = ["Help Center", "Shipping", "Returns", "Privacy"];

  return (
    <footer className="border-t border-slate-200 bg-white/80 py-12 pb-24 dark:border-white/10 dark:bg-slate-950 sm:pb-14">
      <div className="container-pad grid gap-10 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black text-slate-950 dark:text-white">NovaMart</p>
          <p className="mt-3 max-w-sm leading-6">Premium shopping UI for lifestyle products, daily essentials, and modern digital commerce.</p>
          <div className="mt-5 flex items-center gap-3">
            {[Instagram, Facebook, Twitter, Github, Mail].map((Icon, index) => (
              <span key={index} className="rounded-full border bg-white p-3 text-slate-700 transition hover:-translate-y-1 hover:text-brand-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                <Icon size={18} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="font-black text-slate-950 dark:text-white">Company</p>
          <div className="mt-4 grid gap-3">
            {company.map((item) => <Link key={item} to="/" className="hover:text-brand-600">{item}</Link>)}
          </div>
        </div>

        <div>
          <p className="font-black text-slate-950 dark:text-white">Support</p>
          <div className="mt-4 grid gap-3">
            {support.map((item) => <Link key={item} to="/" className="hover:text-brand-600">{item}</Link>)}
          </div>
        </div>

        <div>
          <p className="font-black text-slate-950 dark:text-white">Shop</p>
          <div className="mt-4 grid gap-3">
            <Link to="/products" className="hover:text-brand-600">Products</Link>
            <Link to="/wishlist" className="hover:text-brand-600">Wishlist</Link>
            <Link to="/cart" className="hover:text-brand-600">Cart</Link>
            <Link to="/login" className="hover:text-brand-600">Login</Link>
          </div>
        </div>
      </div>
      <div className="container-pad mt-10 border-t pt-6 text-center text-sm text-slate-500 dark:border-white/10 sm:text-left">
        Copyright {new Date().getFullYear()} NovaMart. All rights reserved.
      </div>
    </footer>
  );
}
