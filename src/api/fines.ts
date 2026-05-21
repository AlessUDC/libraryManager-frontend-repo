import axios from './axios';
import type { User } from '../types/user';
import type { Loan } from './loans';

export interface Fine {
  fineId: string;
  userId: string;
  loanId: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'PAID' | 'ANNULLED';
  createdAt: string;
  paidAt: string | null;
  user?: User;
  loan?: Loan;
}

export const getMyFines = async (userId: string): Promise<Fine[]> => {
  const { data } = await axios.get(`/loans/fines/user/${userId}`);
  return data;
};

export const getAllFines = async (): Promise<Fine[]> => {
  const { data } = await axios.get('/loans/fines');
  return data;
};

export const payFine = async (fineId: string): Promise<Fine> => {
  const { data } = await axios.patch(`/loans/fines/${fineId}/pay`);
  return data;
};

export const annulFine = async (fineId: string): Promise<Fine> => {
  const { data } = await axios.patch(`/loans/fines/${fineId}/annul`);
  return data;
};
