import { useState, useMemo } from 'react';
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
        <div className="relative border-l-2 border-slate-800/80 ml-4 md:ml-8 space-y-12 pb-10 pt-4">
          {filteredLogs.map((log: AuditLog) => {
            const isExpanded = expandedLogId === log.auditLogId;

            // Extract the background color from the action style to use for the dot
            const bgClass = getActionStyle(log.action).split(' ').find(c => c.startsWith('bg-'))?.replace('/10', '') || 'bg-slate-500';

            return (
              <div key={log.auditLogId} className="relative pl-8 md:pl-12 group">
                {/* Timeline dot */}
                <div className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full border-4 border-[#0F1523] ${bgClass} shadow-lg ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all`}></div>

                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700 transition-all shadow-xl">
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider ${getActionStyle(log.action)}`}>
                        {log.action}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                        <span className="text-sm font-black text-white uppercase tracking-wide">{log.entity}</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-500 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    <p className="text-xs font-medium text-slate-400">
                      <strong className="text-slate-300 font-bold uppercase tracking-widest text-[10px] block mb-1">Responsable:</strong>
                      <span className="bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50 inline-block">{log.performedBy}</span>
                    </p>
                    <button
                      onClick={() => toggleExpandLog(log.auditLogId)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 border border-slate-700 shadow-sm"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {isExpanded ? 'Cerrar' : 'Detalles'}
                      </span>
                      {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable details row */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4 animate-in fade-in zoom-in-95 duration-300 origin-top">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">
                          Payload JSON:
                        </span>
                      </div>
                      <pre className="bg-[#0a0e17] border border-slate-800/50 p-6 rounded-3xl text-blue-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner w-full">
                        {formatJson(log.details)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
