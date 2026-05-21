import { Fragment, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import {
  XMarkIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { getMyLoans } from '../api/loans';
import type { Loan } from '../api/loans';
import type { User } from '../types/user';

type UserLoansModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User | null;
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const depositLabel = (status: Loan['depositStatus']) => {
  switch (status) {
    case 'HELD':
      return 'Retenido';
    case 'REFUNDED':
      return 'Devuelto';
    case 'FORFEITED':
      return 'Perdido';
    default:
      return 'Sin depósito';
  }
};

function LoanCard({ loan }: { loan: Loan }) {
  const isOverdue =
    loan.status !== 'RETURNED' && new Date(loan.dueDate) < new Date();

  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
            {loan.copy?.barcode}
          </p>
          <h4 className="text-white font-bold leading-tight">
            {loan.copy?.book?.title || 'Libro sin título'}
          </h4>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            loan.status === 'RETURNED'
              ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              : isOverdue
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}
        >
          {loan.status === 'RETURNED'
            ? 'Devuelto'
            : isOverdue
              ? 'Vencido'
              : 'Vigente'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">
            Préstamo
          </p>
          <p className="text-slate-300">{formatDate(loan.borrowDate)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">
            Vencimiento
          </p>
          <p className="text-slate-300">{formatDate(loan.dueDate)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">
            Devolución
          </p>
          <p className="text-slate-300">{formatDate(loan.returnDate)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">
            Tipo
          </p>
          <p className="text-slate-300">
            {loan.type === 'LIBRARY' ? 'En sala' : 'A domicilio'}
          </p>
        </div>
      </div>

      {loan.depositAmount != null && (
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            Depósito (S/ {loan.depositAmount.toFixed(2)})
          </span>
          <span className="text-indigo-400 font-bold">
            {depositLabel(loan.depositStatus)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function UserLoansModal({
  isOpen,
  setIsOpen,
  user,
}: UserLoansModalProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['user-loans', user?.userId],
    queryFn: () => getMyLoans(user!.userId),
    enabled: isOpen && !!user?.userId,
  });

  const { activeLoans, historyLoans } = useMemo(() => {
    const now = new Date();
    const active: Loan[] = [];
    const history: Loan[] = [];

    loans.forEach((loan) => {
      if (loan.status === 'RETURNED') {
        history.push(loan);
      } else if (new Date(loan.dueDate) < now || loan.status === 'OVERDUE') {
        history.push(loan);
      } else {
        active.push(loan);
      }
    });

    return { activeLoans: active, historyLoans: history };
  }, [loans]);

  const displayedLoans = activeTab === 'active' ? activeLoans : historyLoans;

  const handleClose = () => {
    setIsOpen(false);
    setActiveTab('active');
  };

  if (!user) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl transition-all">
                <div className="h-24 bg-linear-to-r from-indigo-600 to-blue-600 relative px-8 flex items-end pb-4">
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <div>
                    <Dialog.Title className="text-xl font-black text-white">
                      Préstamos del Usuario
                    </Dialog.Title>
                    <p className="text-indigo-200 text-sm mt-0.5">
                      {user.userData.name} {user.userData.paternalSurname} ·{' '}
                      {user.code}
                    </p>
                  </div>
                </div>

                <div className="px-8 py-6 space-y-6">
                  <div className="flex border-b border-slate-800 gap-6">
                    <button
                      onClick={() => setActiveTab('active')}
                      className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
                        activeTab === 'active'
                          ? 'text-blue-400'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        Vigentes ({activeLoans.length})
                      </span>
                      {activeTab === 'active' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
                        activeTab === 'history'
                          ? 'text-blue-400'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Historial ({historyLoans.length})
                      </span>
                      {activeTab === 'history' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-16">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                    </div>
                  ) : displayedLoans.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <BookOpenIcon className="w-12 h-12 text-slate-700 mx-auto" />
                      <p className="text-slate-500 text-sm">
                        {activeTab === 'active'
                          ? 'No hay préstamos vigentes'
                          : 'No hay historial de préstamos'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                      {displayedLoans.map((loan) => (
                        <LoanCard key={loan.loanId} loan={loan} />
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1.5">
                    <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                    Vista de solo lectura — sin acciones de devolución o renovación
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
