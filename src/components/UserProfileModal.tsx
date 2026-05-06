import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAccount } from '../api/auth';
import { toast } from 'react-toastify';
import XIcon from '../assets/svg/X';
import UserIcon from '../assets/svg/User';

type UserProfileModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsCredentialsOpen: Dispatch<SetStateAction<boolean>>;
  profile: any;
  isLoading: boolean;
  role: string;
};

export default function UserProfileModal({
  isOpen,
  setIsOpen,
  setIsCredentialsOpen,
  profile,
  isLoading,
  role
}: UserProfileModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success('Cuenta eliminada correctamente');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.clear();
      setIsOpen(false);
      navigate('/auth/login');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  if (!isOpen) return null;

  const handleDeleteAccount = () => {
    if (!confirmPassword) {
      toast.warning('Por favor, ingresa tu contraseña');
      return;
    }
    deleteMutate(confirmPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={() => {
          setIsOpen(false);
          setShowDeleteConfirm(false);
          setConfirmPassword('');
        }}
      />
      <div 
        className="
          relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden 
          animate-in zoom-in-95 duration-200
        "
      >
        {/* Encabezado del modal */}
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600 relative">
          <button 
            onClick={() => {
              setIsOpen(false);
              setShowDeleteConfirm(false);
              setConfirmPassword('');
            }}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
          >
            <XIcon className='w-5 h-5' />
          </button>
        </div>
        
        {/* Contenedor Modal Padre de Usuario */}
        <div className="px-8 pb-8 text-center sm:text-left">
          {/* Icono de usuario */}
          <div className="relative -mt-12 mb-6 flex justify-center sm:justify-start">
            <div className="w-24 h-24 rounded-2xl bg-linear-to-tr from-blue-500 to-indigo-500 border-4 border-[#0F172A] shadow-xl flex items-center justify-center text-white text-3xl font-black">
              <UserIcon className='w-12 h-12' />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-10 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"/>
              <p className="text-slate-400 animate-pulse">Cargando perfil...</p>
            </div>
          ) : (
            // Contenedor Modal Hijo de Usuario
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                {/* Nombre de usuario */}
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {profile?.userData?.name} {profile?.userData?.paternalSurname} {profile?.userData?.maternalSurname}
                </h3>
                <p className="text-blue-400 font-medium capitalize mt-1">{role.toLowerCase()}</p>
              </div>

              {!showDeleteConfirm ? (
                <>
                  {/* Sección: Información Académica (Si aplica) */}
                  {(profile?.student || profile?.teacher) && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Académico</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Facultad</p>
                            <p className="text-white font-medium text-sm">
                              {profile?.student?.school?.faculty?.title || profile?.teacher?.faculty?.title || 'No asignada'}
                            </p>
                          </div>
                          {profile?.student && (
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Ciclo</p>
                              <p className="text-blue-400 font-bold text-lg leading-none">{profile.student.cycle}</p>
                            </div>
                          )}
                        </div>
                        {profile?.student?.school && (
                          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Escuela</p>
                            <p className="text-white font-medium text-sm">{profile.student.school.title}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sección: Cuenta */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Cuenta</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Código de Usuario</p>
                        <p className="text-white font-medium">{profile?.code}</p>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Estado Civil</p>
                        <p className="text-white font-medium">
                          {profile?.userData?.maritalStatus === 'S' ? 'Soltero(a)' : 
                           profile?.userData?.maritalStatus === 'C' ? 'Casado(a)' :
                           profile?.userData?.maritalStatus === 'V' ? 'Viudo(a)' :
                           profile?.userData?.maritalStatus === 'D' ? 'Divorciado(a)' : 'No especificado'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 col-span-1 sm:col-span-2">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Correo Electrónico</p>
                        <p className="text-white font-medium truncate">{profile?.userData?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sección: Contacto */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Contacto</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Celular</p>
                        <p className="text-white font-medium">{profile?.userData?.mobilePhone || 'No registrado'}</p>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Teléfono Fijo</p>
                        <p className="text-white font-medium">{profile?.userData?.landlinePhone || 'No registrado'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sección: Ubicación */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Ubicación</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Región / Provincia</p>
                        <p className="text-white font-medium text-sm">
                          {profile?.userData?.district?.province?.title || 'No registrada'} - {profile?.userData?.district?.title || 'No registrado'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Dirección</p>
                        <p className="text-white font-medium text-sm">{profile?.userData?.address?.title || 'No registrada'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones del Perfil */}
                  <div className="pt-4 flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        setIsCredentialsOpen(true);
                      }}
                      className="
                        w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white 
                        rounded-xl font-bold transition-all border border-slate-700
                        active:scale-95
                      "
                    >
                      Actualizar Perfil
                    </button>

                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="
                        w-full py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 
                        rounded-xl font-bold transition-all border border-red-500/30
                        active:scale-95
                      "
                    >
                      Eliminar Cuenta
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-red-500 font-bold text-sm mb-1">Acción Peligrosa</p>
                    <p className="text-red-400/80 text-xs leading-relaxed">
                      Para confirmar la eliminación permanente de tu cuenta y todos tus datos, por favor ingresa tu contraseña actual.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold px-1">Contraseña de confirmación</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="
                        w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white 
                        rounded-xl font-bold transition-all shadow-lg shadow-red-600/20
                        active:scale-95 disabled:opacity-50 disabled:active:scale-100
                      "
                    >
                      {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación Irreversible'}
                    </button>
                    <button 
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setConfirmPassword('');
                      }}
                      className="w-full py-3.5 px-4 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
