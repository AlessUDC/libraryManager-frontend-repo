import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveLoanByBarcode, returnLoan } from '../../api/loans';
import type { Loan } from '../../api/loans';
import {
  ArrowUturnLeftIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClockIcon,
  BoltIcon,
  QueueListIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import BarcodeScanner from '../../components/library/BarcodeScanner';
import { isAxiosError } from 'axios';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function diffDays(due: string): number {
  const now = new Date();
  const dueDate = new Date(due);
  const diff = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function StatusBadge({ loan }: { loan: Loan }) {
  const delay = diffDays(loan.dueDate);
  if (loan.status === 'RETURNED') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
        Devuelto
      </span>
    );
  }
  if (delay > 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-red-500/10 text-red-400 border-red-500/20">
        Vencido · {delay}d
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-blue-500/10 text-blue-400 border-blue-500/20">
      Activo
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// Quick Return Card (single loan preview)
// ────────────────────────────────────────────────────────────

interface QuickReturnCardProps {
  loan: Loan;
  onReturn: (condition: string, observations: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

function QuickReturnCard({ loan, onReturn, onClear, isLoading }: QuickReturnCardProps) {
  const [condition, setCondition] = useState('GOOD');
  const [observations, setObservations] = useState('');
  const delay = diffDays(loan.dueDate);

  const conditions = [
    { id: 'NEW', label: 'Nuevo', color: 'emerald', border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'GOOD', label: 'Bueno', color: 'blue', border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'DAMAGED', label: 'Dañado', color: 'amber', border: 'border-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'LOST', label: 'Perdido', color: 'red', border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
      {/* Header strip */}
      <div className={`h-1.5 w-full ${delay > 0 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />

      <div className="p-6 space-y-5">
        {/* Book info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <ArrowUturnLeftIcon className="w-7 h-7 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-lg leading-tight line-clamp-2">{loan.copy.book?.title}</p>
            <p className="text-slate-500 font-mono text-xs mt-1">{loan.copy.barcode}</p>
            <div className="mt-2">
              <StatusBadge loan={loan} />
            </div>
          </div>
          <button onClick={onClear} className="p-2 text-slate-600 hover:text-slate-300 transition-colors rounded-xl hover:bg-slate-800">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 rounded-2xl p-3 space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Prestado a</p>
            <p className="text-white font-bold text-sm truncate">{loan.user?.userData?.name} {loan.user?.userData?.paternalSurname}</p>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-3 space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Fecha límite</p>
            <p className={`font-bold text-sm ${delay > 0 ? 'text-red-400' : 'text-white'}`}>
              {new Date(loan.dueDate).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          {delay > 0 && (
            <div className="col-span-2 bg-red-500/5 border border-red-500/20 rounded-2xl p-3 flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 font-bold text-sm">
                {delay} {delay === 1 ? 'día' : 'días'} de retraso — se aplicarán multas o sanciones
              </p>
            </div>
          )}
        </div>

        {/* Condition picker */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Estado del ejemplar</p>
          <div className="grid grid-cols-4 gap-2">
            {conditions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCondition(opt.id)}
                className={`py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                  condition === opt.id
                    ? `${opt.bg} ${opt.border} ${opt.text}`
                    : 'bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Observaciones (opcional)</p>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ej: portada rayada, sin daños..."
            rows={2}
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-2.5 px-3 text-white placeholder:text-slate-600 focus:outline-none transition-all text-sm resize-none"
          />
        </div>

        {/* Confirm button */}
        <button
          onClick={() => onReturn(condition, observations)}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-black transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircleIcon className="w-6 h-6" />
              Registrar Devolución
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Continuous Scanner History Entry
// ────────────────────────────────────────────────────────────

interface ContinuousEntry {
  loanId: string;
  title: string;
  barcode: string;
  userName: string;
  returnedAt: Date;
  wasLate: boolean;
}

// ────────────────────────────────────────────────────────────
// Main View
// ────────────────────────────────────────────────────────────

export default function QuickReturnView() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'QUICK' | 'CONTINUOUS'>('QUICK');

  // Quick Return state
  const [barcode, setBarcode] = useState('');
  const [foundLoan, setFoundLoan] = useState<Loan | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Continuous mode state
  const [continuousHistory, setContinuousHistory] = useState<ContinuousEntry[]>([]);
  const [isContinuousScannerOpen, setIsContinuousScannerOpen] = useState(false);
  const [continuousProcessing, setContinuousProcessing] = useState(false);

  const returnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { condition: string; observations?: string } }) =>
      returnLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
    },
  });

  // ── Quick Return ──────────────────────────────────────────

  const handleLookup = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLookupError('');
    setFoundLoan(null);
    setIsLookingUp(true);
    try {
      const loan = await getActiveLoanByBarcode(trimmed);
      setFoundLoan(loan);
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : 'No se encontró ningún préstamo activo.';
      setLookupError(typeof msg === 'string' ? msg : 'No se encontró ningún préstamo activo.');
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLookup(barcode);
  };

  const handleScanSuccess = useCallback((scanned: string) => {
    setBarcode(scanned);
    handleLookup(scanned);
  }, [handleLookup]);

  const handleQuickReturn = (condition: string, observations: string) => {
    if (!foundLoan) return;
    returnMutation.mutate(
      { id: foundLoan.loanId, data: { condition, observations } },
      {
        onSuccess: () => {
          toast.success(`✓ Devolución registrada — ${foundLoan.copy.book?.title}`);
          setFoundLoan(null);
          setBarcode('');
          setTimeout(() => inputRef.current?.focus(), 100);
        },
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  // ── Continuous Scanner ────────────────────────────────────

  const handleContinuousScan = useCallback(async (scanned: string) => {
    if (continuousProcessing) return;
    setContinuousProcessing(true);

    try {
      const loan = await getActiveLoanByBarcode(scanned.trim());
      await returnLoan(loan.loanId, { condition: 'GOOD' });
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      const entry: ContinuousEntry = {
        loanId: loan.loanId,
        title: loan.copy.book?.title ?? 'Desconocido',
        barcode: loan.copy.barcode,
        userName: `${loan.user?.userData?.name ?? ''} ${loan.user?.userData?.paternalSurname ?? ''}`.trim(),
        returnedAt: new Date(),
        wasLate: diffDays(loan.dueDate) > 0,
      };
      setContinuousHistory((prev) => [entry, ...prev]);
      toast.success(`✓ ${entry.title}`, { autoClose: 2000, position: 'bottom-right' });
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : 'Error al registrar devolución';
      toast.error(typeof msg === 'string' ? msg : 'Error al registrar devolución', { autoClose: 3000, position: 'bottom-right' });
    } finally {
      setContinuousProcessing(false);
      // Re-open scanner for the next book
      setTimeout(() => setIsContinuousScannerOpen(true), 800);
    }
  }, [continuousProcessing, queryClient]);

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-2xl mx-auto">

      {/* Scanners */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
      />
      <BarcodeScanner
        isOpen={isContinuousScannerOpen}
        onClose={() => setIsContinuousScannerOpen(false)}
        onScan={handleContinuousScan}
      />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Devolución de Libros</h1>
          <p className="text-slate-400 mt-1">Registra devoluciones por código de barras en segundos</p>
        </div>

        {/* Mode toggle */}
        <div className="bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 flex gap-2 self-start">
          <button
            onClick={() => setMode('QUICK')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              mode === 'QUICK'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <BoltIcon className="w-4 h-4" />
            Devolución Rápida
          </button>
          <button
            onClick={() => setMode('CONTINUOUS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              mode === 'CONTINUOUS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <QueueListIcon className="w-4 h-4" />
            Modo Masivo
          </button>
        </div>
      </div>

      {/* ── QUICK RETURN MODE ── */}
      {mode === 'QUICK' && (
        <div className="space-y-6">
          {/* Input card */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ArrowUturnLeftIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Registrar Devolución</h2>
                <p className="text-xs text-slate-500">Escanea o ingresa el código de barras del ejemplar</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Código de barras del ejemplar..."
                  value={barcode}
                  onChange={(e) => {
                    setBarcode(e.target.value);
                    setLookupError('');
                  }}
                  onKeyDown={handleBarcodeInput}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none transition-all font-mono text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={() => handleLookup(barcode)}
                disabled={isLookingUp || !barcode.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
              >
                {isLookingUp ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : 'Buscar'}
              </button>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all active:scale-95 border border-slate-700"
                title="Usar cámara"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
            </div>

            {lookupError && (
              <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-2xl p-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm font-medium">{lookupError}</p>
              </div>
            )}

            {/* Hint when idle */}
            {!foundLoan && !lookupError && !isLookingUp && (
              <div className="flex items-center gap-3 text-slate-600 bg-slate-950/30 rounded-2xl p-3">
                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">Pulsa <kbd className="px-1.5 py-0.5 bg-slate-800 rounded-md text-slate-400 font-mono text-[11px]">Enter</kbd> o usa la cámara para buscar automáticamente</p>
              </div>
            )}
          </div>

          {/* Loan preview card */}
          {foundLoan && (
            <QuickReturnCard
              loan={foundLoan}
              onReturn={handleQuickReturn}
              onClear={() => { setFoundLoan(null); setBarcode(''); }}
              isLoading={returnMutation.isPending}
            />
          )}
        </div>
      )}

      {/* ── CONTINUOUS SCANNER MODE ── */}
      {mode === 'CONTINUOUS' && (
        <div className="space-y-6">
          {/* Activation card */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <QueueListIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Modo Devolución Masiva</h2>
                <p className="text-xs text-slate-500">Cada libro escaneado se registra automáticamente como devuelto</p>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300/80 text-sm leading-relaxed">
                En modo masivo, la condición se registra como <strong>Bueno</strong> automáticamente. Si un libro presenta daños, usa la <strong>Devolución Rápida</strong> individual.
              </p>
            </div>

            <button
              onClick={() => setIsContinuousScannerOpen(true)}
              disabled={continuousProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-black transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <CameraIcon className="w-6 h-6" />
              {continuousProcessing ? 'Procesando...' : 'Iniciar Escáner'}
            </button>
          </div>

          {/* History */}
          {continuousHistory.length > 0 && (
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-black text-white uppercase tracking-wider">Historial de sesión</p>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {continuousHistory.length} libros
                  </span>
                </div>
                <button
                  onClick={() => setContinuousHistory([])}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  title="Limpiar historial"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                {continuousHistory.map((entry) => (
                  <div key={`${entry.loanId}-${entry.returnedAt.getTime()}`} className="flex items-center gap-4 p-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      entry.wasLate
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      <CheckCircleIcon className={`w-4 h-4 ${entry.wasLate ? 'text-amber-400' : 'text-emerald-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{entry.title}</p>
                      <p className="text-slate-500 text-xs truncate">{entry.userName} · {entry.barcode}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-slate-600 font-mono">
                        {entry.returnedAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                      {entry.wasLate && (
                        <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Con retraso</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {continuousHistory.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <QueueListIcon className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-600 font-bold">Aún no has escaneado ningún libro</p>
              <p className="text-slate-700 text-sm">Inicia el escáner y los libros devueltos aparecerán aquí</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
