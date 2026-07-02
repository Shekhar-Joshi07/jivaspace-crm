export default function Loader({ fullPage = false, label = 'Loading…' }) {
  return (
    <div className={`${fullPage ? 'min-h-screen' : 'min-h-44'} grid place-items-center`}>
      <div className="flex flex-col items-center gap-3 text-sm font-semibold text-ink-600" role="status">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
        <span>{label}</span>
      </div>
    </div>
  );
}
