import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import XIcon from '../assets/svg/X';
import { getProvinces, getDistricts } from '../api/metadata';
import { updateProfile } from '../api/auth';
import ErrorMessage from '../components/ErrorMessage';
import type { User } from '../types/user';

type ChangeCredentialsModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  profile: User | null;
};

type FormData = {
  mobilePhone: string;
  landlinePhone: string;
  province: string;
  district: string;
  address: string;
  maritalStatus: string;
};

export default function ChangeCredentialsModal({ isOpen, setIsOpen, profile }: ChangeCredentialsModalProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  // Populate form when modal opens or profile changes
  useEffect(() => {
    if (isOpen && profile?.userData) {
      const userData = profile.userData;
      reset({
        mobilePhone: userData.mobilePhone || '',
        landlinePhone: userData.landlinePhone || '',
        maritalStatus: userData.maritalStatus || '',
        address: userData.address?.title || '',
        province: userData.district?.province?.provinceId || '',
        district: userData.district?.districtId || '',
      });
      setSelectedProvinceId(userData.district?.province?.provinceId || '');
    }
  }, [isOpen, profile, reset]);

  // Mutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success(data.message || 'Perfil actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el perfil');
    }
  });

  // Estado matrimonial
  const maritalStatuses = [
    { value: 'S', label: 'Soltero(a)' },
    { value: 'C', label: 'Casado(a)' },
    { value: 'V', label: 'Viudo(a)' },
    { value: 'D', label: 'Divorciado(a)' }
  ];

  // Queries
  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: getProvinces,
    enabled: isOpen
  });

  const { data: districts } = useQuery({
    queryKey: ['districts', selectedProvinceId],
    queryFn: () => getDistricts(selectedProvinceId),
    enabled: isOpen && !!selectedProvinceId
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      mobilePhone: data.mobilePhone,
      landlinePhone: data.landlinePhone,
      maritalStatus: data.maritalStatus,
      districtId: data.district,
      address: data.address
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">Actualizar Perfil</h3>
            <p className="text-xs text-slate-400 mt-1">Modifica tu información de contacto y ubicación</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <XIcon className='w-7 h-7' />
          </button>
        </div>

        <form className="p-8 space-y-6 overflow-y-auto" onSubmit={handleSubmit(onSubmit)}>
          {/* Sección: Contacto */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 border-b border-indigo-500/20 pb-2">Contacto</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">Teléfono Móvil</label>
                <input 
                  type="tel" 
                  placeholder="999999999"
                  {...register('mobilePhone', {
                    required: 'El teléfono móvil es obligatorio',
                    pattern: {
                      value: /^\d{9}$/,
                      message: 'Debe tener exactamente 9 dígitos numéricos'
                    }
                  })}
                  className={`w-full bg-slate-900/50 border ${errors.mobilePhone ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-700'} rounded-2xl py-4 px-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all`}
                />
                {errors.mobilePhone && <ErrorMessage>{errors.mobilePhone.message}</ErrorMessage>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">Teléfono Fijo</label>
                <input 
                  type="tel" 
                  placeholder="014444444"
                  {...register('landlinePhone', {
                    required: 'El teléfono fijo es obligatorio',
                    pattern: {
                      value: /^\d{9}$/,
                      message: 'Debe tener exactamente 9 dígitos numéricos'
                    }
                  })}
                  className={`w-full bg-slate-900/50 border ${errors.landlinePhone ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-700'} rounded-2xl py-4 px-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all`}
                />
                {errors.landlinePhone && <ErrorMessage>{errors.landlinePhone.message}</ErrorMessage>}
              </div>
            </div>
          </div>

          {/* Sección: Ubicación y Otros */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 border-b border-blue-500/20 pb-2">Ubicación y Estado Civil</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">Provincia</label>
                <select 
                  {...register('province')}
                  onChange={(e) => {
                    setSelectedProvinceId(e.target.value);
                    register('province').onChange(e);
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Selecciona Provincia</option>
                  {provinces?.map(p => (
                    <option key={p.provinceId} value={p.provinceId}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">Distrito</label>
                <select 
                  disabled={!selectedProvinceId}
                  {...register('district')}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Selecciona Distrito</option>
                  {districts?.map(d => (
                    <option key={d.districtId} value={d.districtId}>{d.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">Calle / Lugar de Residencia</label>
              <input 
                type="text" 
                placeholder="Av. Las Camelias 123..."
                {...register('address')}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">Estado Civil</label>
              <select 
                {...register('maritalStatus')}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Selecciona una opción</option>
                {maritalStatuses.map(ms => (
                  <option key={ms.value} value={ms.value}>{ms.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


