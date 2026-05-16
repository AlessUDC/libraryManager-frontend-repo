import { useQuery } from '@tanstack/react-query';
import { getMyLoans } from '../../api/loans';
import type { Loan } from '../../api/loans';
import { getMyReservations } from '../../api/reservations';

import {
  BookOpenIcon,
  DocumentTextIcon,
  BellIcon,
  ClockIcon,
  TicketIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const {
    data: loans = [],
    isLoading: isLoadingLoans
  } = useQuery({
    queryKey: ['my-loans', user?.userId],
    queryFn: () => getMyLoans(user?.userId),
    enabled: !!user?.userId
  });

  const {
    data: reservations = [],
    isLoading: isLoadingReservations
  } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: getMyReservations
  });

  const activeLoans = loans.filter(
    (loan: Loan) => loan.status === 'ACTIVE'
  );

  const overdueLoans = loans.filter(
    (loan: Loan) => {
      if (loan.status === 'OVERDUE') return true;
      if (loan.status === 'ACTIVE' && new Date(loan.dueDate).getTime() < new Date().getTime()) return true;
      return false;
    }
  );

  if (isLoadingLoans || isLoadingReservations) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            Panel de Docente
          </h1>

          <p className="text-slate-400 mt-1">
            Gestión bibliográfica y seguimiento académico
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>

          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Estado: Activo
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <BookOpenIcon className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              En posesión
            </span>
          </div>

          <p className="text-4xl font-black text-white">
            {activeLoans.length}
          </p>

          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Libros Prestados
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <TicketIcon className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Pendientes
            </span>
          </div>

          <p className="text-4xl font-black text-white">
            {reservations.length}
          </p>

          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Reservas Activas
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
              <BellIcon className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Alertas
            </span>
          </div>

          <p className="text-4xl font-black text-white">
            {overdueLoans.length}
          </p>

          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Avisos Vencidos
          </p>
        </div>
      </div>

      {/* Hero & Active Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-linear-to-br from-indigo-900/10 to-slate-900 border border-slate-800 p-10 rounded-[3rem] relative overflow-hidden flex flex-col items-center text-center h-full justify-center">
            <div className="absolute top-0 left-0 p-10 opacity-5">
              <DocumentTextIcon className="w-64 h-64 text-white" />
            </div>

            <div className="relative z-10 space-y-6 max-w-2xl">
              <h2 className="text-3xl font-black text-white leading-tight">
                Gestión Bibliográfica Docente
              </h2>

              <p className="text-slate-400 leading-relaxed">
                Administre sus recursos académicos y préstamos vigentes.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                  to="/explore"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Explorar Catálogo
                </Link>

                <Link
                  to="/loans"
                  className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  <ClockIcon className="w-5 h-5" />
                  Mis Préstamos
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Active Loans Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Lecturas Actuales
            </h2>
            {activeLoans.length > 0 && (
              <Link to="/loans" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">
                Ver todo
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {activeLoans.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-8 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">No hay préstamos activos</p>
              </div>
            ) : (
              activeLoans.slice(0, 3).map(loan => (
                <div key={loan.loanId} className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl hover:border-blue-500/30 transition-all group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{loan.copy?.barcode}</p>
                      <h3 className="text-white text-sm font-bold line-clamp-1 group-hover:text-blue-400 transition-colors">{loan.copy?.book?.title}</h3>
                    </div>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 whitespace-nowrap">
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}