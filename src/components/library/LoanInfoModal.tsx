import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { getMyLoans } from '../../api/loans';
import type { Loan } from '../../api/loans';
import {
  XMarkIcon, BookOpenIcon, CalendarDaysIcon,
  ArrowPathIcon, ClockIcon, BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';
import Pagination from '../Pagination';

type LoanInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE:   { label: 'Activo',    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  OVERDUE:  { label: 'Vencido',   cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  RETURNED: { label: 'Devuelto',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const DEPOSIT_MAP: Record<string, { label: string; cls: string }> = {
  HELD:      { label: 'Retenido',   cls: 'text-amber-400' },
  REFUNDED:  { label: 'Reembolsado',cls: 'text-emerald-400' },
  FORFEITED: { label: 'Perdido',    cls: 'text-red-400' },
};

const ITEMS_PER_PAGE = 5;

export default function LoanInfoModal({ isOpen, onClose, userId, userName }: LoanInfoModalProps) {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RETURNED' | 'OVERDUE'>('ALL');
  const [page, setPage] = useState(1);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans-user', userId],
    queryFn: () => getMyLoans(userId),
    enabled: isOpen && !!userId,
  });

  const filtered = useMemo(() => {
    const now = new Date();
    return loans.filter(l => {
      if (filter === 'ALL') return true;
      if (filter === 'ACTIVE') return l.status === 'ACTIVE' && new Date(l.dueDate) >= now;
      if (filter === 'OVERDUE') return l.status === 'ACTIVE' && new Date(l.dueDate) < now;
      return l.status === 'RETURNED';
    });
  }, [loans, filter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      active:   loans.filter(l => l.status === 'ACTIVE' && new Date(l.dueDate) >= now).length,
      overdue:  loans.filter(l => l.status === 'ACTIVE' && new Date(l.dueDate) < now).length,
      returned: loans.filter(l => l.status === 'RETURNED').length,
    };
  }, [loans]);

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    setPage(1);
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-2xl bg-[#0B0F19]/98 border border-slate-800/80 rounded-[2rem] shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="h-28 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 relative flex items-end px-8 pb-5">
                <div className="absolute top-4 right-4">
                  <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Historial de Préstamos</p>
                  <h2 className="text-xl font-black text-white">{userName || 'Usuario'}</h2>
                </div>
              </div>

              {/* Avatar overlap */}
              <div className="px-8 pt-0">
                <div className="flex items-center gap-3 -mt-5 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black border-2 border-slate-900 shadow-lg text-sm">
                    {(userName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-400 text-xs font-bold">{loans.length} préstamo(s) registrado(s)</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Activos', value: stats.active, cls: 'text-blue-400', icon: BookOpenIcon },
                    { label: 'Vencidos', value: stats.overdue, cls: 'text-red-400', icon: ClockIcon },
                    { label: 'Devueltos', value: stats.returned, cls: 'text-emerald-400', icon: ArrowPathIcon },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-1">
                      <s.icon className={`w-5 h-5 ${s.cls}`} />
                      <span className={`text-2xl font-black ${s.cls}`}>{s.value}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-xl mb-5 w-fit">
                  {(['ALL', 'ACTIVE', 'OVERDUE', 'RETURNED'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => handleFilterChange(f)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      {f === 'ALL' ? 'Todos' : f === 'ACTIVE' ? 'Activos' : f === 'OVERDUE' ? 'Vencidos' : 'Devueltos'}
                    </button>
                  ))}
                </div>

                {/* Loan list */}
                <div className="space-y-3 pb-6 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  ) : paginated.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-medium">
                      No hay préstamos en esta categoría.
                    </div>
                  ) : paginated.map((loan: Loan) => {
                    const now = new Date();
                    const isOverdue = loan.status === 'ACTIVE' && new Date(loan.dueDate) < now;
                    const effectiveStatus = isOverdue ? 'OVERDUE' : loan.status;
                    const { label, cls } = STATUS_MAP[effectiveStatus] ?? STATUS_MAP['ACTIVE'];

                    return (
                      <div key={loan.loanId} className="bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                              <BookOpenIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-white line-clamp-1">{loan.copy.book?.title || 'Libro desconocido'}</p>
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{loan.copy.barcode}</p>
                              <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1">
                                  <CalendarDaysIcon className="w-3 h-3" /> Prestado: {fmtDate(loan.borrowDate)}
                                </span>
                                <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400 font-bold' : ''}`}>
                                  <ClockIcon className="w-3 h-3" /> Vence: {fmtDate(loan.dueDate)}
                                </span>
                                {loan.returnDate && (
                                  <span className="flex items-center gap-1 text-emerald-400">
                                    <ArrowPathIcon className="w-3 h-3" /> Dev.: {fmtDate(loan.returnDate)}
                                  </span>
                                )}
                              </div>
                              {loan.depositAmount != null && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <BanknotesIcon className="w-3 h-3 text-slate-500" />
                                  <span className="text-[10px] text-slate-500">Depósito: S/ {loan.depositAmount.toFixed(2)}</span>
                                  {loan.depositStatus && (
                                    <span className={`text-[10px] font-bold ${DEPOSIT_MAP[loan.depositStatus]?.cls}`}>
                                      ({DEPOSIT_MAP[loan.depositStatus]?.label})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${cls}`}>
                            {label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="pb-6">
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
