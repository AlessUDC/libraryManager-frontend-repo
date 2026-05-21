import axios from './axios';

export interface AuditLog {
  auditLogId: string;
  action: string;
  entity: string;
  entityId: string | null;
  performedBy: string;
  details: string | null; // JSON string
  createdAt: string;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data } = await axios.get('/audit-logs');
  return data;
};
