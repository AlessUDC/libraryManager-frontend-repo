import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

type CategoryDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // The category object can be null when no category is selected.
  category: { name: string; description: string } | null;
};

export default function CategoryDetailsModal({
  isOpen,
  onClose,
  category,
}: CategoryDetailsModalProps) {
  if (!category) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    {category.name}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {category.description}
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
