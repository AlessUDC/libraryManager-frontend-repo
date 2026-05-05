import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { getProvinces, getDistricts } from '../../../api/metadata';
import type { Province, District } from '../../../types';
import type { RegisterFormData } from '../../../types/auth';
import LocationIcon from '../../../assets/svg/Location';
import ErrorMessage from '../../ErrorMessage';


// Simplificador de estilos tailwindcss para inputs de formulario
const getInputClasses = (hasError: boolean = false, isSelect: boolean = false) => {
  return `w-full bg-slate-900/50 border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed ${
    isSelect ? 'appearance-none cursor-pointer' : ''
  } ${
    hasError ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'
  }`;
};

export default function Location() {
  const { register, watch, formState: { errors } } = useFormContext<RegisterFormData>();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const selectedProvinceId = watch('provinceId');

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(err => console.error('Error fetching provinces:', err));
  }, []);

  useEffect(() => {
    if (selectedProvinceId) {
      getDistricts(selectedProvinceId)
        .then(setDistricts)
        .catch(err => console.error('Error fetching districts:', err));
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceId]);

  return (
    <div className="relative z-10">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-blue-600/10 rounded-lg">
          <LocationIcon className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Ubicación y Contacto</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-1">
          <select 
            {...register('provinceId', { required: 'La provincia es obligatoria' })}
            className={getInputClasses(!!errors.provinceId, true)}
          >
            <option value="">Seleccionar Provincia *</option>
            {provinces.map(province => (
              <option key={province.provinceId} value={province.provinceId}>
                {province.title}
              </option>
            ))}
          </select>
          {errors.provinceId && <ErrorMessage>{errors.provinceId.message}</ErrorMessage>}
        </div>
        
        <div className="space-y-1">
          <select 
            {...register('districtId', { required: 'El distrito es obligatorio' })}
            disabled={!selectedProvinceId}
            className={getInputClasses(!!errors.districtId, true)}
          >
            <option value="">Seleccionar Distrito *</option>
            {districts.map(district => 
              <option key={district.districtId} value={district.districtId}>
                {district.title}
              </option>
            )}
          </select>
          {errors.districtId && <ErrorMessage>{errors.districtId.message}</ErrorMessage>}
        </div>
      </div>

      <div className="mb-6 space-y-1">
        <input 
          type="text" 
          placeholder="Dirección exacta (Av, Calle, Nro) *" 
          {...register('address', { required: 'La dirección es obligatoria' })}
          className={getInputClasses(!!errors.address)}
        />
        {errors.address && <ErrorMessage>{errors.address.message}</ErrorMessage>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <input 
            type="tel" 
            placeholder="Celular *"
            inputMode='numeric'
            {...register('mobilePhone', { 
              required: 'El celular es obligatorio',
              pattern: { value: /^\d{9}$/, message: 'Debe tener exactamente 9 dígitos' }
            })}
            className={getInputClasses(!!errors.mobilePhone)} 
          />
          {errors.mobilePhone && <ErrorMessage>{errors.mobilePhone.message}</ErrorMessage>}
        </div>
        <div className="space-y-1">
          <input 
            type="tel" 
            inputMode='numeric'
            placeholder="Teléfono Fijo *" 
            {...register('landlinePhone', { 
              required: 'El teléfono fijo es obligatorio',
              pattern: { value: /^\d{9}$/, message: 'Debe tener exactamente 9 dígitos' }
            })}
            className={getInputClasses(!!errors.landlinePhone)} 
          />
          {errors.landlinePhone && <ErrorMessage>{errors.landlinePhone.message}</ErrorMessage>}
        </div>
      </div>
    </div>
  )
}
