import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAuthor, updateAuthor } from '../../api/authors';
import type { CreateAuthorDto, Author } from '../../types/library';
import { toast } from 'react-toastify';
import ErrorMessage from '../ErrorMessage';
import { XMarkIcon } from '@heroicons/react/24/outline';

type AuthorModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingAuthor?: Author | null;
};

export default function AuthorModal({ isOpen, setIsOpen, editingAuthor }: AuthorModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAuthorDto>({
    values: editingAuthor ? {
      name: editingAuthor.name,
      nationality: editingAuthor.nationality,
      biography: editingAuthor.biography,
      activeState: editingAuthor.activeState
    } : undefined
  });

  const mutation = useMutation({
    mutationFn: (data: CreateAuthorDto) => 
      editingAuthor 
        ? updateAuthor(editingAuthor.authorId, data) 
        : createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast.success(editingAuthor ? 'Autor actualizado' : 'Autor creado correctamente');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = (data: CreateAuthorDto) => {
    mutation.mutate(data);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-black text-white">
                    {editingAuthor ? 'Editar Autor' : 'Nuevo Autor'}
                  </Dialog.Title>
                  <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Nombre del Autor</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-hidden transition-all"
                      placeholder="Ej: Gabriel García Márquez"
                      {...register('name', { required: 'El nombre es obligatorio' })}
                    />
                    {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Nacionalidad</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-hidden transition-all"
                      placeholder="Ej: Colombiano"
                      {...register('nationality')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Biografía</label>
                    <textarea
                      rows={4}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-hidden transition-all resize-none"
                      placeholder="Breve reseña del autor..."
                      {...register('biography')}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                    >
                      {mutation.isPending ? 'Guardando...' : editingAuthor ? 'Actualizar Autor' : 'Crear Autor'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
