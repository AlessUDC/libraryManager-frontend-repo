import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export default function NotFoundView() {
  useEffect(() => {
    // We notify the user that they are being redirected
    toast.warning('Ruta no válida o acceso restringido. Redirigiendo...', {
      toastId: '404-redirect', // Prevent duplicate toasts
    });

    // Reset to home and reload as requested
    const timeout = setTimeout(() => {
      window.location.href = '/';
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1523] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="mb-8">
          <h1 className="text-[12rem] font-black leading-none text-transparent bg-clip-text bg-linear-to-b from-blue-400 to-indigo-600 select-none">
            404
          </h1>
          <div className="h-1.5 w-24 bg-blue-500 mx-auto rounded-full mt-4 shadow-lg shadow-blue-500/40" />
        </div>

        <h2 className="text-4xl font-black text-white mb-4">
          ¿Te has perdido en la biblioteca?
        </h2>
        
        <p className="text-slate-400 text-lg mb-12 max-w-md mx-auto leading-relaxed">
          La página que buscas parece haber sido archivada o nunca existió. No te preocupes, siempre puedes volver al inicio.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-900/40 active:scale-95 group"
          >
            <HomeIcon className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            <span>Volver al Inicio</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-black transition-all border border-slate-700 active:scale-95 group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Regresar</span>
          </button>
        </div>
      </div>

      {/* Floating Book Icons for Aesthetic */}
      <div className="absolute top-1/4 left-10 opacity-10 animate-bounce delay-75">
        <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div className="absolute bottom-1/4 right-10 opacity-10 animate-bounce delay-300">
        <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>
    </div>
  );
}
