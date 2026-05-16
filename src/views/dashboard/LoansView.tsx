import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoans, returnLoan } from '../../api/loans';
import { getAdminReservations } from '../../api/reservations';
import { 
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ArrowPathIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';
import LibraryTable from '../../components/library/LibraryTable';
import { toast } from 'react-toastify';
import type { Loan } from '../../api/loans';
import type { Reservation } from '../../api/reservations';
import ReturnLoanModal from '../../components/library/ReturnLoanModal';
import Pagination from '../../components/Pagination';

export default function LoansView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'LOANS' | 'RESERVATIONS'>('LOANS');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<Loan | null>(null);
  const itemsPerPage = 10;

  const { data: loans = [], isLoading: isLoadingLoans } = useQuery({
    queryKey: ['admin-loans'],
    queryFn: getLoans,
  });

  const { data: reservations = [], isLoading: isLoadingReservations } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: getAdminReservations,
    enabled: activeTab === 'RESERVATIONS'
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: { condition: string, observations?: string } }) => returnLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      toast.success('Libro devuelto correctamente');
      setIsReturnModalOpen(false);
      setSelectedLoanForReturn(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleReturnClick = (loan: Loan) => {
    setSelectedLoanForReturn(loan);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = (data: { condition: string, observations: string }) => {
    if (selectedLoanForReturn) {
      returnMutation.mutate({ id: selectedLoanForReturn.loanId, data });
    }
  };

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesSearch = 
        loan.user?.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.copy.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.copy.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || loan.user?.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || loan.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [loans, searchTerm, roleFilter, statusFilter]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch = 
        res.user?.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.copy.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.copy.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [reservations, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const active = loans.filter(l => l.status === 'ACTIVE').length;
    const overdue = loans.filter(l => {
        if (l.status !== 'ACTIVE') return false;
        return new Date(l.dueDate).getTime() < new Date().getTime();
    }).length;
    const returned = loans.filter(l => l.status === 'RETURNED').length;
    return { active, overdue, returned };
  }, [loans]);

  const currentData = activeTab === 'LOANS' ? filteredLoans : filteredReservations;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentData.slice(start, start + itemsPerPage);
  }, [currentData, currentPage]);

  const loanColumns = [
    {
      header: 'Usuario',
      render: (loan: Loan) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{loan.user?.userData.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{loan.user?.role}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Libro / Ejemplar',
      render: (loan: Loan) => (
        <div>
          <p className="text-sm font-bold text-white line-clamp-1">{loan.copy.book?.title}</p>
          <p className="text-[10px] text-slate-500 font-mono">{loan.copy.barcode}</p>
        </div>
      )
    },
    {
      header: 'Fechas',
      render: (loan: Loan) => (
        <div className="flex flex-col text-[11px]">
          <span className="text-slate-400">P: {new Date(loan.borrowDate).toLocaleDateString()}</span>
          <span className={`font-bold ${loan.status === 'ACTIVE' && new Date(loan.dueDate).getTime() < new Date().getTime() ? 'text-red-400' : 'text-blue-400'}`}>
            V: {new Date(loan.dueDate).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      header: 'Estado',
      render: (loan: Loan) => {
        const isOverdue = loan.status === 'ACTIVE' && new Date(loan.dueDate).getTime() < new Date().getTime();
        return (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            loan.status === 'RETURNED' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : isOverdue
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {loan.status === 'RETURNED' ? 'DEVUELTO' : isOverdue ? 'VENCIDO' : 'ACTIVO'}
          </span>
        );
      }
    }
  ];

  const reservationColumns = [
    {
      header: 'Usuario',
      render: (res: Reservation) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{res.user?.userData.name}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{res.user?.role}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Libro / Ejemplar',
      render: (res: Reservation) => (
        <div>
          <p className="text-sm font-bold text-white line-clamp-1">{res.copy.book.title}</p>
          <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{res.copy.barcode}</p>
        </div>
      )
    },
    {
        header: 'Tipo Préstamo',
        render: (res: Reservation) => (
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border w-fit ${
                res.requestedLoanType === 'HOME' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
                {res.requestedLoanType === 'HOME' ? 'DOMICILIO' : 'EN SALA'}
            </span>
            <span className="text-[9px] text-slate-500 font-bold italic">
                Duración: {res.reservationDurationMinutes} min
            </span>
          </div>
        )
      },
    {
      header: 'Token de Entrega',
      render: (res: Reservation) => (
        <div className="flex items-center gap-2">
            <TicketIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-lg font-black text-white tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                {res.token}
            </span>
        </div>
      )
    },
    {
      header: 'Expira',
      render: (res: Reservation) => (
        <div className="flex flex-col text-[11px]">
          <span className="text-slate-400">{new Date(res.expiresAt).toLocaleDateString()}</span>
          <span className="font-bold text-indigo-400">
            {new Date(res.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    }
  ];

  if (isLoadingLoans || (activeTab === 'RESERVATIONS' && isLoadingReservations)) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <ReturnLoanModal 
        isOpen={isReturnModalOpen}
        setIsOpen={setIsReturnModalOpen}
        loan={selectedLoanForReturn}
        onConfirm={handleConfirmReturn}
        isLoading={returnMutation.isPending}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Gestión de Biblioteca</h1>
          <p className="text-slate-400 mt-1">Supervisa préstamos activos y entregas de reservas</p>
        </div>
        
        <div className="flex gap-4">
             <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total en Circulación</p>
                    <p className="text-lg font-bold text-white">{stats.active}</p>
                </div>
                <BookOpenIcon className="w-8 h-8 text-blue-500 opacity-50" />
             </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => { setActiveTab('LOANS'); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'LOANS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
          }`}
        >
          <BookOpenIcon className="w-4 h-4" />
          Préstamos
        </button>
        <button
          onClick={() => { setActiveTab('RESERVATIONS'); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'RESERVATIONS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
          }`}
        >
          <TicketIcon className="w-4 h-4" />
          Reservas
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={`Buscar en ${activeTab === 'LOANS' ? 'préstamos' : 'reservas'}...`}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {activeTab === 'LOANS' && (
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-1">
                  <FunnelIcon className="w-4 h-4 text-slate-500" />
                  <select 
                      className="bg-transparent text-white text-xs font-bold focus:outline-hidden border-none cursor-pointer"
                      value={roleFilter}
                      onChange={(e) => {
                          setRoleFilter(e.target.value);
                          setCurrentPage(1);
                      }}
                  >
                      <option value="ALL">TODOS LOS ROLES</option>
                      <option value="STUDENT">ESTUDIANTES</option>
                      <option value="TEACHER">PROFESORES</option>
                  </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-1">
                  <select 
                      className="bg-transparent text-white text-xs font-bold focus:outline-hidden border-none cursor-pointer"
                      value={statusFilter}
                      onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                      }}
                  >
                      <option value="ALL">TODOS LOS ESTADOS</option>
                      <option value="ACTIVE">ACTIVOS</option>
                      <option value="RETURNED">DEVUELTOS</option>
                  </select>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <LibraryTable
            data={paginatedData as (Loan | Reservation)[]}
            columns={activeTab === 'LOANS' ? loanColumns as { header: string; render: (item: Loan | Reservation) => React.ReactNode }[] : reservationColumns as { header: string; render: (item: Loan | Reservation) => React.ReactNode }[]}
            emptyMessage={activeTab === 'LOANS' ? "No se encontraron préstamos" : "No hay reservas pendientes de entrega"}
            emptyIcon={activeTab === 'LOANS' ? BookOpenIcon : TicketIcon}
            renderActions={(item: Loan | Reservation) => activeTab === 'LOANS' ? (
              <div className="flex justify-end">
                {(item as Loan).status === 'ACTIVE' && (
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                        onClick={() => handleReturnClick(item as Loan)}
                    >
                        <ArrowPathIcon className="w-3.5 h-3.5" />
                        Devolver
                    </button>
                )}
              </div>
            ) : null}
          />

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
