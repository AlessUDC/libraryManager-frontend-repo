import { useQuery } from '@tanstack/react-query';
import { getMyLoans } from '../../api/loans';
import { BookOpenIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import type { Loan } from '../../api/loans';

export default function MyLoansView() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['my-loans', user?.userId],
    queryFn: () => getMyLoans(user?.userId),
    enabled: !!user?.userId,
  });

  const { activeLoans, overdueLoans, returnedLoans } = useMemo(() => {
    const active: Loan[] = [];
    const overdue: Loan[] = [];
    const returned: Loan[] = [];

    const now = new Date();

    loans.forEach(loan => {
      if (loan.status === 'RETURNED') {
        returned.push(loan);
      } else {
        const dueDate = new Date(loan.dueDate);
        if (dueDate.getTime() < now.getTime()) {
          overdue.push(loan);
        } else {
          active.push(loan);
        }
      }
    });

    return { activeLoans: active, overdueLoans: overdue, returnedLoans: returned };
  }, [loans]);

  const getDaysRemaining = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Mis Préstamos</h1>
        <p className="text-slate-400 mt-1">Gestiona tus libros prestados y próximos a vencer</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 flex items-center gap-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <BookOpenIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Activos</p>
            <p className="text-3xl font-black text-white">{activeLoans.length}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 flex items-center gap-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <ExclamationTriangleIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vencidos</p>
            <p className="text-3xl font-black text-white">{overdueLoans.length}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 flex items-center gap-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Devueltos</p>
            <p className="text-3xl font-black text-white">{returnedLoans.length}</p>
          </div>
        </div>
      </div>

      {/* Active Loans List */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-blue-400" />
          Préstamos Actuales
        </h2>

        {activeLoans.length === 0 && overdueLoans.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
            <BookOpenIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No tienes libros prestados</h3>
            <p className="text-slate-500 mt-1">Visita la sección de Explorar para encontrar tu próxima lectura.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...overdueLoans, ...activeLoans].map(loan => {
              const isOverdue = new Date(loan.dueDate).getTime() < new Date().getTime();
              const daysLeft = getDaysRemaining(loan.dueDate);
              const progressPercentage = Math.max(0, Math.min(100, (daysLeft / 14) * 100)); // Assuming 14 days total
              
              const colorClass = isOverdue ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-emerald-500';
              const ringColor = isOverdue ? 'text-red-500/20' : daysLeft <= 3 ? 'text-amber-500/20' : 'text-emerald-500/20';

              return (
                <div key={loan.loanId} className={`relative bg-slate-900/60 backdrop-blur-md border ${isOverdue ? 'border-red-500/30 shadow-red-900/20' : 'border-slate-800'} rounded-[2rem] p-6 shadow-xl flex flex-col`}>
                  {isOverdue && (
                    <div className="absolute top-0 right-0 translate-x-2 -translate-y-2">
                      <span className="flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest border border-slate-700">
                        {loan.copy?.barcode}
                      </span>
                      <h3 className="text-lg font-black text-white mt-3 line-clamp-2">{loan.copy?.book?.title}</h3>
                    </div>
                    
                    {/* Progress Ring */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className={ringColor}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className={colorClass}
                          strokeDasharray={`${progressPercentage}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className={`text-sm font-black ${colorClass}`}>{Math.abs(daysLeft)}</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter -mt-1">Días</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Vencimiento:</span>
                      <span className={`font-black ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}>
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all">
                      Solicitar Prórroga
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History Table */}
      {returnedLoans.length > 0 && (
        <div className="space-y-6 mt-12">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
            Historial de Devoluciones
          </h2>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 font-black tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-5">Libro</th>
                    <th className="px-6 py-5">Fecha Préstamo</th>
                    <th className="px-6 py-5">Fecha Devolución</th>
                    <th className="px-6 py-5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {returnedLoans.map(loan => {
                    const returnedLate = loan.returnDate && new Date(loan.returnDate).getTime() > new Date(loan.dueDate).getTime();
                    return (
                      <tr key={loan.loanId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{loan.copy?.book?.title}</td>
                        <td className="px-6 py-4">{new Date(loan.borrowDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 flex justify-center">
                          {returnedLate ? (
                            <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                              Con Retraso
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                              A Tiempo
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
