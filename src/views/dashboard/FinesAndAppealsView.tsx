import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getUserProfile } from '../../api/auth';
import { getMyFines } from '../../api/fines';
import type { Fine } from '../../api/fines';
import type { Sanction } from '../../api/appeals';
import {
  BanknotesIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { parseStoredUser, getStoredUserId } from '../../utils/auth';

export default function FinesAndAppealsView() {
  const user = parseStoredUser();
  const userId = getStoredUserId(user);

  const [searchTerm, setSearchTerm] = useState('');

  // 1. Query dynamic user profile to check blocks in real-time
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  // 2. Query user fines
  const { data: fines = [], isLoading: isLoadingFines } = useQuery({
    queryKey: ['my-fines', userId],
    queryFn: () => getMyFines(userId!),
    enabled: !!userId,
  });

  const sanctions: Sanction[] = profile?.sanctions || [];

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

  const isBlocked =
    (profile?.loanBlockUntil && new Date(profile.loanBlockUntil) > new Date()) ||
    (profile?.systemBlockUntil && new Date(profile.systemBlockUntil) > new Date());

  const blockType = (() => {
    if (profile?.systemBlockUntil && new Date(profile.systemBlockUntil) > new Date()) {
      return 'SYSTEM';
    }
    if (profile?.loanBlockUntil && new Date(profile.loanBlockUntil) > new Date()) {
      const isPreventive = new Date(profile.loanBlockUntil).getFullYear() === 2099;
      return isPreventive ? 'PREVENTIVE' : 'DISCIPLINARY';
    }
    return null;
  })();

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Multas y Sanciones</h1>
          <p className="text-slate-400 mt-1">
            Consulta tus penalizaciones financieras y sanciones disciplinarias.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por libro o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* Real-time Block Notifications */}
      {isBlocked && blockType && (
        <div className={`relative overflow-hidden rounded-3xl border backdrop-blur-md transition-all shadow-lg animate-pulse duration-1000 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 z-10
          ${
            blockType === 'PREVENTIVE'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }
        `}>
          <div className={`p-4 rounded-2xl flex items-center justify-center border
            ${
              blockType === 'PREVENTIVE'
                ? 'bg-amber-500/15 border-amber-500/30'
                : 'bg-rose-500/15 border-rose-500/30'
            }
          `}>
            <ShieldExclamationIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-black uppercase tracking-wider">
              {blockType === 'PREVENTIVE' ? 'Bloqueo Preventivo Activo' : 'Bloqueo Disciplinario Activo'}
            </h3>
            <p className="text-sm font-medium opacity-90 leading-relaxed">
              {blockType === 'PREVENTIVE'
                ? 'Tienes libros vencidos pendientes de devolución. Tus privilegios para realizar nuevos préstamos o reservas se suspenden temporalmente hasta que regularices tu situación.'
                : `Se te ha suspendido temporalmente el derecho de realizar préstamos o reservas hasta el ${formatDate(
                    profile.loanBlockUntil,
                  )} debido a reincidencia o acumulación de sanciones graves.`}
            </p>
          </div>
        </div>
      )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Fines Panel */}
          <div className="space-y-6 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <BanknotesIcon className="w-6 h-6 text-blue-400" />
              Tus Multas
            </h2>

            {isLoadingFines ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : fines.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
                <p className="text-slate-500 italic font-medium">No tienes multas registradas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fines
                  .filter((fine: Fine) => {
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return fine.loan?.copy?.book?.title?.toLowerCase().includes(search) || fine.description?.toLowerCase().includes(search);
                  })
                  .map((fine: Fine) => {
                  return (
                    <div
                      key={fine.fineId}
                      className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-slate-700 transition-all gap-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            {fine.loan?.copy?.barcode || 'Multa General'}
                          </p>
                          <h4 className="text-white font-bold leading-tight">
                            {fine.loan?.copy?.book?.title || fine.description}
                          </h4>
                          <p className="text-slate-400 text-xs mt-2 line-clamp-2">
                            {fine.description}
                          </p>
                          <p className="text-slate-500 text-[10px] mt-1">
                            Registrada: {formatDate(fine.createdAt)}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2 shrink-0">
                          <span className="text-xl font-black text-white bg-blue-500/10 px-3 py-1.5 rounded-2xl border border-blue-500/20">
                            ${fine.amount.toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border
                            ${
                              fine.status === 'PAID'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : fine.status === 'PENDING'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                            }
                          `}>
                            {fine.status === 'PAID'
                              ? 'Pagada'
                              : fine.status === 'PENDING'
                              ? 'Pendiente'
                              : 'Anulada'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sanctions Panel */}
          <div className="space-y-6 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <ShieldExclamationIcon className="w-6 h-6 text-rose-400" />
              Tus Sanciones
            </h2>

            {isLoadingFines ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : sanctions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
                <p className="text-slate-500 italic font-medium">No tienes sanciones aplicadas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sanctions
                  .filter((sanction: Sanction) => {
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return sanction.loan?.copy?.book?.title?.toLowerCase().includes(search) || sanction.type?.toLowerCase().includes(search);
                  })
                  .map((sanction: Sanction) => {
                  return (
                    <div
                      key={sanction.sanctionId}
                      className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-slate-700 transition-all gap-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            {sanction.loan?.copy?.barcode || 'Sanción General'}
                          </p>
                          <h4 className="text-white font-bold leading-tight">
                            {sanction.loan?.copy?.book?.title || 'Sanción por Retraso'}
                          </h4>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border
                              ${
                                sanction.type === 'MUY_GRAVE'
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                  : sanction.type === 'GRAVE'
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              }
                            `}>
                              Tipo: {sanction.type}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border
                              ${
                                sanction.status === 'REDEEMED'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : sanction.status === 'APPLIED'
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }
                            `}>
                              {sanction.status === 'REDEEMED'
                                ? 'Redimida / Exenta'
                                : sanction.status === 'APPLIED'
                                ? 'Aplicada (Bloqueo)'
                                : 'Acumulable / Pendiente'}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[10px] mt-3">
                            Fecha: {formatDate(sanction.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
