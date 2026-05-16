import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BookOpenIcon, UserIcon, CalendarDaysIcon, GlobeAltIcon, IdentificationIcon, TagIcon } from '@heroicons/react/24/outline';
import type { Book } from '../../types/library';

import { useNavigate } from 'react-router-dom';

type BookDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
};

export default function BookDetailsModal({ isOpen, onClose, book }: BookDetailsModalProps) {
  const navigate = useNavigate();
  if (!book) return null;

  const handleReserve = () => {
    navigate(`/catalogue/${book.slug}/ejemplares`);
    onClose();
  };

  const isAvailable = (book.availableCopies || 0) > 0;

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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[3rem] bg-slate-900 border border-slate-800 p-8 md:p-12 text-left align-middle shadow-2xl transition-all relative">
                <button
                  onClick={onClose}
                  className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                >
                  <XMarkIcon className="w-8 h-8" />
                </button>

                <div className="flex flex-col md:flex-row gap-10">
                  {/* Book Cover Placeholder */}
                  <div className="w-full md:w-64 shrink-0">
                    <div className="aspect-3/4 rounded-4xl bg-linear-to-br from-blue-600 to-indigo-900 flex items-center justify-center shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-black/20" />
                      <span className="text-white/30 text-9xl font-black uppercase select-none group-hover:scale-110 transition-transform duration-700">
                        {book.title.charAt(0)}
                      </span>
                      
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isAvailable ? 'bg-green-500/90' : 'bg-red-500/90'} text-white shadow-xl`}>
                          {isAvailable ? 'Disponible' : 'Agotado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                        {book.title}
                      </h2>
                      <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <UserIcon className="w-5 h-5" />
                        <span>{book.authors?.map(a => a.name).join(', ') || 'Autor Desconocido'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {book.categories?.map(cat => (
                        <span key={cat.categoryId} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
                          <TagIcon className="w-3.5 h-3.5" />
                          {cat.title}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {book.description || 'Este libro es una pieza fundamental de nuestra colección. Explora sus páginas para profundizar en el conocimiento académico y literario.'}
                      </p>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex items-center gap-3">
                          <CalendarDaysIcon className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Publicación</p>
                            <p className="text-sm font-bold text-white">{book.publicationYear || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <IdentificationIcon className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ISBN</p>
                            <p className="text-sm font-bold text-white">{book.isbn || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <GlobeAltIcon className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Idioma</p>
                            <p className="text-sm font-bold text-white">{book.language || 'Español'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpenIcon className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Disponibilidad</p>
                            <p className="text-sm font-bold text-white">{book.availableCopies} / {book.totalCopies} ejemplares</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={handleReserve}
                        disabled={!isAvailable}
                        className={`
                          w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98]
                          ${isAvailable 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 hover:-translate-y-0.5' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                        `}
                      >
                        {isAvailable ? 'Reservar este libro' : 'No disponible para reserva'}
                      </button>
                      <p className="text-center text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest">
                        * Sujeto a las políticas de préstamo vigentes
                      </p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
