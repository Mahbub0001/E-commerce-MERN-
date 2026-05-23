import { motion } from "framer-motion";
import {
  ArrowRight,
  Dumbbell,
  Gamepad2,
  Gem,
  Headphones,
  Home as HomeIcon,
  Mail,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Timer,
  Truck,
  Watch,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import SectionHeader from "../components/common/SectionHeader";
import ProductCard from "../components/product/ProductCard";
import { sampleProducts } from "../data/sampleProducts";
import { formatCurrency } from "../utils/formatCurrency";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const categories = [
  { title: "Electronics", icon: Smartphone, gradient: "from-cyan-500 to-blue-600" },
  { title: "Fashion", icon: Shirt, gradient: "from-fuchsia-500 to-rose-500" },
  { title: "Fitness", icon: Dumbbell, gradient: "from-emerald-500 to-teal-600" },
  { title: "Gaming", icon: Gamepad2, gradient: "from-violet-500 to-indigo-600" },
  { title: "Home Gadgets", icon: HomeIcon, gradient: "from-orange-500 to-amber-500" },
  { title: "Accessories", icon: Watch, gradient: "from-slate-700 to-slate-950" },
];

const reasons = [
  { title: "Fast Delivery", text: "Priority dispatch and clear order tracking.", icon: Truck },
  { title: "Secure Checkout", text: "JWT-ready account flow and protected checkout.", icon: ShieldCheck },
  { title: "Premium Quality", text: "Curated products with clean detail pages.", icon: Gem },
  { title: "24/7 Support", text: "Polished support touchpoints for shoppers.", icon: Headphones },
];

const floatingCards = [
  { name: "NovaPods Max", price: 189, image: sampleProducts[0].image, className: "left-3 top-10 sm:left-8" },
  { name: "PulseFit Pro", price: 129, image: sampleProducts[1].image, className: "right-2 top-32 sm:right-8" },
  { name: "NovaStation X", price: 499, image: sampleProducts[4].image, className: "bottom-8 left-12 sm:left-24" },
];

function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const trending = sampleProducts.slice(0, 4);

  return (
    <PageTransition>
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <motion.div
          aria-hidden="true"
          animate={{ backgroundPosition: ["0% 0%", "100% 60%", "0% 0%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[length:180%_180%] bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.34),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(236,72,153,0.22),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(20,184,166,0.20),transparent_30%)]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-mist/75 to-mist dark:from-slate-950/30 dark:via-slate-950/80 dark:to-slate-950" />

        <div className="container-pad relative grid min-h-[calc(100vh-5rem)] items-center gap-12 py-14 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border bg-white/75 px-4 py-2 text-sm font-black text-brand-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-brand-100"
            >
              <Sparkles size={16} /> Premium drops, smoother checkout
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-6 text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl"
            >
              Upgrade Your Everyday Lifestyle
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300"
            >
              Shop premium electronics, fashion, fitness gear, gaming essentials, home gadgets, and accessories in one responsive NovaMart experience.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button as={Link} to="/products">
                Shop Now <ArrowRight size={18} />
              </Button>
              <Button as="a" href="#deals" variant="secondary">
                Explore Deals <Zap size={18} />
              </Button>
            </motion.div>
          </div>

          <div className="relative min-h-[520px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.18, duration: 0.7 }}
              className="glass-panel absolute inset-x-6 top-6 rounded-[2.5rem] p-4 sm:inset-x-14"
            >
              <img
                src="https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=1100&q=85"
                alt="NovaMart lifestyle products"
                className="aspect-[4/4.8] w-full rounded-[2rem] object-cover"
              />
            </motion.div>

            {floatingCards.map((card, index) => (
              <motion.div
                key={card.name}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: [0, -12, 0], scale: 1 }}
                transition={{
                  opacity: { delay: 0.32 + index * 0.12 },
                  scale: { delay: 0.32 + index * 0.12 },
                  y: { duration: 4 + index, repeat: Infinity, ease: "easeInOut" },
                }}
                className={`glass-panel absolute w-48 rounded-[1.5rem] p-3 ${card.className}`}
              >
                <div className="flex items-center gap-3">
                  <img src={card.image} alt={card.name} className="h-14 w-14 rounded-2xl object-cover" />
                  <div>
                    <p className="line-clamp-1 text-sm font-black">{card.name}</p>
                    <p className="text-sm font-bold text-brand-600 dark:text-brand-100">{formatCurrency(card.price)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <Reveal>
          <SectionHeader eyebrow="Categories" title="Featured Categories" text="Browse focused shopping lanes built for fast discovery." />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category.title} delay={index * 0.04}>
              <Link to="/products" className="group glass-panel flex items-center gap-5 rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:shadow-premium">
                <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${category.gradient} text-white shadow-glow`}>
                  <category.icon size={28} />
                </span>
                <div>
                  <h3 className="text-xl font-black">{category.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Explore latest arrivals</p>
                </div>
                <ArrowRight className="ml-auto opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" size={20} />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-pad py-16">
        <Reveal>
          <SectionHeader eyebrow="Trending" title="Trending Products" text="Discount badges, ratings, wishlist controls, and animated hover states." />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((product, index) => (
            <Reveal key={product._id} delay={index * 0.05}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-pad py-16">
        <Reveal>
          <SectionHeader eyebrow="Benefits" title="Why Choose NovaMart" text="Everything tuned for confidence, speed, and premium shopping feel." />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 0.04}>
              <div className="glass-panel h-full rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:shadow-premium">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <reason.icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-black">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{reason.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="deals" className="container-pad py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-slate-950 via-brand-700 to-fuchsia-600 p-8 text-white shadow-premium md:p-10">
            <motion.div
              aria-hidden="true"
              animate={{ x: ["-20%", "20%", "-20%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-y-0 left-0 w-2/3 bg-white/10 blur-3xl"
            />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black">
                  <Timer size={16} /> Flash Sale
                </p>
                <h2 className="mt-5 text-3xl font-black sm:text-5xl">Save up to 45% before midnight</h2>
                <p className="mt-4 max-w-2xl text-white/75">Limited-time deals on customer favorites. Countdown UI ready for backend sale timers later.</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["08", "Hours"],
                  ["24", "Mins"],
                  ["37", "Secs"],
                  ["99", "Left"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/15 p-4 text-center backdrop-blur">
                    <p className="text-2xl font-black sm:text-3xl">{value}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-white/70">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-pad py-16">
        <Reveal>
          <div className="glass-panel mx-auto max-w-4xl rounded-[2.25rem] p-8 text-center md:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-600 text-white">
              <Mail size={28} />
            </div>
            <h2 className="mt-6 text-3xl font-black">Join NovaMart newsletter</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Get product drops, flash sale alerts, and shopping inspiration in your inbox.</p>
            <form className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-h-14 flex-1 rounded-2xl border bg-white px-5 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-slate-950"
              />
              <Button type="submit" className="min-h-14">Subscribe</Button>
            </form>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  );
}
