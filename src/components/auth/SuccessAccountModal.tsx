import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { CheckCircleIcon, ClipboardIcon, LinkIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

type SuccessAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name: string;
    code: string;
    activationToken?: string;
  } | null;
};

export default function SuccessAccountModal({ isOpen, onClose, userData }: SuccessAccountModalProps) {
  if (!userData) return null;

  const activationUrl = `${window.location.origin}/auth/activate/${userData.activationToken}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.info(`${label} copiado al portapapeles`, { autoClose: 2000 });
  };

  return (
    <Transition show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-[#0F1523] border border-slate-800 p-8 text-center align-middle shadow-2xl transition-all">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <CheckCircleIcon className="w-12 h-12" />
                  </div>
                </div>

                <DialogTitle as="h3" className="text-2xl font-black text-white mb-2">
                  ¡Usuario Creado!
                </DialogTitle>
                <p className="text-slate-400">
                  El usuario ha sido registrado. Ahora debe activar su cuenta usando el enlace enviado a su correo.
                </p>
                
                <div className="mt-8 space-y-4">
                  {/* User Code */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-slate-500" />
                      <div className="text-left">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Código de Usuario</p>
                        <p className="text-white font-bold">{userData.code}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(userData.code, 'Código')}
                      className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <ClipboardIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Activation Link */}
                  {userData.activationToken && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <LinkIcon className="w-5 h-5 text-blue-500 shrink-0" />
                        <div className="text-left overflow-hidden">
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Enlace de Activación</p>
                          <p className="text-blue-500 font-medium truncate text-sm">{activationUrl}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(activationUrl, 'Enlace')}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all shrink-0"
                      >
                        <ClipboardIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                    onClick={onClose}
                  >
                    Entendido, continuar
                  </button>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  También se ha enviado un correo electrónico de activación a <strong>{userData.name}</strong> con estas instrucciones. El enlace expira en 1 hora.
                </p>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
