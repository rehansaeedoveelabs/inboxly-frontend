import { cn } from '../../lib/cn'

export function Table({ columns, rows, empty, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-line', className)}>
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-secondary/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="border-b border-line px-3 py-2.5 text-xs font-semibold tracking-wide text-muted uppercase"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-muted">
                {empty || 'No rows to display.'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-line/70 hover:bg-secondary/30">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2.5 text-ink">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
