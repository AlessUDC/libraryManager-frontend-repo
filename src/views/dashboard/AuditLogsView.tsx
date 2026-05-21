import { useState, useMemo, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../../api/audit';
import type { AuditLog } from '../../api/audit';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function AuditLogsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // 1. Query audit logs from backend
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: getAuditLogs,
  });

  // Unique actions list for filtering dropdown
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach((log) => {
      if (log.action) actions.add(log.action);
    });
    return Array.from(actions).sort();
  }, [logs]);

  // Filtered logs list
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = selectedActionFilter === '' || log.action === selectedActionFilter;

      const detailsStr = log.details ? log.details.toLowerCase() : '';
      const actionStr = log.action ? log.action.toLowerCase() : '';
      const entityStr = log.entity ? log.entity.toLowerCase() : '';
      const entityIdStr = log.entityId ? log.entityId.toLowerCase() : '';
      const userStr = log.performedBy ? log.performedBy.toLowerCase() : '';
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        search === '' ||
        actionStr.includes(search) ||
        entityStr.includes(search) ||
        entityIdStr.includes(search) ||
        userStr.includes(search) ||
        detailsStr.includes(search);

      return matchesAction && matchesSearch;
    });
  }, [logs, searchTerm, selectedActionFilter]);

  const toggleExpandLog = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'CREATE_LOAN':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'RETURN_LOAN':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'PAY_FINE':
        return 'bg-violet-500/10 border-violet-500/20 text-violet-400';
      case 'ANNUL_FINE':
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
      case 'SUBMIT_APPEAL':
        return 'bg-pink-500/10 border-pink-500/20 text-pink-400';
      case 'RESOLVE_APPEAL':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'REFUND_DEPOSIT_AUTOMATIC':
        return 'bg-teal-500/10 border-teal-500/20 text-teal-400';
      case 'UPDATE_BLOCKS':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default:
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatJson = (jsonStr: string | null) => {
    if (!jsonStr) return 'Sin detalles adicionales.';
    try {
      const parsed = JSON.parse(jsonStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonStr;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
          Auditoría del Sistema
        </h1>
        <p className="text-slate-400 mt-1">
          Historial completo de acciones administrativas, transacciones de multas, resoluciones de apelaciones y actualizaciones disciplinarias.
        </p>
      </div>

      {/* Stats Counter */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl max-w-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
          <ClockIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total de Eventos</p>
          <p className="text-2xl font-black text-white">{filteredLogs.length}</p>
        </div>
      </div>

      {/* Filtering Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/30 p-4 border border-slate-855 rounded-3xl">
        {/* Search text input */}
        <div className="flex-1 relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-4 w-5 h-5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID, usuario, detalles JSON, acción..."
            className="w-full bg-slate-950/85 border border-slate-850 pl-12 pr-4 py-3 rounded-2xl text-slate-350 text-sm focus:outline-none focus:border-blue-500/40 transition-all placeholder-slate-600"
          />
        </div>

        {/* Action filter select */}
        <div className="w-full md:w-64 shrink-0">
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="w-full bg-slate-950/85 border border-slate-8-50 p-3 rounded-2xl text-slate-350 text-sm focus:outline-none focus:border-blue-500/40 transition-all"
          >
            <option value="">Todas las Acciones</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-[2.5rem] p-16 text-center">
          <p className="text-slate-500 italic font-medium">No se encontraron registros de auditoría.</p>
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-850 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] font-black text-slate-450 uppercase tracking-widest">
                  <th className="py-4 px-6">Acción</th>
                  <th className="py-4 px-6">Entidad</th>
                  <th className="py-4 px-6">ID de Entidad</th>
                  <th className="py-4 px-6">Ejecutado Por</th>
                  <th className="py-4 px-6">Fecha y Hora</th>
                  <th className="py-4 px-6 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {filteredLogs.map((log: AuditLog) => {
                  const isExpanded = expandedLogId === log.auditLogId;

                  return (
                    <Fragment key={log.auditLogId}>
                      {/* Standard row */}
                      <tr className="hover:bg-slate-900/20 transition-all text-xs font-semibold text-slate-350 align-middle">
                        <td className="py-4 px-6 shrink-0">
                          <span className={`px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider ${getActionStyle(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-white uppercase">{log.entity}</td>
                        <td className="py-4 px-6 text-slate-500 font-mono text-[10px]">{log.entityId || '—'}</td>
                        <td className="py-4 px-6 text-slate-400 font-mono text-[10px]">{log.performedBy}</td>
                        <td className="py-4 px-6 text-slate-450">{formatDate(log.createdAt)}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => toggleExpandLog(log.auditLogId)}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded-xl transition-all active:scale-95 inline-flex items-center gap-1.5 border border-slate-800"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUpIcon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1">Ocultar</span>
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1">Expandir</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable details row */}
                      {isExpanded && (
                        <tr className="bg-slate-950/45 text-xs">
                          <td colSpan={6} className="py-5 px-8 border-y border-slate-800/80">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                  Carga de Datos Completa (JSON Payload):
                                </span>
                              </div>
                              <pre className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl text-blue-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner max-w-full">
                                {formatJson(log.details)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
