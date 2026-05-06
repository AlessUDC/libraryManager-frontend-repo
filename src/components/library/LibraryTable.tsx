import type { ReactNode } from 'react';

interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface LibraryTableProps<T> {
  data: T[];
  columns: Column<T>[];
  renderActions?: (item: T) => ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ElementType;
}

export default function LibraryTable<T>({ 
  data, 
  columns, 
  renderActions,
  emptyMessage = "No se encontraron resultados",
  emptyIcon: EmptyIcon
}: LibraryTableProps<T>) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/30">
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((item, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-800/20 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.render(item)}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-6 py-4 text-right">
                    {renderActions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="p-20 text-center">
          {EmptyIcon && <EmptyIcon className="w-16 h-16 text-slate-800 mx-auto mb-4" />}
          <p className="text-slate-500 font-medium text-lg">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
