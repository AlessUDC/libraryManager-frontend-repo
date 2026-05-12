import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBook, updateBook } from '../../api/books';
import { getAuthors } from '../../api/authors';
import { getCategories } from '../../api/categories';
import type { CreateBookDto, Book } from '../../types/library';
import { toast } from 'react-toastify';
import ErrorMessage from '../ErrorMessage';
import { XMarkIcon } from '@heroicons/react/24/outline';

type BookModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingBook?: Book | null;
};

export default function BookModal({ isOpen, setIsOpen, editingBook }: BookModalProps) {
  const queryClient = useQueryClient();
  
  const { data: authors } = useQuery({ queryKey: ['authors'], queryFn: getAuthors });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBookDto>({
    values: editingBook ? {
      title: editingBook.title,
      isbn: editingBook.isbn || '',
      publisher: editingBook.publisher || '',
      publicationYear: editingBook.publicationYear || undefined,
      edition: editingBook.edition || '',
      language: editingBook.language || '',
      description: editingBook.description || '',
      activeState: editingBook.activeState,
      authorIds: editingBook.authors?.map(a => a.authorId) || [],
      categoryIds: editingBook.categories?.map(c => c.categoryId) || [],
    } : undefined
  });

  const mutation = useMutation({
    mutationFn: (data: CreateBookDto) => 
      editingBook 
        ? updateBook(editingBook.bookId, data) 
        : createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success(editingBook ? 'Libro actualizado' : 'Libro creado correctamente');
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

  const onSubmit = (data: CreateBookDto) => {
    // Ensure numbers are handled correctly
    const formattedData = {
      ...data,
      publicationYear: data.publicationYear ? Number(data.publicationYear) : undefined,
    };
    mutation.mutate(formattedData);
  };

  return (
    <Transition show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-[2rem] bg-[#0F1523] border border-slate-800 p-10 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <DialogTitle as="h3" className="text-3xl font-black text-white">
                      {editingBook ? 'Editar Libro' : 'Nuevo Libro'}
                    </DialogTitle>
                    <p className="text-slate-500 mt-1">Completa la información bibliográfica</p>
                  </div>
                  <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all">
                    <XMarkIcon className="w-8 h-8" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Título del Libro</label>
                      <input
                        type="text"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                        placeholder="Ej: Rayuela"
                        {...register('title', { required: 'El título es obligatorio' })}
                      />
                      {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ISBN</label>
                        <input
                          type="text"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                          placeholder="978-..."
                          {...register('isbn')}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Año</label>
                        <input
                          type="number"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                          placeholder="1963"
                          {...register('publicationYear')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Editorial</label>
                        <input
                          type="text"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                          {...register('publisher')}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Edición</label>
                        <input
                          type="text"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                          {...register('edition')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Descripción</label>
                      <textarea
                        rows={5}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all resize-none"
                        {...register('description')}
                      />
                    </div>
                  </div>

                  {/* Right Column: Relations & Media */}
                  <div className="space-y-6">

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Autores</label>
                      <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-2">
                        {authors?.map(author => (
                          <label key={author.authorId} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              value={author.authorId}
                              className="w-5 h-5 rounded-lg border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50 transition-all"
                              {...register('authorIds')}
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{author.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Categorías</label>
                      <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-2">
                        {categories?.map(cat => (
                          <label key={cat.categoryId} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              value={cat.categoryId}
                              className="w-5 h-5 rounded-lg border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50 transition-all"
                              {...register('categoryIds')}
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{cat.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50 active:scale-95"
                      >
                        {mutation.isPending ? 'Guardando...' : editingBook ? 'Actualizar Libro' : 'Crear Libro'}
                      </button>
                    </div>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
