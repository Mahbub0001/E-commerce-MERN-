import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import PageTransition from "../components/common/PageTransition";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const paymentOptions = ["Cash on Delivery", "Demo Card", "Mobile Banking Demo"];
const SHIPPING_KEY = "novamart_shipping_info";

const steps = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Review" },
];

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shippingInfo, setShippingInfo] = useState(() => {
    const saved = localStorage.getItem(SHIPPING_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          fullName: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          postalCode: "",
          country: "",
        };
  });
  const [paymentMethod, setPaymentMethod] = useState(paymentOptions[0]);

  const { items, clearCart } = useCart();

  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 250 ? 0 : 12;
  const taxPrice = itemsPrice * 0.05;
  const total = itemsPrice + shippingPrice + taxPrice;
  const shippingAddress = useMemo(
    () => ({
      address: shippingInfo.address,
      city: shippingInfo.city,
      postalCode: shippingInfo.postalCode,
      country: shippingInfo.country,
    }),
    [shippingInfo]
  );

  function validateShipping() {
    if (!shippingInfo.fullName.trim()) return "Full name required.";
    if (!/^[0-9+\-\s()]{7,20}$/.test(shippingInfo.phone.trim())) return "Enter valid phone number.";
    if (!/^\S+@\S+\.\S+$/.test(shippingInfo.email.trim())) return "Enter valid email.";
    if (!shippingInfo.address.trim()) return "Address required.";
    if (!shippingInfo.city.trim()) return "City required.";
    if (!shippingInfo.postalCode.trim()) return "Postal code required.";
    if (!shippingInfo.country.trim()) return "Country required.";
    return "";
  }

  function handleNextStep() {
    if (step === 1) {
      const validationError = validateShipping();
      if (validationError) {
        setError(validationError);
        return;
      }
      localStorage.setItem(SHIPPING_KEY, JSON.stringify(shippingInfo));
    }
    setError("");
    setStep((current) => Math.min(current + 1, 3));
  }

  function handlePreviousStep() {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function placeOrder() {
    if (items.length === 0) {
      setError("Cart is empty.");
      return;
    }

    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      setError("Please complete shipping address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderItems = items.map((item) => ({ product: item._id, quantity: item.quantity }));
      const { data } = await api.post("/orders", {
        orderItems,
        shippingAddress,
        paymentMethod,
      });

      setPlacedOrder(data?.data || data);
      clearCart();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  }

  if (placedOrder) {
    return (
      <PageTransition>
        <section className="container-pad grid min-h-[calc(100vh-10rem)] place-items-center py-12 text-center">
          <div className="glass-panel max-w-xl rounded-[2rem] p-10">
            <CheckCircle2 className="mx-auto text-emerald-500" size={64} />
            <h1 className="mt-6 text-3xl font-black">Order placed</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Order ID: {placedOrder._id}</p>
            <Button as={Link} to="/orders" className="mt-6">View orders</Button>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="container-pad py-8 pb-14 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="glass-panel rounded-[2rem] p-5 sm:p-8">
            <h1 className="text-3xl font-black">Checkout</h1>
            <p className="mt-2 text-slate-500">Complete steps to place your order.</p>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {steps.map((item) => (
                <div key={item.id} className="text-center">
                  <div
                    className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-xs font-black ${
                      step >= item.id ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                    }`}
                  >
                    {item.id}
                  </div>
                  <p className={`mt-2 text-xs font-bold ${step >= item.id ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>{item.label}</p>
                </div>
              ))}
            </div>

            {error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                {step === 1 && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <input className="rounded-2xl border bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Full name" value={shippingInfo.fullName} onChange={(e) => setShippingInfo((prev) => ({ ...prev, fullName: e.target.value }))} />
                    <input className="rounded-2xl border bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Phone number" value={shippingInfo.phone} onChange={(e) => setShippingInfo((prev) => ({ ...prev, phone: e.target.value }))} />
                    <input className="rounded-2xl border bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950 sm:col-span-2" placeholder="Email" value={shippingInfo.email} onChange={(e) => setShippingInfo((prev) => ({ ...prev, email: e.target.value }))} />
                    <input className="rounded-2xl border bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950 sm:col-span-2" placeholder="Address" value={shippingInfo.address} onChange={(e) => setShippingInfo((prev) => ({ ...prev, address: e.target.value }))} />
                    <input className="rounded-2xl border bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="City" value={shippingInfo.city} onChange={(e) => setShippingInfo((prev) => ({ ...prev, city: e.target.value }))} />
                    <input className="rounded-2xl border bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Postal code" value={shippingInfo.postalCode} onChange={(e) => setShippingInfo((prev) => ({ ...prev, postalCode: e.target.value }))} />
                    <input className="rounded-2xl border bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950 sm:col-span-2" placeholder="Country" value={shippingInfo.country} onChange={(e) => setShippingInfo((prev) => ({ ...prev, country: e.target.value }))} />
                  </div>
                )}

                {step === 2 && (
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold">Payment method</p>
                    <div className="grid gap-2">
                      {paymentOptions.map((method) => (
                        <label key={method} className={`flex items-center gap-3 rounded-2xl border p-4 ${paymentMethod === method ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10" : "bg-white/70 dark:bg-slate-950/70 dark:border-white/10"}`}>
                          <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                          <span className="font-semibold">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="mt-6 space-y-5">
                    <div className="rounded-2xl bg-white/75 p-4 dark:bg-slate-950/70">
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Shipping</p>
                      <p className="mt-2 font-semibold">{shippingInfo.fullName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{shippingInfo.phone} • {shippingInfo.email}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}</p>
                    </div>
                    <div className="rounded-2xl bg-white/75 p-4 dark:bg-slate-950/70">
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Payment</p>
                      <p className="mt-2 font-semibold">{paymentMethod}</p>
                    </div>
                    <div className="grid gap-3">
                      {items.map((item) => (
                        <div key={item._id} className="grid gap-1 rounded-2xl bg-white p-4 dark:bg-slate-950 sm:flex sm:items-center sm:justify-between">
                          <span className="pr-2">{item.name} x {item.quantity}</span>
                          <strong>{formatCurrency(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={handlePreviousStep}>
                  <ChevronLeft size={16} /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={handleNextStep} className="min-h-12 w-full justify-center sm:w-auto">
                  Continue
                </Button>
              ) : (
                <Button onClick={placeOrder} className="min-h-12 w-full justify-center sm:w-auto" disabled={loading || items.length === 0}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Place order"}
                </Button>
              )}
            </div>
          </div>

          <aside className="glass-panel h-fit rounded-[2rem] p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-2xl font-black">Order review</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between"><span>Items</span><strong>{formatCurrency(itemsPrice)}</strong></div>
              <div className="flex justify-between"><span>Shipping</span><strong>{formatCurrency(shippingPrice)}</strong></div>
              <div className="flex justify-between"><span>Tax</span><strong>{formatCurrency(taxPrice)}</strong></div>
              <div className="flex justify-between border-t pt-3 text-lg font-black"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Complete all steps before placing order.</p>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
