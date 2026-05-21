import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile } from '../../api/auth';
import { getMyFines } from '../../api/fines';
import { getMyAppeals, submitAppeal } from '../../api/appeals';
import type { Fine } from '../../api/fines';
import type { Sanction } from '../../api/appeals';
import {
  BanknotesIcon,
  ShieldExclamationIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function FinesAndAppealsView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'fines' | 'appeals'>('fines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [appealTarget, setAppealTarget] = useState<{
    type: 'FINE' | 'SANCTION';
    id: string;
    description: string;
  } | null>(null);

  // Current user
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 1. Query dynamic user profile to check blocks in real-time
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  // 2. Query user fines
  const { data: fines = [], isLoading: isLoadingFines } = useQuery({
    queryKey: ['my-fines', user?.id],
    queryFn: () => getMyFines(user?.id),
    enabled: !!user?.id,
  });

  // 3. Query user appeals
  const { data: appeals = [], isLoading: isLoadingAppeals } = useQuery({
    queryKey: ['my-appeals'],
    queryFn: getMyAppeals,
  });

  // 4. Submit appeal mutation
  const submitAppealMutation = useMutation({
    mutationFn: submitAppeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appeals'] });
      queryClient.invalidateQueries({ queryKey: ['my-fines'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsModalOpen(false);
      setReason('');
      setAppealTarget(null);
    },
  });

  // Extracted active sanctions from fines/loans context
  // To keep it self-contained, we can find sanctions by inspecting all loans returned that had sanctions.
  // Wait, let's also look at the sanctions associated with the user.
  // Let's check: does the profile contain sanctions?
  // Let's verify by checking how sanctions are queried. The backend exposes `/appeals/my` and `/loans/fines/user/:id`.
  // Since we also want to display the user's sanctions, where can we get them?
  // In `profile`, let's see if user.sanctions is returned. Yes, in prisma we added relations.
  const sanctions: Sanction[] = profile?.sanctions || [];

  const handleOpenAppealModal = (
    type: 'FINE' | 'SANCTION',
    id: string,
    description: string,
  ) => {
    setAppealTarget({ type, id, description });
    setIsModalOpen(true);
  };

  const handleCloseAppealModal = () => {
    setIsModalOpen(false);
    setReason('');
    setAppealTarget(null);
  };

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealTarget || !reason.trim()) return;

    submitAppealMutation.mutate({
      fineId: appealTarget.type === 'FINE' ? appealTarget.id : undefined,
      sanctionId: appealTarget.type === 'SANCTION' ? appealTarget.id : undefined,
      reason: reason.trim(),
    });
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
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Multas y Apelaciones</h1>
          <p className="text-slate-400 mt-1">
            Consulta tus penalizaciones financieras/sanciones y apela aquellas que consideres injustas.
          </p>
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

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('fines')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'fines' ? 'text-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Multas y Sanciones</span>
          {activeTab === 'fines' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-md shadow-blue-500/50 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('appeals')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'appeals' ? 'text-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Mis Apelaciones ({appeals.length})</span>
          {activeTab === 'appeals' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-md shadow-blue-500/50 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'fines' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                {fines.map((fine: Fine) => {
                  const hasActiveAppeal = appeals.some(
                    (app) => app.fineId === fine.fineId && app.status === 'PENDING',
                  );

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

                      {fine.status === 'PENDING' && (
                        <div className="flex justify-end pt-2 border-t border-slate-800/60">
                          <button
                            disabled={hasActiveAppeal}
                            onClick={() =>
                              handleOpenAppealModal(
                                'FINE',
                                fine.fineId,
                                `Multa por $${fine.amount.toFixed(2)} - ${
                                  fine.loan?.copy?.book?.title || fine.description
                                }`,
                              )
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border active:scale-95
                              ${
                                hasActiveAppeal
                                  ? 'bg-slate-800/40 border-slate-700/30 text-slate-500 cursor-not-allowed'
                                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                              }
                            `}
                          >
                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                            <span>{hasActiveAppeal ? 'Apelación en Trámite' : 'Apelar Multa'}</span>
                          </button>
                        </div>
                      )}
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
                {sanctions.map((sanction: Sanction) => {
                  const hasActiveAppeal = appeals.some(
                    (app) => app.sanctionId === sanction.sanctionId && app.status === 'PENDING',
                  );

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

                      {(sanction.status === 'PENDING' || sanction.status === 'APPLIED') && (
                        <div className="flex justify-end pt-2 border-t border-slate-800/60">
                          <button
                            disabled={hasActiveAppeal}
                            onClick={() =>
                              handleOpenAppealModal(
                                'SANCTION',
                                sanction.sanctionId,
                                `Sanción ${sanction.type} - ${
                                  sanction.loan?.copy?.book?.title || 'Préstamo Vencido'
                                }`,
                              )
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border active:scale-95
                              ${
                                hasActiveAppeal
                                  ? 'bg-slate-800/40 border-slate-700/30 text-slate-500 cursor-not-allowed'
                                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                              }
                            `}
                          >
                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                            <span>
                              {hasActiveAppeal ? 'Apelación en Trámite' : 'Apelar Sanción'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mis Apelaciones Panel */
        <div className="space-y-6 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
          <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
            <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-blue-400" />
            Tus Apelaciones Realizadas
          </h2>

          {isLoadingAppeals ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : appeals.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
              <p className="text-slate-500 italic font-medium">No has enviado ninguna apelación.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {appeals.map((appeal) => (
                <div
                  key={appeal.appealId}
                  className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all flex flex-col gap-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Apelación para:
                      </span>
                      <h4 className="text-white font-bold leading-tight mt-0.5">
                        {appeal.fineId
                          ? `Multa de $${appeal.fine?.amount.toFixed(2)} - ${
                              appeal.fine?.loan?.copy?.book?.title || 'Libro devuelto'
                            }`
                          : `Sanción ${appeal.sanction?.type} - ${
                              appeal.sanction?.loan?.copy?.book?.title || 'Retraso de préstamo'
                            }`}
                      </h4>
                      <p className="text-slate-500 text-[10px] mt-1">
                        Enviada: {formatDate(appeal.createdAt)}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border flex items-center gap-2
                        ${
                          appeal.status === 'APPROVED'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5'
                            : appeal.status === 'REJECTED'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }
                      `}>
                        {appeal.status === 'APPROVED' && <CheckCircleIcon className="w-4 h-4" />}
                        {appeal.status === 'REJECTED' && <ExclamationCircleIcon className="w-4 h-4" />}
                        {appeal.status === 'PENDING' && <ClockIcon className="w-4 h-4" />}
                        <span>
                          {appeal.status === 'APPROVED'
                            ? 'Aprobada'
                            : appeal.status === 'REJECTED'
                            ? 'Rechazada'
                            : 'Pendiente'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu Justificación:</p>
                    <p className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {appeal.reason}
                    </p>
                  </div>

                  {appeal.status !== 'PENDING' && appeal.resolution && (
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-850 space-y-2">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-blue-400" />
                        <p className="text-xs font-black text-white uppercase tracking-wider">
                          Respuesta de Biblioteca:
                        </p>
                      </div>
                      <p className="text-slate-300 text-sm italic leading-relaxed whitespace-pre-wrap pl-6">
                        "{appeal.resolution}"
                      </p>
                      <p className="text-slate-500 text-[10px] pl-6">
                        Resuelta el {formatDate(appeal.resolvedAt)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appeal Form Modal */}
      {isModalOpen && appealTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-8">
              <button
                onClick={handleCloseAppealModal}
                className="text-slate-400 hover:text-white transition-all bg-slate-800/40 p-2 rounded-xl"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 pr-10">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                Formulario de Apelación
              </span>
              <h3 className="text-2xl font-black text-white leading-tight">Apelar Penalización</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Ingresa una justificación clara y detallada explicando las razones excepcionales de tu retraso.
              </p>
            </div>

            {/* Target Summary Card */}
            <div className="bg-slate-950/55 border border-slate-800 p-4 rounded-2xl mt-6 space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Elemento a Apelar:
              </span>
              <p className="text-white text-sm font-bold leading-normal">
                {appealTarget.description}
              </p>
            </div>

            <form onSubmit={handleSubmitAppeal} className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-350 uppercase tracking-wider">
                  Justificación / Motivo:
                </label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detalla aquí los motivos de fuerza mayor que causaron el retraso o daño (ej: enfermedad, problemas técnicos, etc.). Adjunta contexto en tu explicación."
                  className="w-full bg-slate-950 border border-slate-850 p-4 rounded-2xl text-slate-300 placeholder-slate-650 text-sm focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed transition-all"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAppealModal}
                  className="flex-1 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-800 transition-all text-center active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitAppealMutation.isPending || !reason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/40 disabled:text-blue-400 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-900/25"
                >
                  {submitAppealMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4 shrink-0" />
                      <span>Enviar Apelación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
