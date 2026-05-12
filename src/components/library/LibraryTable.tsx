import type { ReactNode } from 'react';
import { useState } from 'react';

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
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  idExtractor?: (item: T) => string;
}

const LibraryTable = <T extends unknown>({
  data = [],
  columns,
  renderActions,
  emptyMessage = "No hay datos disponibles",
  emptyIcon: EmptyIcon,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  idExtractor
}: LibraryTableProps<T>) => {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const allSelected = data.length > 0 && data.every(item => idExtractor && selectedIds.includes(idExtractor(item)));

  const handleSelectAll = () => {
    if (!onSelectionChange || !idExtractor) return;
    if (allSelected) {
      const currentIds = selectedIds.filter(id => !data.find(item => idExtractor(item) === id));
      onSelectionChange(currentIds);
    } else {
      const newIds = [...new Set([...selectedIds, ...data.map(item => idExtractor(item))])];
      onSelectionChange(newIds);
    }
  };

  const handleSelectOne = (id: string, index: number, isShiftPressed: boolean) => {
    if (!onSelectionChange || !idExtractor) return;

    let newSelectedIds = [...selectedIds];

    if (isShiftPressed && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = data.slice(start, end + 1).map(item => idExtractor(item));
      
      const isRemoving = selectedIds.includes(id);
      if (isRemoving) {
        newSelectedIds = newSelectedIds.filter(i => !rangeIds.includes(i));
      } else {
        newSelectedIds = [...new Set([...newSelectedIds, ...rangeIds])];
      }
    } else {
      if (selectedIds.includes(id)) {
        newSelectedIds = newSelectedIds.filter(i => i !== id);
      } else {
        newSelectedIds.push(id);
      }
    }

    onSelectionChange(newSelectedIds);
    setLastSelectedIndex(index);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-900/90 backdrop-blur-md shadow-sm">
              {selectable && (
                <th className="px-6 py-4 w-12">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-2 border-slate-700 bg-slate-900/50 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0 transition-all cursor-pointer checked:border-blue-500 hover:border-slate-500 appearance-none checked:bg-[url('data:image/svg+xml;border-radius:4px;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0id2hpdGUiPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE2LjcwNyA1LjI5M2ExIDEgMCAwMTAgMS40MTRsLTggOGExIDEgMCAwMS0xLjQxNCAwbC00LTRhMSAxIDAgMTExLjQxNC0xLjQxNEw4IDEyLjU4NmwtNy4yOTMtNy4yOTNhMSAxIDAgMDExLjQxNCAweiIgY2xpcC1ydWxlPSJldmVub2RkIiAvPgo8L3N2Zz4=')] bg-center bg-no-repeat bg-[length:12px_12px]"
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
              )}
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
          <tbody className="divide-y divide-slate-800/50">
            {data.map((item, rowIndex) => {
              const id = idExtractor ? idExtractor(item) : '';
              const isSelected = selectedIds.includes(id);

              return (
                <tr key={rowIndex} className={`transition-all duration-200 ${isSelected ? 'bg-blue-500/10' : 'hover:bg-slate-800/30'}`}>
                  {selectable && (
                    <td className="px-6 py-4 w-12">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-2 border-slate-700 bg-slate-900/50 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0 transition-all cursor-pointer checked:border-blue-500 hover:border-slate-500 appearance-none checked:bg-[url('data:image/svg+xml;border-radius:4px;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0id2hpdGUiPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE2LjcwNyA1LjI5M2ExIDEgMCAwMTAgMS40MTRsLTggOGExIDEgMCAwMS0xLjQxNCAwbC00LTRhMSAxIDAgMTExLjQxNC0xLjQxNEw4IDEyLjU4NmwtNy4yOTMtNy4yOTNhMSAxIDAgMDExLjQxNCAweiIgY2xpcC1ydWxlPSJldmVub2RkIiAvPgo8L3N2Zz4=')] bg-center bg-no-repeat bg-[length:12px_12px]"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(id, rowIndex, (e.nativeEvent as MouseEvent).shiftKey)}
                        />
                      </div>
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 text-sm text-slate-300 ${col.className || ''}`}>
                      {col.render(item)}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-6 py-4 text-right">
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            {EmptyIcon && <EmptyIcon className="w-16 h-16 text-slate-800 mb-4 opacity-50" />}
            <p className="text-slate-500 font-medium text-lg">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryTable;
