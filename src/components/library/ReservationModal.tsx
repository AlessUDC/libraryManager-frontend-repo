import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservation } from '../../api/reservations';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import { CalendarIcon, ClockIcon, HomeIcon, BuildingLibraryIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ReservationModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  copyId: string;
  bookTitle: string;
  userRole: string;
}

export default function ReservationModal({ isOpen, setIsOpen, copyId, bookTitle, userRole }: ReservationModalProps) {
  const queryClient = useQueryClient();
  const [loanType, setLoanType] = useState<'HOME' | 'LIBRARY'>('HOME');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [showSuccess, setShowSuccess] = useState(false);
  const maxReservationDuration = userRole.toUpperCase() === 'TEACHER' ? 120 : 60;
  const maxLoanDays = 5;

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + maxLoanDays);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen && !showSuccess) {
      const now = new Date();
      const localDateStr = now.toISOString().split('T')[0];

      if (loanType === 'LIBRARY') {
        setDueDate(localDateStr);
      } else {
        // Set default due date to 7 days from now, but capped by maxLoanDays
        const date = new Date();
        const defaultDays = Math.min(7, maxLoanDays);
        date.setDate(date.getDate() + defaultDays);
        setDueDate(date.toISOString().split('T')[0]);
      }
      setDuration(maxReservationDuration);
    }
  }, [isOpen, maxReservationDuration, maxLoanDays, loanType, showSuccess]);

  const mutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      setShowSuccess(true);
      toast.success('¡Reserva creada con éxito!');
    },
    onError: (error: Error) => {
      const message = isAxiosError(error) ? error.response?.data?.message : error.message;
      toast.error(message || 'Error al crear la reserva');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse dueDate as local time (YYYY-MM-DD + T00:00:00)
    const [year, month, day] = dueDate.split('-').map(Number);
    const finalDueDate = new Date(year, month - 1, day);
    
    if (loanType === 'LIBRARY') {
      finalDueDate.setHours(19, 0, 0, 0); // Today at 7 PM
    } else {
      finalDueDate.setHours(23, 59, 59, 999); // End of day for home loans
    }

    mutation.mutate({
      copyId,
      requestedLoanType: loanType,
      requestedDueDate: finalDueDate.toISOString(),
      reservationDurationMinutes: duration
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setShowSuccess(false);
    }, 300);
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
                {!showSuccess ? (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <Dialog.Title as="h3" className="text-2xl font-black text-white">
                          Reservar Ejemplar
                        </Dialog.Title>
                        <p className="text-blue-400 font-bold text-sm mt-1">{bookTitle}</p>
                      </div>
                      <button onClick={handleClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Loan Type Selection */}
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tipo de Préstamo</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setLoanType('HOME')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                              loanType === 'HOME' 
                                ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                                : 'bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            <HomeIcon className="w-6 h-6" />
                            <span className="text-xs font-bold">A Domicilio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setLoanType('LIBRARY')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                              loanType === 'LIBRARY' 
                                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                                : 'bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            <BuildingLibraryIcon className="w-6 h-6" />
                            <span className="text-xs font-bold">En Sala</span>
                          </button>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Fecha de Devolución
                        </label>
                        <input
                          type="date"
                          required
                          disabled={loanType === 'LIBRARY'}
                          value={dueDate}
                          min={new Date().toISOString().split('T')[0]}
                          max={getMaxDate()}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {loanType === 'LIBRARY' ? (
                          <p className="text-[10px] text-indigo-400 font-bold mt-1">
                            * Los préstamos en sala deben devolverse hoy antes de las 7:00 PM.
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">
                            * Tiempo máximo permitido: {maxLoanDays} días.
                          </p>
                        )}
                      </div>
 
                       {/* Reservation Duration */}
                       <div className="space-y-2">
                         <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                           <span className="flex items-center gap-2">
                             <ClockIcon className="w-4 h-4" />
                             Tiempo de Reserva
                           </span>
                           <span className="text-blue-400">{duration} min</span>
                         </label>
                         <input
                           type="range"
                           min="15"
                           max={maxReservationDuration}
                           step="15"
                           value={duration}
                           onChange={(e) => setDuration(parseInt(e.target.value))}
                           className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                         />
                        <p className="text-[10px] text-slate-500 text-center italic">
                          Tienes hasta {duration} minutos para recoger el libro en el mostrador.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                        {mutation.isPending ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Confirmar Reserva</>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 mx-auto mb-6">
                      <CheckCircleIcon className="w-12 h-12" />
                    </div>
                    
                    <h3 className="text-3xl font-black text-white mb-2">¡Reserva Exitosa!</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                      Tu libro ha sido reservado. Por favor, acércate al mostrador de la biblioteca para recogerlo.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-left bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl">
                        <ClockIcon className="w-6 h-6 text-blue-400 shrink-0" />
                        <p className="text-xs text-slate-300">
                          Tienes <span className="font-bold text-white text-sm">{duration} minutos</span> para recoger el ejemplar antes de que la reserva expire.
                        </p>
                      </div>

                      <button
                        onClick={handleClose}
                        className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl transition-all active:scale-95 hover:bg-slate-100"
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
