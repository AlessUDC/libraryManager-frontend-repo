import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation, redeemReservation } from '../../api/reservations';
import { TicketIcon, CheckCircleIcon, TrashIcon, ExclamationCircleIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState, useMemo, useEffect } from 'react';
import LibraryTable from '../../components/library/LibraryTable';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import type { Reservation } from '../../api/reservations';

export default function MyReservationsView() {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: getMyReservations,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.some((r) => r.status === 'PENDING')) return 10000;
      return false;
    },
  });

  const hasClientExpired = useMemo(
    () =>
      reservations.some(
        (r) => r.status === 'PENDING' && new Date(r.expiresAt) < now,
      ),
    [reservations, now],
  );

  useEffect(() => {
    if (hasClientExpired) {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  }, [hasClientExpired, queryClient]);

  const [tokens, setTokens] = useState<Record<string, string>>({});

  const cancelMutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['copies'] });
      toast.success('Reserva cancelada correctamente');
    },
    onError: (error: Error) => {
      const message = isAxiosError(error) ? error.response?.data?.message : error.message;
      toast.error(message || 'Error al cancelar la reserva');
    }
  });

  const redeemMutation = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => redeemReservation(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
      queryClient.invalidateQueries({ queryKey: ['copies'] });
      toast.success('¡Préstamo formalizado correctamente!');
    },
    onError: (error: Error) => {
      const message = isAxiosError(error) ? error.response?.data?.message : error.message;
      toast.error(message || 'Error al validar el token');
    }
  });

  const isExpiredPending = (res: Reservation) =>
    res.status === 'PENDING' && new Date(res.expiresAt) < now;

  const getEffectiveStatus = (res: Reservation): Reservation['status'] =>
    isExpiredPending(res) ? 'EXPIRED' : res.status;

  const handleRedeem = (id: string) => {
    const token = tokens[id];
    if (!token || token.length !== 6) {
      toast.warning('Ingresa el código de 6 dígitos');
      return;
    }
    redeemMutation.mutate({ id, token });
  };

  const handleCancel = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      cancelMutation.mutate(id);
    }
  };

  const getStatusStyle = (status: Reservation['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'FULFILLED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'EXPIRED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: Reservation['status']) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'FULFILLED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      case 'EXPIRED': return 'Expirado';
      default: return status;
    }
  };

  const columns = [
    {
      header: 'Libro / Ejemplar',
      render: (res: Reservation) => (
        <div>
          <p className="font-bold text-white leading-tight mb-1">{res.copy.book.title}</p>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{res.copy.barcode}</p>
        </div>
      )
    },
    {
      header: 'Tipo',
      render: (res: Reservation) => (
        <span className="text-xs font-bold text-slate-400">
          {res.requestedLoanType === 'HOME' ? 'A Domicilio' : 'En Sala'}
        </span>
      )
    },
    {
      header: 'Expira / Entregado',
      render: (res: Reservation) => {
        const effective = getEffectiveStatus(res);
        return (
          <div className="text-[11px]">
            {effective === 'PENDING' ? (
              <>
                <p className="text-slate-400">Vence:</p>
                <p className="font-bold text-amber-400">
                  {new Date(res.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </>
            ) : effective === 'FULFILLED' ? (
              <p className="text-emerald-400 font-bold">Entregado</p>
            ) : effective === 'EXPIRED' ? (
              <p className="text-amber-400 font-bold">Expirado</p>
            ) : (
              <p className="text-slate-600">-</p>
            )}
          </div>
        );
      }
    },
    {
      header: 'Estado',
      render: (res: Reservation) => {
        const effective = getEffectiveStatus(res);
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(effective)}`}>
            {getStatusLabel(effective)}
          </span>
        );
      }
    }
  ];

  const stats = useMemo(() => {
    const pending = reservations.filter((r) => getEffectiveStatus(r) === 'PENDING').length;
    const fulfilled = reservations.filter((r) => getEffectiveStatus(r) === 'FULFILLED').length;
    const expired = reservations.filter((r) => getEffectiveStatus(r) === 'EXPIRED').length;
    return { pending, fulfilled, expired };
  }, [reservations, now]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Mis Reservas</h1>
          <p className="text-slate-400 mt-1">Sigue el estado de tus reservas y entregas</p>
        </div>
        <button 
          onClick={() => window.location.href = '/explore'}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 whitespace-nowrap"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          Reservar Nuevo Libro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-4xl p-6 flex items-center gap-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <TicketIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-black text-white">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-4xl p-6 flex items-center gap-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recogidas</p>
            <p className="text-3xl font-black text-white">{stats.fulfilled}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-4xl p-6 flex items-center gap-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <ExclamationCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Expiradas</p>
            <p className="text-3xl font-black text-white">{stats.expired}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
          <ExclamationCircleIcon className="w-8 h-8 text-blue-400 shrink-0" />
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-white">¡Recordatorio importante!</span> Debes acudir a la biblioteca antes del tiempo de expiración para recoger tus libros reservados. Si no lo haces, la reserva se cancelará automáticamente y podrías recibir sanciones disciplinarias.
          </p>
        </div>

        <LibraryTable 
          data={reservations}
          columns={columns}
          idExtractor={(res) => res.reservationId}
          emptyMessage="No tienes reservas registradas"
          emptyIcon={TicketIcon}
          renderActions={(res) => {
            const effective = getEffectiveStatus(res);
            if (effective !== 'PENDING') return null;
            return (
              <div className="flex items-center gap-3 justify-end">
                <div className="relative w-32">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Token 6-dig"
                    value={tokens[res.reservationId] || ''}
                    onChange={(e) => setTokens({...tokens, [res.reservationId]: e.target.value.replace(/\D/g, '')})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-center text-xs font-mono tracking-widest text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleRedeem(res.reservationId)}
                  disabled={redeemMutation.isPending}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
                  title="Canjear Reserva"
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleCancel(res.reservationId)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  title="Cancelar Reserva"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
