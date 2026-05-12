import axios from './axios';
import type { Copy } from '../types/library';
import type { User } from '../types/user';


export interface Loan {
  loanId: string;
  userId: string;
  copyId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  copy: Copy;
  user?: User;
}

export const getMyLoans = async (userId: string): Promise<Loan[]> => {
  const { data } = await axios.get(`/loans/user/${userId}`);
  return data;
};

export const createLoan = async (loanData: { userId: string, copyId: string, dueDate: string }) => {
  const { data } = await axios.post('/loans', loanData);
  return data;
};

export const returnLoan = async (loanId: string) => {
  const { data } = await axios.patch(`/loans/${loanId}/return`);
  return data;
};
