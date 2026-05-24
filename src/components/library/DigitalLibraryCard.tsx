import { XMarkIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import Barcode from 'react-barcode';

type DigitalLibraryCardProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
};

export default function DigitalLibraryCard({ isOpen, onClose, user, profile }: DigitalLibraryCardProps) {
  if (!isOpen || !user) return null;

  const roleName = user.role === 'STUDENT' ? 'Estudiante' :
                   user.role === 'TEACHER' ? 'Docente' :
                   user.role === 'LIBRARIAN' ? 'Bibliotecario' : 'Administrador';

  const barcodeValue = user.userId.substring(0, 8).toUpperCase();

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Background Decorative Gradients */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="absolute top-0 right-0 p-6 z-10">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all bg-slate-800/40 p-2 rounded-xl"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full mt-4 flex justify-between items-center z-10">
          <IdentificationIcon className="w-8 h-8 text-blue-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700 px-3 py-1 rounded-full bg-slate-800/50">
            {roleName}
          </span>
        </div>

        {/* Card Body */}
        <div className="w-full mt-8 z-10 space-y-1 text-center">
          <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Library Pass</p>
          <h2 className="text-2xl font-black text-white leading-tight">
            {profile?.name || user.name || 'Usuario'} {profile?.paternalSurname || ''}
          </h2>
          <p className="text-slate-500 text-xs mt-1">{user.email}</p>
        </div>

        {/* Barcode Area */}
        <div className="mt-8 bg-white p-4 rounded-2xl w-full flex justify-center items-center shadow-inner z-10">
          <Barcode 
            value={barcodeValue} 
            background="#ffffff"
            lineColor="#000000"
            width={2}
            height={60}
            fontSize={14}
            margin={0}
            displayValue={true}
          />
        </div>

        <p className="mt-8 text-center text-slate-500 text-[10px] uppercase tracking-widest z-10">
          Usa este código en el mostrador para préstamos rápidos
        </p>
      </div>
    </div>
  );
}
