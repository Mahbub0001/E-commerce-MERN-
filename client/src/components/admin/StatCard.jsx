export default function StatCard({ icon: Icon, label, value, tone = "brand" }) {
  const tones = {
    brand: "from-brand-600 to-violet-600",
    green: "from-emerald-500 to-teal-600",
    orange: "from-orange-500 to-amber-600",
  };

  return (
    <div className="glass-panel rounded-[1.5rem] p-5">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white`}>
        <Icon size={22} />
      </div>
      <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}
