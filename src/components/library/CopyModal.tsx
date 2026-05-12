import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCopy, updateCopy } from '../../api/books';
import type { CreateCopyDto, Copy, CopyStatus, CopyCondition } from '../../types/library';
import { toast } from 'react-toastify';
import ErrorMessage from '../ErrorMessage';
import { XMarkIcon } from '@heroicons/react/24/outline';

type CopyModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  bookId: string;
  slug: string;
  editingCopy: Copy | null;
};

export default function CopyModal({ isOpen, setIsOpen, bookId, slug, editingCopy }: CopyModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCopyDto>();

  useEffect(() => {
    if (editingCopy) {
      reset({
        barcode: editingCopy.barcode,
        location: editingCopy.location,
        status: editingCopy.status,
        condition: editingCopy.condition
      });
    } else {
      reset({
        barcode: '',
        location: '',
        status: 'AVAILABLE' as CopyStatus,
        condition: 'NEW' as CopyCondition
      });
    }
  }, [editingCopy, reset, isOpen]);

  const createMutation = useMutation({
    mutationFn: createCopy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies', slug] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Ejemplar añadido');
      handleClose();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateCopyDto }) => updateCopy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies', slug] });
      toast.success('Ejemplar actualizado');
      handleClose();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = (data: CreateCopyDto) => {
    if (editingCopy) {
      updateMutation.mutate({ id: editingCopy.copyId, data });
    } else {
      createMutation.mutate({ ...data, bookId });
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-10 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-8">
                  <Dialog.Title as="h3" className="text-2xl font-black text-white">
                    {editingCopy ? 'Editar Ejemplar' : 'Nuevo Ejemplar'}
                  </Dialog.Title>
                  <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors">
                    <XMarkIcon className="w-8 h-8" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {!editingCopy && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Cantidad de Ejemplares</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                        {...register('quantity', { valueAsNumber: true })}
                        defaultValue={1}
                      />
                      <p className="text-[10px] text-slate-600 mt-1 ml-1 font-bold italic">* Puedes crear hasta 50 de una vez</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                      Código de Barras {editingCopy ? '' : '(Opcional)'}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                      placeholder={editingCopy ? "" : "Dejar vacío para auto-generar"}
                      {...register('barcode', { required: editingCopy ? 'El código es obligatorio para editar' : false })}
                    />
                    {errors.barcode && <ErrorMessage>{errors.barcode.message}</ErrorMessage>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Ubicación</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                      placeholder="Ej: Estante A-10"
                      {...register('location')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Estado</label>
                      <select 
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-5 text-slate-400 outline-hidden transition-all cursor-not-allowed"
                        {...register('status')}
                        disabled
                      >
                        <option value="AVAILABLE">Disponible</option>
                        <option value="LENT">Prestado</option>
                        <option value="RESERVED">Reservado</option>
                        <option value="MAINTENANCE">Mantenimiento</option>
                      </select>
                      <p className="text-[10px] text-slate-600 mt-1 ml-1 font-bold italic">* Se asigna automáticamente</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Condición</label>
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
                        {...register('condition')}
                      >
                        <option value="NEW">Nuevo</option>
                        <option value="GOOD">Bueno</option>
                        <option value="DAMAGED">Dañado</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50 mt-4"
                  >
                    {editingCopy ? 'Guardar Cambios' : 'Crear Ejemplar'}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
