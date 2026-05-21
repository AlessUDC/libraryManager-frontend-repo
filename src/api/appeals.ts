import axios from './axios';
import type { User } from '../types/user';
import type { Fine } from './fines';
import type { Loan } from './loans';

export interface Sanction {
  sanctionId: string;
  userId: string;
  loanId: string;
  type: 'LEVE' | 'GRAVE' | 'MUY_GRAVE';
  status: 'PENDING' | 'APPLIED' | 'REDEEMED';
  createdAt: string;
  user?: User;
  loan?: Loan;
}

export interface Appeal {
  appealId: string;
  userId: string;
  fineId: string | null;
  sanctionId: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  resolverId: string | null;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  user?: User;
  fine?: Fine;
  sanction?: Sanction;
}

export const submitAppeal = async (payload: {
  fineId?: string;
  sanctionId?: string;
  reason: string;
}): Promise<Appeal> => {
  const { data } = await axios.post('/appeals', payload);
  return data;
};

export const getMyAppeals = async (): Promise<Appeal[]> => {
  const { data } = await axios.get('/appeals/my');
  return data;
};

export const getPendingAppeals = async (): Promise<Appeal[]> => {
  const { data } = await axios.get('/appeals/pending');
  return data;
};

export const resolveAppeal = async (
  appealId: string,
  payload: { status: 'APPROVED' | 'REJECTED'; resolution: string },
): Promise<Appeal> => {
  const { data } = await axios.patch(`/appeals/${appealId}/resolve`, payload);
  return data;
};
