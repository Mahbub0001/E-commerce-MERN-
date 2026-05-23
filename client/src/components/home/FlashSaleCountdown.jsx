import useFlashSaleCountdown from "../../hooks/useFlashSaleCountdown";

const units = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Mins" },
  { key: "seconds", label: "Secs" },
];

export default function FlashSaleCountdown() {
  const countdown = useFlashSaleCountdown();

  if (countdown.expired) {
    return (
      <div className="rounded-2xl bg-white/15 px-6 py-5 text-center backdrop-blur">
        <p className="text-xl font-black sm:text-2xl">Sale ended</p>
        <p className="mt-1 text-xs font-bold uppercase text-white/70">Check back soon</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {units.map(({ key, label }) => (
        <div key={key} className="rounded-2xl bg-white/15 p-4 text-center backdrop-blur">
          <p className="text-2xl font-black tabular-nums sm:text-3xl">{countdown[key]}</p>
          <p className="mt-1 text-xs font-bold uppercase text-white/70">{label}</p>
        </div>
      ))}
    </div>
  );
}
