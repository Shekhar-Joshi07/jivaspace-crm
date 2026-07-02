import Loader from './Loader';
import { EmptyState } from './UI';

export default function DataTable({
  columns,
  rows,
  loading = false,
  emptyMessage = 'No records found',
  rowKey = '_id',
  onRowClick,
  selectable = false,
  selectedIds = [],
  onToggleRow,
  onToggleAll
}) {
  if (loading) return <div className="card"><Loader /></div>;
  if (!rows?.length) return <EmptyState title={emptyMessage} />;

  const allSelected = selectable && rows.length > 0 && rows.every(row => selectedIds.includes(String(row[rowKey] || row.id)));

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr>
              {selectable ? (
                <th className="table-heading w-12">
                  <input checked={allSelected} onChange={event => onToggleAll?.(event.target.checked)} type="checkbox" />
                </th>
              ) : null}
              {columns.map(column => (
                <th className={`table-heading ${column.className || ''}`} key={column.key}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const resolvedKey = typeof rowKey === 'function' ? rowKey(row) : row[rowKey] || row.id || index;
              const isSelected = selectedIds.includes(String(resolvedKey));
              return (
                <tr
                  className={`${onRowClick ? 'cursor-pointer' : ''} transition hover:bg-brand-50/50 ${isSelected ? 'bg-brand-50/40' : ''}`}
                  key={resolvedKey}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable ? (
                    <td className="table-cell w-12" onClick={event => event.stopPropagation()}>
                      <input checked={isSelected} onChange={event => onToggleRow?.(row, event.target.checked)} type="checkbox" />
                    </td>
                  ) : null}
                  {columns.map(column => (
                    <td className={`table-cell ${column.cellClassName || ''}`} key={column.key}>
                      {column.render ? column.render(row) : row[column.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
