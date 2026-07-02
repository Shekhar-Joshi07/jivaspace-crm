import { ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react';
import { STATUS_STYLES } from '../utils/constants';

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p> : null}
        <h1 className="font-display text-2xl font-black tracking-tight text-ink-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ title = 'Nothing here yet', description, icon: Icon = Inbox, action }) {
  return (
    <div className="card grid min-h-56 place-items-center border-dashed p-8 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon size={22} /></span>
        <h3 className="mt-4 font-display text-base font-extrabold text-ink-950">{title}</h3>
        {description ? <p className="mx-auto mt-1 max-w-md text-sm text-ink-600">{description}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}

export function StatusBadge({ value, children }) {
  const text = value ?? children ?? 'Unknown';
  const style = STATUS_STYLES[text] || 'bg-gray-100 text-gray-700 ring-gray-200';
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style}`}>{text}</span>;
}

export function FormField({ label, required, error, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}{required ? <span className="ml-1 text-red-500">*</span> : null}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-xs text-ink-400">{hint}</span> : null}
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <label className={`relative block ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
      <input className="field pl-10" onChange={event => onChange(event.target.value)} placeholder={placeholder} type="search" value={value} />
    </label>
  );
}

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink-600 sm:flex-row">
      <span>{total} total records</span>
      <div className="flex items-center gap-2">
        <button className="btn-secondary min-h-9 px-3" disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="px-2 font-semibold text-ink-800">Page {page} of {pages}</span>
        <button className="btn-secondary min-h-9 px-3" disabled={page >= pages} onClick={() => onPageChange(page + 1)} type="button">
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <span className={`block animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

export function MetricCard({ label, value, helper, icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    violet: 'bg-violet-50 text-violet-700'
  };
  return (
    <article className="card animate-slide-up p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-600">{label}</p>
          <p className="mt-2 font-display text-3xl font-black tracking-tight text-ink-950">{value}</p>
          {helper ? <p className="mt-1.5 text-xs text-ink-400">{helper}</p> : null}
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone] || tones.brand}`}><Icon size={21} /></span>
      </div>
    </article>
  );
}
