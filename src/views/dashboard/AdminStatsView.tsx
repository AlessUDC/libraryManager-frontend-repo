import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../api/stats';
import { 
  UsersIcon, 
  BookOpenIcon, 
  HashtagIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ShieldCheckIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

export default function AdminStatsView() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000 // Refetch every 30s
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isError) return (
    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-red-500 font-bold">
      Error al cargar las estadísticas del sistema.
    </div>
  );

  const statCards = [
    {
      title: 'Usuarios Activos',
      value: stats?.users.active,
      total: stats?.users.total,
      icon: UsersIcon,
      color: 'blue',
      subtitle: `${stats?.users.inactive} inactivos`
    },
    {
      title: 'Títulos Registrados',
      value: stats?.library.totalTitles,
      icon: BookOpenIcon,
      color: 'indigo',
      subtitle: `${stats?.library.categories} categorías`
    },
    {
      title: 'Ejemplares Físicos',
      value: stats?.library.totalCopies,
      icon: HashtagIcon,
      color: 'emerald',
      subtitle: `${stats?.library.availableCopies} disponibles`
    },
    {
      title: 'Disponibilidad Global',
      value: `${Math.round(((stats?.library.availableCopies || 0) / (stats?.library.totalCopies || 1)) * 100)}%`,
      icon: ChartBarIcon,
      color: 'purple',
      subtitle: 'En estanterías'
    }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Dashboard del Sistema</h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400" />
            Resumen operativo y métricas de la biblioteca en tiempo real
          </p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4">
            <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado del Servidor</p>
                <p className="text-sm font-bold text-emerald-400">Operativo Online</p>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
            
            <div className="relative z-10 space-y-6">
              <div className={`w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="w-7 h-7" />
              </div>
              
              <div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">{stat.title}</p>
              </div>
              
              <div className="pt-4 border-t border-slate-800/50">
                <p className="text-xs font-medium text-slate-400">{stat.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Books by Category List */}
        <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <CircleStackIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Top Categorías</h2>
          </div>
          
          <div className="space-y-4">
            {stats?.distribution.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm">
                    {i + 1}
                  </div>
                  <span className="text-sm font-bold text-slate-200">{cat.name}</span>
                </div>
                <span className="bg-slate-900 text-blue-400 px-3 py-1 rounded-lg text-xs font-black">
                  {cat.value} <span className="text-[10px] text-slate-500 uppercase ml-1">Libros</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health / Quick Info */}
        <div className="lg:col-span-2 bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-[3rem] relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-10 opacity-10">
                <ChartBarIcon className="w-64 h-64 text-white" />
            </div>
            
            <div className="relative z-10 space-y-6 max-w-lg">
                <h2 className="text-3xl font-black text-white leading-tight">Preparado para el módulo de Préstamos</h2>
                <p className="text-slate-400 leading-relaxed">
                    El sistema ha sido optimizado para la gestión masiva de ejemplares y la trazabilidad de inventario. El dashboard refleja ahora el estado real de la biblioteca para facilitar la toma de decisiones.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Base de Datos Sincronizada
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-500/20">
                        Autobarcodes Activo
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
