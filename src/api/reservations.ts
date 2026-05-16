import axios from './axios';

export interface Reservation {
  reservationId: string;
  userId: string;
  copyId: string;
  token?: string; // Only visible to admin in their list
  requestedLoanType: 'HOME' | 'LIBRARY';
  requestedDueDate: string;
  expiresAt: string;
  status: 'PENDING' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';
  reservationDurationMinutes: number;
  createdAt: string;
  copy: {
    copyId: string;
    barcode: string;
    book: {
      title: string;
    }
  };
  user?: {
    role: string;
    userData: {
      name: string;
    }
  }
}

export const createReservation = async (data: {
  copyId: string;
  requestedLoanType: 'HOME' | 'LIBRARY';
  requestedDueDate: string;
  reservationDurationMinutes: number;
}) => {
  const { data: response } = await axios.post('/reservations', data);
  return response;
};

export const getMyReservations = async (): Promise<Reservation[]> => {
  const { data } = await axios.get('/reservations/my-reservations');
  return data;
};

export const getAdminReservations = async (): Promise<Reservation[]> => {
  const { data } = await axios.get('/reservations/admin');
  return data;
};

export const redeemReservation = async (id: string, token: string) => {
  const { data } = await axios.post(`/reservations/${id}/redeem`, { token });
  return data;
};

export const cancelReservation = async (id: string) => {
  const { data } = await axios.patch(`/reservations/${id}/cancel`);
  return data;
};
