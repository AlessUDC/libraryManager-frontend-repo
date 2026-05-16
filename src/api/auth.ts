import { isAxiosError } from 'axios';
import api from './axios';
import type { RegisterFormData } from '../types/auth';

const processError = (error: unknown) => {
  if (isAxiosError(error) && error.response) {
    const message = Array.isArray(error.response.data.message) 
      ? error.response.data.message.join(', ') 
      : error.response.data.message;
    return new Error(message || 'Error en la operación');
  }
  return new Error('No se pudo conectar con el servidor');
};

export const registerUser = async (data: RegisterFormData & { role: string }) => {
  try {
    const response = await api.post('/auth/register', {
      ...data,
      role: data.role.toUpperCase(),
    });
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const confirmAccount = async ({ email, token }: { email: string, token: string }) => {
  try {
    const response = await api.post('/auth/confirm', { email, token });
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const resendToken = async (email: string) => {
  try {
    const response = await api.post('/auth/resend-token', { email });
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const verifyResetToken = async ({ email, token }: { email: string, token: string }) => {
  try {
    const response = await api.post('/auth/verify-reset-token', { email, token });
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const resetPassword = async (data: { email: string, token: string, password: string, passwordConfirmation: string }) => {
  try {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const loginUser = async (data: { code: string, password: string }) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const updateProfile = async (data: Record<string, string>) => {
  try {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const deleteAccount = async (password: string) => {
  try {
    const response = await api.delete('/auth/profile', { data: { password } });
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};

export const activateAccount = async (data: { token: string, password: string, passwordConfirmation: string }) => {
  try {
    const response = await api.post('/auth/activate-account', data);
    return response.data;
  } catch (error) {
    throw processError(error);
  }
};
