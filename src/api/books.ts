import { isAxiosError } from 'axios';
import api from './axios';
import type { 
  Book, 
  CreateBookDto, 
  UpdateBookDto,
  Copy, 
  CreateCopyDto, 
  UpdateCopyDto 
} from '../types/library';

// --- Books ---

export const getBooks = async (): Promise<Book[]> => {
  try {
    const response = await api.get('/books');
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener libros');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const createBook = async (data: CreateBookDto): Promise<Book> => {
  try {
    const response = await api.post('/books', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al crear el libro');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const getBookById = async (id: string): Promise<Book> => {
  try {
    const response = await api.get(`/books/${id}`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener el detalle del libro');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const updateBook = async (id: string, data: UpdateBookDto): Promise<Book> => {
  try {
    const response = await api.patch(`/books/${id}`, data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar el libro');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const deleteBook = async (id: string): Promise<void> => {
  try {
    await api.delete(`/books/${id}`);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar el libro');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const deleteMultipleBooks = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map(id => deleteBook(id)));
};

// --- Copies ---

export const createCopy = async (data: CreateCopyDto): Promise<Copy | Copy[]> => {
  try {
    const response = await api.post<Copy | Copy[]>('/books/copies', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al crear el ejemplar');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const getCopiesByBook = async (bookId: string): Promise<Copy[]> => {
  try {
    const response = await api.get(`/books/${bookId}/copies`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener ejemplares');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const updateCopy = async (copyId: string, data: UpdateCopyDto): Promise<Copy> => {
  try {
    const response = await api.patch(`/books/copies/${copyId}`, data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar el ejemplar');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const deleteCopy = async (copyId: string): Promise<void> => {
  try {
    await api.delete(`/books/copies/${copyId}`);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar el ejemplar');
    }
    throw new Error('No se pudo conectar con el servidor');
  }
};

export const deleteMultipleCopies = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map(id => deleteCopy(id)));
};

