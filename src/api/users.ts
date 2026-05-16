import { isAxiosError } from 'axios';
import api from './axios';
import type { User } from '../types/user';

const processError = (error: unknown) => {
    if (isAxiosError(error) && error.response) {
        // Si el backend devuelve un array de mensajes (común en ValidationPipe)
        const message = Array.isArray(error.response.data.message) 
            ? error.response.data.message.join(', ') 
            : error.response.data.message;
        return new Error(message || 'Error en la operación');
    }
    return new Error('Error de conexión con el servidor');
};

export const getUsers = async (query?: Record<string, string>) => {
    try {
        const { data } = await api.get<{ users: User[] }>('/users', { params: query });
        return data;
    } catch (error) {
        throw processError(error);
    }
};

export const getUserById = async (id: string) => {
    try {
        const { data } = await api.get<User>(`/users/${id}`);
        return data;
    } catch (error) {
        throw processError(error);
    }
};

export const getUserBySlug = async (slug: string) => {
    try {
        const { data } = await api.get<User>(`/users/slug/${slug}`);
        return data;
    } catch (error) {
        throw processError(error);
    }
};

export const createUser = async (formData: Record<string, unknown>) => {
    try {
        const { data } = await api.post('/users', formData);
        return data;
    } catch (error) {
        throw processError(error);
    }
};

export const updateUser = async ({ id, formData }: { id: string, formData: Record<string, unknown> }) => {
    try {
        const { data } = await api.patch(`/users/${id}`, formData);
        return data;
    } catch (error) {
        throw processError(error);
    }
};

export const deleteUser = async (id: string) => {
    try {
        const { data } = await api.delete(`/users/${id}`);
        return data;
    } catch (error) {
        throw processError(error);
    }
};

export const deleteMultipleUsers = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteUser(id)));
};
