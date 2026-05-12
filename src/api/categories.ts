import { isAxiosError } from 'axios';
import api from './axios';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/library';

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener categorías');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const createCategory = async (data: CreateCategoryDto): Promise<Category> => {
  try {
    const response = await api.post('/categories', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al crear la categoría');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<Category> => {
  try {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar la categoría');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar la categoría');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const deleteMultipleCategories = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map(id => deleteCategory(id)));
};

export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener la categoría');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

