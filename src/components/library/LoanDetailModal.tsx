import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BookOpenIcon, CalendarDaysIcon, ClockIcon, BanknotesIcon, MapPinIcon, QrCodeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { Loan } from '../../api/loans';

interface LoanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Préstamo Activo', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  OVERDUE: { label: 'Vencido / Atrasado', cls: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' },
  RETURNED: { label: 'Devuelto a Tiempo', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const DEPOSIT_MAP: Record<string, { label: string; cls: string; desc: string }> = {
  HELD: { label: 'Retenido en Garantía', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'El depósito está en custodia de la biblioteca hasta la devolución del ejemplar.' },
  REFUNDED: { label: 'Reembolsado', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'El depósito ha sido devuelto íntegramente al usuario.' },
  FORFEITED: { label: 'Ejecutado / Perdido', cls: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'El depósito ha sido cobrado como penalización por retraso extremo o daño del ejemplar.' },
};

export default function LoanDetailModal({ isOpen, onClose, loan }: LoanDetailModalProps) {
  if (!loan) return null;

  const now = new Date();
  const isOverdue = loan.status === 'ACTIVE' && new Date(loan.dueDate) < now;
  const effectiveStatus = isOverdue ? 'OVERDUE' : loan.status;
  const statusInfo = STATUS_MAP[effectiveStatus] || STATUS_MAP.ACTIVE;

  const fmtDate = (d: string) => {
    return new Date(d).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysRemaining(loan.dueDate);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[2.5rem] bg-[#0B0F19]/98 border border-slate-800/80 p-8 md:p-10 text-left align-middle shadow-2xl transition-all relative">
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Header Section */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/10`}>
                    <BookOpenIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block mb-1.5 ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                    <h2 className="text-xl font-black text-white leading-tight line-clamp-2">
                      {loan.copy?.book?.title || 'Información del Libro'}
                    </h2>
                  </div>
                </div>

                {/* Content Body */}
                <div className="space-y-6">
                  
                  {/* Copy Details */}
                  <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-4 space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Detalles del Ejemplar</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2.5">
                        <QrCodeIcon className="w-5 h-5 text-slate-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Código de Barras</p>
                          <p className="text-xs font-mono font-bold text-white">{loan.copy?.barcode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPinIcon className="w-5 h-5 text-slate-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Ubicación</p>
                          <p className="text-xs font-bold text-white">{loan.copy?.location || 'No asignada'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loan Dates */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cronograma del Préstamo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800 flex items-start gap-3">
                        <CalendarDaysIcon className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Fecha de Salida</p>
                          <p className="text-xs font-bold text-white mt-1">{fmtDate(loan.borrowDate)}</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isOverdue ? 'bg-red-950/15 border-red-500/20' : 'bg-slate-900/30 border-slate-800'}`}>
                        <ClockIcon className={`w-5 h-5 mt-0.5 shrink-0 ${isOverdue ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                        <div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Fecha de Vencimiento</p>
                          <p className={`text-xs font-bold mt-1 ${isOverdue ? 'text-red-400' : 'text-white'}`}>{fmtDate(loan.dueDate)}</p>
                        </div>
                      </div>
                    </div>

                    {loan.returnDate && (
                      <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                        <ShieldCheckIcon className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Devuelto el</p>
                          <p className="text-xs font-bold text-emerald-400 mt-1">{fmtDate(loan.returnDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remaining/Overdue time notice */}
                  {loan.status === 'ACTIVE' && (
                    <div className={`p-4 rounded-2xl border ${isOverdue ? 'bg-red-500/10 border-red-500/20 text-red-400' : daysLeft <= 3 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                      <p className="text-xs font-bold leading-relaxed text-center">
                        {isOverdue 
                          ? `Este préstamo tiene un retraso de ${Math.abs(daysLeft)} día(s). Por favor devuelve el ejemplar lo antes posible para evitar sanciones acumulativas.`
                          : `Te quedan ${daysLeft} día(s) para devolver o renovar este libro.`
                        }
                      </p>
                    </div>
                  )}

                  {/* Deposit Info if applicable */}
                  {loan.depositAmount != null && (
                    <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BanknotesIcon className="w-5 h-5 text-slate-400" />
                          <h3 className="text-sm font-black text-white">Garantía / Depósito</h3>
                        </div>
                        <span className="text-lg font-black text-white">
                          S/ {loan.depositAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      {loan.depositStatus && (
                        <div className="pt-3 border-t border-slate-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estado del Depósito</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${DEPOSIT_MAP[loan.depositStatus]?.cls}`}>
                              {DEPOSIT_MAP[loan.depositStatus]?.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {DEPOSIT_MAP[loan.depositStatus]?.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    Entendido
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
