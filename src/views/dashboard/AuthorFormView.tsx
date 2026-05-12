import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAuthor, updateAuthor, getAuthorById } from '../../api/authors';
import type { CreateAuthorDto } from '../../types/library';
import { toast } from 'react-toastify';
import ErrorMessage from '../../components/ErrorMessage';
import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AuthorFormView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: editingAuthor, isLoading: isLoadingAuthor, isError: isErrorAuthor } = useQuery({
    queryKey: ['author', slug],
    queryFn: () => getAuthorById(slug!),
    enabled: !!slug,
    retry: false
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAuthorDto>();

  useEffect(() => {
    if (editingAuthor) {
      reset({
        name: editingAuthor.name,
        nationality: editingAuthor.nationality || '',
        biography: editingAuthor.biography || '',
        activeState: editingAuthor.activeState
      });
    }
  }, [editingAuthor, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateAuthorDto) => 
      slug 
        ? updateAuthor(editingAuthor!.authorId, data) 
        : createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast.success(slug ? 'Autor actualizado' : 'Autor creado correctamente');
      navigate('/authors');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const onSubmit = (data: CreateAuthorDto) => {
    mutation.mutate(data);
  };

  if (slug && isLoadingAuthor) return <div className="text-white p-10 flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  if (slug && isErrorAuthor) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
        <XMarkIcon className="w-12 h-12" />
      </div>
      <div>
        <h3 className="text-3xl font-black text-white">Autor no encontrado</h3>
        <p className="text-slate-500 mt-2">El autor que intentas editar no existe o ha sido eliminado.</p>
      </div>
      <button onClick={() => navigate('/authors')} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700">
        Volver a Autores
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <button 
        onClick={() => navigate('/authors')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Volver a Autores</span>
      </button>

      <div className="bg-[#0F1523] border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-white mb-2">
            {slug ? 'Editar Autor' : 'Nuevo Autor'}
          </h1>
          <p className="text-slate-500 text-lg">Gestiona la información del autor</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Nombre Completo</label>
            <input
              type="text"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-indigo-500/50 border-slate-700 outline-hidden transition-all text-lg"
              placeholder="Ej: Gabriel García Márquez"
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Nacionalidad</label>
            <input
              type="text"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-indigo-500/50 border-slate-700 outline-hidden transition-all text-lg"
              placeholder="Ej: Colombiano"
              {...register('nationality')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Biografía</label>
            <textarea
              rows={6}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-indigo-500/50 border-slate-700 outline-hidden transition-all resize-none text-lg"
              placeholder="Breve reseña del autor..."
              {...register('biography')}
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-indigo-900/40 disabled:opacity-50 active:scale-[0.98] text-lg"
            >
              {mutation.isPending ? 'Guardando...' : slug ? 'Actualizar Autor' : 'Crear Autor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
