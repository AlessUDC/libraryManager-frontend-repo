import { isAxiosError } from 'axios';
import api from './axios';
import type { Author, CreateAuthorDto, UpdateAuthorDto } from '../types/library';

export const getAuthors = async (): Promise<Author[]> => {
  try {
    const response = await api.get('/authors');
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener autores');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const createAuthor = async (data: CreateAuthorDto): Promise<Author> => {
  try {
    const response = await api.post('/authors', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al crear el autor');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const updateAuthor = async (id: string, data: UpdateAuthorDto): Promise<Author> => {
  try {
    const response = await api.patch(`/authors/${id}`, data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar el autor');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const deleteAuthor = async (id: string): Promise<void> => {
  try {
    await api.delete(`/authors/${id}`);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar el autor');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

