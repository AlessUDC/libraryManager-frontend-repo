import { isAxiosError } from 'axios';
import api from './axios';
import type { RegisterFormData } from '../types/auth';

export const registerUser = async (data: RegisterFormData & { role: string }) => {
  try {
    const response = await api.post('/auth/register', {
      ...data,
      role: data.role.toUpperCase(), // Convert to uppercase for backend Enum
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Ocurrió un error en el registro');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const confirmAccount = async ({ email, token }: { email: string, token: string }) => {
  try {
    const response = await api.post('/auth/confirm', { email, token });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al confirmar la cuenta');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const resendToken = async (email: string) => {
  try {
    const response = await api.post('/auth/resend-token', { email });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al reenviar el código');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};
export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al solicitar recuperación');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const verifyResetToken = async ({ email, token }: { email: string, token: string }) => {
  try {
    const response = await api.post('/auth/verify-reset-token', { email, token });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al verificar el código');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const resetPassword = async (data: { email: string, token: string, password: any, passwordConfirmation: any }) => {
  try {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al restablecer la contraseña');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const loginUser = async (data: { code: string, password: any }) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al iniciar sesión');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener el perfil');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const updateProfile = async (data: any) => {
  try {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar el perfil');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const deleteAccount = async (password: string) => {
  try {
    const response = await api.delete('/auth/profile', { data: { password } });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar la cuenta');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};
