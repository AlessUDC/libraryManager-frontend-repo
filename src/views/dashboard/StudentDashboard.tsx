import { useQuery } from '@tanstack/react-query';
import { getMyLoans } from '../../api/loans';
import { getUserProfile } from '../../api/auth';

import { 
  BookOpenIcon, 
  SparklesIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

export default function StudentDashboard() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  const { data: loans = [], isLoading: isLoadingLoans } = useQuery({
    queryKey: ['my-loans', user?.userId],
    queryFn: () => getMyLoans(user?.userId),
    enabled: !!user?.userId,
  });

  const activeLoans = loans.filter(l => l.status === 'ACTIVE');

  const returnLevel = useMemo(() => {
    const returnedCount = loans.filter((l) => l.status === 'RETURNED').length;
    const onTime = profile?.student?.onTimeDeliveriesCount ?? 0;
    if (returnedCount === 0) return 100;
    return Math.min(100, Math.round((onTime / returnedCount) * 100));
  }, [loans, profile?.student?.onTimeDeliveriesCount]);

  const missedCount = profile?.student?.missedReservationsCount ?? 0;

  const isBlocked =
    (profile?.loanBlockUntil && new Date(profile.loanBlockUntil) > new Date()) ||
    (profile?.systemBlockUntil && new Date(profile.systemBlockUntil) > new Date());

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoadingLoans) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">¡Hola, {user?.userData?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-400 mt-2 font-medium">¿Qué aventura literaria iniciaremos hoy?</p>
        </div>
        
        <Link 
            to="/explore"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span>Explorar Libros</span>
        </Link>
      </div>

      {missedCount === 1 && !isBlocked && (
        <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
          <ExclamationTriangleIcon className="w-8 h-8 text-amber-400 shrink-0" />
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-300">Advertencia disciplinaria:</span> No recogiste una reserva a tiempo. Si acumulas más incumplimientos (3, 5 o 7), se aplicarán bloqueos temporales a préstamos y reservas.
          </p>
        </div>
      )}

      {isBlocked && (
        <div className="flex items-center gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl">
          <ShieldExclamationIcon className="w-8 h-8 text-rose-400 shrink-0" />
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-rose-300">Cuenta bloqueada:</span> No puedes realizar nuevos préstamos ni reservas
            {profile?.loanBlockUntil && new Date(profile.loanBlockUntil).getFullYear() !== 2099
              ? ` hasta el ${formatDate(profile.loanBlockUntil)}`
              : ''}
            . Regulariza tu situación en la biblioteca.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-[3rem] relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <SparklesIcon className="w-64 h-64 text-white" />
            </div>
            
            <div className="relative z-10 space-y-6 max-w-2xl">
              <h2 className="text-3xl font-black text-white leading-tight">Tu Biblioteca Personal</h2>
              <p className="text-slate-400 leading-relaxed">
                Gestiona tus lecturas actuales y reservas. Explora nuestro catálogo para descubrir nuevos títulos.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link to="/loans" className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                  <ClockIcon className="w-5 h-5" />
                  Ver Mis Préstamos
                </Link>
                <Link to="/reservations" className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                  <TicketIcon className="w-5 h-5" />
                  Ver Mis Reservas
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-blue-500" />
                Lecturas Actuales
              </h2>
              {activeLoans.length > 0 && (
                <Link to="/loans" className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">
                  Ver todo
                </Link>
              )}
            </div>

            {activeLoans.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-[2.5rem] p-12 text-center">
                 <p className="text-slate-500 font-medium italic">No tienes préstamos activos en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLoans.slice(0, 2).map(loan => (
                  <div key={loan.loanId} className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-blue-500/30 transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{loan.copy?.barcode}</p>
                      <h3 className="text-white font-bold line-clamp-1">{loan.copy?.book?.title}</h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Devolución:</span>
                      <span className="text-xs font-black text-blue-400">{new Date(loan.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 mx-auto mb-4">
                    <BookOpenIcon className="w-8 h-8" />
                </div>
                <p className="text-3xl font-black text-white">{activeLoans.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Libros en Posesión</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                </div>
                <p className="text-3xl font-black text-amber-400">{missedCount}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Veces Escapadas</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-teal-500"></div>
                <p className="text-3xl font-black text-emerald-400">{returnLevel}%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Nivel de Devolución</p>
                <p className="text-[10px] text-slate-600 mt-4 leading-tight italic">
                  {returnLevel >= 80
                    ? '¡Excelente! Sueles devolver tus libros a tiempo.'
                    : returnLevel >= 50
                      ? 'Buen progreso. Intenta devolver siempre a tiempo.'
                      : 'Mejora tu puntualidad para evitar sanciones.'}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
