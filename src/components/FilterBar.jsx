import { RotateCcw, Search } from 'lucide-react';

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters = [],
  onFilterChange,
  onClear,
  children
}) {
  return (
    <section className="card mb-4 p-4">
      <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
          <input
            className="field min-h-11 pl-10"
            onChange={event => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={search}
          />
        </label>

        {filters.map(filter => (
          <label className="block" key={filter.key}>
            <span className="field-label">{filter.label}</span>
            <select
              className="field min-h-11"
              onChange={event => onFilterChange?.(filter.key, event.target.value)}
              value={filter.value ?? ''}
            >
              <option value="">{filter.allLabel || `All ${filter.label.toLowerCase()}`}</option>
              {(filter.options || []).map(option => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                return <option key={value} value={value}>{label}</option>;
              })}
            </select>
          </label>
        ))}

        <div className="flex items-end gap-2">
          <button className="btn-secondary min-h-11 px-3" onClick={onClear} type="button">
            <RotateCcw size={16} />
            Clear
          </button>
        </div>
      </div>

      {children ? <div className="mt-4 border-t border-line pt-4">{children}</div> : null}
    </section>
  );
}
