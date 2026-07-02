import Loader from './Loader';
import { EmptyState } from './UI';

export default function Table({
  columns,
  rows,
  loading = false,
  emptyMessage = 'No records found',
  rowKey = '_id',
  onRowClick
}) {
  if (loading) return <div className="card"><Loader /></div>;
  if (!rows?.length) return <EmptyState title={emptyMessage} />;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>{columns.map(column => <th className={`table-heading ${column.className || ''}`} key={column.key}>{column.header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                className={`${onRowClick ? 'cursor-pointer' : ''} transition hover:bg-brand-50/50`}
                key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey] || index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map(column => (
                  <td className={`table-cell ${column.cellClassName || ''}`} key={column.key}>
                    {column.render ? column.render(row) : row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
