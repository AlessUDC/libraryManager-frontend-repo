import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type ConfirmModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function ConfirmModal({ 
  isOpen, 
  setIsOpen, 
  title, 
  description, 
  onConfirm,
  isLoading = false
}: ConfirmModalProps) {
  
  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) setIsOpen(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={() => setIsOpen(false)}>
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
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <Dialog.Title as="h3" className="text-2xl font-black text-white mb-2">
                  {title}
                </Dialog.Title>
                
                <p className="text-slate-400 leading-relaxed mb-8">
                  {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
                    onClick={handleConfirm}
                  >
                    {isLoading ? 'Eliminando...' : 'Confirmar'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
