import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import type { Loan } from '../../api/loans';

interface ReturnLoanModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  loan: Loan | null;
  onConfirm: (data: { condition: string, observations: string }) => void;
  isLoading: boolean;
}

export default function ReturnLoanModal({ isOpen, setIsOpen, loan, onConfirm, isLoading }: ReturnLoanModalProps) {
  const [condition, setCondition] = useState('GOOD');
  const [observations, setObservations] = useState('');

  if (!loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ condition, observations });
  };

  const handleClose = () => {
    setIsOpen(false);
    setObservations('');
    setCondition('GOOD');
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Dialog.Title as="h3" className="text-2xl font-black text-white">
                      Recepción de Libro
                    </Dialog.Title>
                    <p className="text-blue-400 font-bold text-sm mt-1 line-clamp-1">{loan.copy.book?.title}</p>
                  </div>
                  <button onClick={handleClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Condition Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        Estado del Ejemplar
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'NEW', label: 'Nuevo', color: 'emerald' },
                        { id: 'GOOD', label: 'Bueno', color: 'blue' },
                        { id: 'DAMAGED', label: 'Dañado', color: 'red' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCondition(opt.id)}
                          className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                            condition === opt.id
                              ? `bg-${opt.color}-500/10 border-${opt.color}-500 text-${opt.color}-400`
                              : 'bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Observations */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        Observaciones
                    </label>
                    <textarea
                      placeholder="Ej: Portada rayada, sin daños, devuelto tarde pero en buen estado..."
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Info Card */}
                  <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl">
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500 font-bold uppercase tracking-widest">Código de Barras:</span>
                        <span className="text-white font-mono">{loan.copy.barcode}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-bold uppercase tracking-widest">Usuario:</span>
                        <span className="text-white font-bold">{loan.user?.userData.name}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        Finalizar Devolución
                      </>
                    )}
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
