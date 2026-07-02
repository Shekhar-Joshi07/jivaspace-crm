export default function StatusCard({ title, count, icon: Icon, tone = 'brand', helper }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-violet-50 text-violet-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700'
  };

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-600">{title}</p>
          <p className="mt-2 font-display text-3xl font-black tracking-tight text-ink-950">{count}</p>
          {helper ? <p className="mt-1.5 text-xs text-ink-400">{helper}</p> : null}
        </div>
        {Icon ? (
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tones[tone] || tones.brand}`}>
            <Icon size={20} />
          </span>
        ) : null}
      </div>
    </article>
  );
}
