import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBook, updateBook, getBookById } from '../../api/books';
import { getAuthors } from '../../api/authors';
import { getCategories } from '../../api/categories';
import type { CreateBookDto } from '../../types/library';
import { toast } from 'react-toastify';
import ErrorMessage from '../../components/ErrorMessage';
import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function BookFormView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: editingBook, isLoading: isLoadingBook, isError: isErrorBook } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => getBookById(slug!),
    enabled: !!slug,
    retry: false
  });

  const { data: authors } = useQuery({ queryKey: ['authors'], queryFn: getAuthors });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBookDto>();

  useEffect(() => {
    if (editingBook) {
      reset({
        title: editingBook.title,
        isbn: editingBook.isbn || '',
        publisher: editingBook.publisher || '',
        publicationYear: editingBook.publicationYear,
        edition: editingBook.edition || '',
        language: editingBook.language || '',
        description: editingBook.description || '',
        activeState: editingBook.activeState,
        authorIds: editingBook.authors?.map(a => a.authorId) || [],
        categoryIds: editingBook.categories?.map(c => c.categoryId) || [],
      });
    }
  }, [editingBook, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateBookDto) => 
      slug 
        ? updateBook(editingBook!.bookId, data) 
        : createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success(slug ? 'Libro actualizado' : 'Libro creado correctamente');
      navigate('/catalogue');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const onSubmit = (data: CreateBookDto) => {
    const formattedData = {
      ...data,
      publicationYear: data.publicationYear ? Number(data.publicationYear) : undefined,
    };
    mutation.mutate(formattedData);
  };

  if (slug && isLoadingBook) return <div className="text-white p-10 flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  if (slug && isErrorBook) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
        <XMarkIcon className="w-12 h-12" />
      </div>
      <div>
        <h3 className="text-3xl font-black text-white">Libro no encontrado</h3>
        <p className="text-slate-500 mt-2">El libro que intentas editar no existe o ha sido eliminado.</p>
      </div>
      <button onClick={() => navigate('/catalogue')} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700">
        Volver al Catálogo
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <button 
        onClick={() => navigate('/catalogue')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Volver al Catálogo</span>
      </button>

      <div className="bg-[#0F1523] border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">
            {slug ? 'Editar Libro' : 'Nuevo Libro'}
          </h1>
          <p className="text-slate-500 text-lg">Completa la información bibliográfica del ejemplar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Basic Info */}
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Título del Libro</label>
              <input
                type="text"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-blue-500/50 border-slate-700 outline-hidden transition-all text-lg"
                placeholder="Ej: Rayuela"
                {...register('title', { required: 'El título es obligatorio' })}
              />
              {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">ISBN</label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-blue-500/50 border-slate-700 outline-hidden transition-all"
                  placeholder="978-..."
                  {...register('isbn')}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Año de Pub.</label>
                <input
                  type="number"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-blue-500/50 border-slate-700 outline-hidden transition-all"
                  placeholder="1963"
                  {...register('publicationYear')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Editorial</label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-blue-500/50 border-slate-700 outline-hidden transition-all"
                  {...register('publisher')}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Edición</label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-blue-500/50 border-slate-700 outline-hidden transition-all"
                  {...register('edition')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Descripción</label>
              <textarea
                rows={6}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-blue-500/50 border-slate-700 outline-hidden transition-all resize-none"
                placeholder="Escribe un resumen o sinopsis..."
                {...register('description')}
              />
            </div>
          </div>

          {/* Right Column: Relations & Media */}
          <div className="space-y-8">

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Autores</label>
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 max-h-56 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
                {authors?.map(author => (
                  <label key={author.authorId} className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        value={author.authorId}
                        className="peer w-6 h-6 rounded-lg border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer"
                        {...register('authorIds')}
                      />
                    </div>
                    <span className="text-slate-300 group-hover:text-white transition-colors">{author.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Categorías</label>
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 max-h-56 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
                {categories?.map(cat => (
                  <label key={cat.categoryId} className="flex items-center gap-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      value={cat.categoryId}
                      className="w-6 h-6 rounded-lg border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer"
                      {...register('categoryIds')}
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">{cat.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-blue-900/40 disabled:opacity-50 active:scale-[0.98] text-lg"
              >
                {mutation.isPending ? 'Guardando...' : slug ? 'Actualizar Libro' : 'Crear Libro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
