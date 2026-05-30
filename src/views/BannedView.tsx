import { ShieldExclamationIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface BannedViewProps {
  onLogout: () => void;
}

export default function BannedView({ onLogout }: BannedViewProps) {
  return (
    <div className="min-h-screen bg-[#0F1523] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-red-700/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-rose-800/10 rounded-full blur-[140px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjI4MzgiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0tNCAwSDMwdi0yaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      </div>

      <div className="max-w-lg w-full text-center relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.15)]">
              <ShieldExclamationIcon className="w-16 h-16 text-red-500" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-3xl border border-red-500/30 animate-ping" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
            Cuenta Suspendida
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-rose-600 mx-auto rounded-full shadow-lg shadow-red-500/30" />
        </div>

        {/* Message card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/10 rounded-3xl p-8 space-y-4 text-left shadow-2xl">
          <p className="text-white font-bold text-lg leading-relaxed">
            Tu cuenta ha sido <span className="text-red-400">desactivada</span> por el administrador del sistema.
          </p>
          <p className="text-slate-400 leading-relaxed text-sm">
            No puedes acceder al sistema mientras tu cuenta esté suspendida. Si crees que esto es un error, comunícate con el equipo de biblioteca para resolver la situación.
          </p>

          {/* Contact options */}
          <div className="pt-4 space-y-3 border-t border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Contacto de soporte</p>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <EnvelopeIcon className="w-4 h-4 text-blue-400" />
              </div>
              <span>biblioteca@universidad.edu.pe</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <PhoneIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <span>Mesa de ayuda: interno 2400</span>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700 active:scale-95"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
