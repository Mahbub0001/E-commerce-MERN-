export default function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-100">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{text}</p>}
    </div>
  );
}
