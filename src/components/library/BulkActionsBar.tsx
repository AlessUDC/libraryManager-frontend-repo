import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
  itemName?: string;
}

export default function BulkActionsBar({ 
  selectedCount, 
  onDelete, 
  onClearSelection,
  itemName = 'elementos'
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/30 px-4 py-2 rounded-2xl flex items-center gap-6">
        <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-[0_0_10px_rgba(37,99,235,0.3)]">
            {selectedCount}
          </div>
          <div className="hidden md:block">
            <p className="text-white font-bold text-xs">
              {selectedCount === 1 ? 'Seleccionado' : 'Seleccionados'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClearSelection}
            className="p-1.5 text-slate-400 hover:text-white transition-colors group"
            title="Cancelar selección"
          >
            <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
          
          <button
            onClick={onDelete}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border border-red-500/20 hover:border-red-600 active:scale-95 group"
          >
            <TrashIcon className="w-4 h-4 group-hover:animate-bounce" />
            <span className="hidden sm:inline">Eliminar {selectedCount === 1 ? 'item' : 'lote'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
