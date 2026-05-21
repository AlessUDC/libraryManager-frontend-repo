import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingAppeals, resolveAppeal } from '../../api/appeals';
import type { Appeal } from '../../api/appeals';
import {
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function ManageAppealsView() {
  const queryClient = useQueryClient();
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Query all pending appeals
  const { data: pendingAppeals = [], isLoading } = useQuery({
    queryKey: ['pending-appeals'],
    queryFn: getPendingAppeals,
  });

  // 2. Mutation for resolving appeal
  const resolveMutation = useMutation({
    mutationFn: ({ appealId, status, resolution }: { appealId: string; status: 'APPROVED' | 'REJECTED'; resolution: string }) =>
      resolveAppeal(appealId, { status, resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-appeals'] });
      setIsModalOpen(false);
      setSelectedAppeal(null);
      setResolutionText('');
    },
  });

  const handleOpenResolveModal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setIsModalOpen(true);
  };

  const handleCloseResolveModal = () => {
    setIsModalOpen(false);
    setSelectedAppeal(null);
    setResolutionText('');
  };

  const handleResolve = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedAppeal || !resolutionText.trim()) return;

    resolveMutation.mutate({
      appealId: selectedAppeal.appealId,
      status,
      resolution: resolutionText.trim(),
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

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Gestionar Apelaciones</h1>
        <p className="text-slate-400 mt-1">
          Evalúa y resuelve las apelaciones enviadas por los estudiantes relativas a multas y sanciones disciplinarias.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : pendingAppeals.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-[2.5rem] p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-850 flex items-center justify-center mx-auto text-slate-500 mb-4 border border-slate-800">
            <ClockIcon className="w-8 h-8" />
          </div>
          <h3 className="text-white font-bold text-lg">No hay apelaciones pendientes</h3>
          <p className="text-slate-550 mt-1 max-w-sm mx-auto text-sm leading-relaxed">
            Todas las solicitudes de exención financiera y disciplinaria se encuentran procesadas al día.
          </p>
        </div>
      ) : (
        /* Pending Appeals List */
        <div className="grid grid-cols-1 gap-6">
          {pendingAppeals.map((appeal: Appeal) => (
            <div
              key={appeal.appealId}
              className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="flex-1 space-y-4">
                {/* Student info */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-black bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">
                    Estudiante
                  </span>
                  <span className="text-white font-black text-sm">
                    {appeal.user?.userData?.name} {appeal.user?.userData?.paternalSurname} {appeal.user?.userData?.maternalSurname}
                  </span>
                  <span className="text-slate-500 font-medium text-xs">
                    (Cód: {appeal.user?.code})
                  </span>
                </div>

                {/* Fine/Sanction info */}
                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Detalle del Recurso Apelado:
                  </span>
                  {appeal.fineId ? (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="text-white font-bold text-sm leading-tight">
                          Multa por Préstamo Vencido
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Libro: {appeal.fine?.loan?.copy?.book?.title || appeal.fine?.description}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Código Barras: {appeal.fine?.loan?.copy?.barcode} | Registrada: {formatDate(appeal.fine?.createdAt)}
                        </p>
                      </div>
                      <span className="text-lg font-black text-white bg-blue-500/10 border border-blue-500/25 px-3 py-1 rounded-xl shrink-0">
                        ${appeal.fine?.amount.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-white font-bold text-sm leading-tight flex items-center gap-2">
                        Sanción Disciplinaria Activa
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border
                          ${
                            appeal.sanction?.type === 'MUY_GRAVE'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-440'
                          }
                        `}>
                          {appeal.sanction?.type}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Detalle: Retraso en devolución de copia {appeal.sanction?.loan?.copy?.barcode}
                      </p>
                      <p className="text-[10px] text-slate-550 mt-0.5">
                        Libro: {appeal.sanction?.loan?.copy?.book?.title} | Registrada: {formatDate(appeal.sanction?.createdAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Justificación del Estudiante:
                  </span>
                  <p className="text-slate-350 text-sm leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-850/60 italic">
                    "{appeal.reason}"
                  </p>
                </div>

                <p className="text-[10px] text-slate-550">
                  Apelación enviada: {formatDate(appeal.createdAt)}
                </p>
              </div>

              {/* Action Side */}
              <div className="flex md:flex-col justify-end items-end shrink-0 gap-3 border-t md:border-t-0 md:border-l border-slate-800/60 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={() => handleOpenResolveModal(appeal)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-900/20 w-full md:w-auto justify-center"
                >
                  <ChatBubbleBottomCenterTextIcon className="w-4 h-4 shrink-0" />
                  <span>Evaluar Recurso</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Dialog Modal */}
      {isModalOpen && selectedAppeal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 right-0 p-8">
              <button
                onClick={handleCloseResolveModal}
                className="text-slate-400 hover:text-white transition-all bg-slate-800/40 p-2 rounded-xl"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 pr-10 border-b border-slate-800/60 pb-4">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                Resolución de Recurso
              </span>
              <h3 className="text-xl font-black text-white">Dictamen de Apelación</h3>
              <p className="text-xs text-slate-440 mt-1">
                Evaluando apelación del estudiante{' '}
                <strong className="text-white font-bold">
                  {selectedAppeal.user?.userData?.name} {selectedAppeal.user?.userData?.paternalSurname}
                </strong>{' '}
                (Cód: {selectedAppeal.user?.code})
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 py-6 pr-2 scrollbar-thin">
              {/* Context Panel */}
              <div className="bg-slate-950/50 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div>
                  <span className="text-[9px] font-black text-slate-550 uppercase tracking-widest">
                    Motivo / Penalización de Origen:
                  </span>
                  <p className="text-white font-bold text-sm mt-0.5">
                    {selectedAppeal.fineId
                      ? `Multa por $${selectedAppeal.fine?.amount.toFixed(2)} — ${
                          selectedAppeal.fine?.loan?.copy?.book?.title || 'Libro devuelto'
                        }`
                      : `Sanción Disciplinaria ${selectedAppeal.sanction?.type} — ${selectedAppeal.sanction?.loan?.copy?.book?.title}`}
                  </p>
                </div>
                <div className="border-t border-slate-900/60 pt-3">
                  <span className="text-[9px] font-black text-slate-550 uppercase tracking-widest">
                    Justificación Presentada:
                  </span>
                  <p className="text-slate-300 text-sm leading-relaxed italic mt-1 bg-slate-900/40 p-4 rounded-xl border border-slate-850/50">
                    "{selectedAppeal.reason}"
                  </p>
                </div>
              </div>

              {/* Resolution Form */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4 text-blue-400" />
                  Observaciones / Fundamentos del Dictamen:
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Detalla aquí los fundamentos formales para aprobar o rechazar la apelación. (Ej: Se exime del cobro debido a la constancia médica verificada de urgencia familiar, o Se rechaza por no presentar atenuantes de fuerza mayor)."
                  className="w-full bg-slate-950 border border-slate-850 p-4 rounded-2xl text-slate-300 placeholder-slate-650 text-sm focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed transition-all"
                />
              </div>
            </div>

            {/* Decision Actions */}
            <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleCloseResolveModal}
                className="bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-800 transition-all text-center active:scale-95"
              >
                Cancelar
              </button>

              <div className="flex-1 flex gap-4">
                <button
                  type="button"
                  disabled={resolveMutation.isPending || !resolutionText.trim()}
                  onClick={() => handleResolve('REJECTED')}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/25 text-rose-450 hover:text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                >
                  <HandThumbDownIcon className="w-4 h-4 shrink-0" />
                  <span>Rechazar Recurso</span>
                </button>

                <button
                  type="button"
                  disabled={resolveMutation.isPending || !resolutionText.trim()}
                  onClick={() => handleResolve('APPROVED')}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/35 disabled:text-emerald-400 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                >
                  <HandThumbUpIcon className="w-4 h-4 shrink-0" />
                  <span>Aprobar y Anular</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
