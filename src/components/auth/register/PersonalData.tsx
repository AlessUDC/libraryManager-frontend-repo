import { useFormContext } from 'react-hook-form';
import type { RegisterFormData } from '../../../types/auth';

import PersonalDataIcon from '../../../assets/svg/PersonalData';
import ErrorMessage from '../../ErrorMessage';

export default function RegisterPersonalData() {
  const { register, formState: { errors } } = useFormContext<RegisterFormData>();

  const genders = [
    { value: 'M', label: 'Hombre' },
    { value: 'F', label: 'Mujer' },
    { value: 'O', label: 'Otro' }
  ];
  const maritalStatuses = [
    { value: 'S', label: 'Soltero(a)' },
    { value: 'C', label: 'Casado(a)' },
    { value: 'V', label: 'Viudo(a)' },
    { value: 'D', label: 'Divorciado(a)' }
  ];

  return (
    <div className="relative z-10">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-blue-600/10 rounded-lg">
          <PersonalDataIcon className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Datos Personales</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <input
            type="text"
            placeholder="Nombres *"
            {...register('name', { required: 'El nombre es obligatorio' })}
            className={`w-full bg-slate-900/50 border ${errors.name ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-slate-600 text-white`}
          />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </div>
        <div className="space-y-1">
          <input
            type="text"
            placeholder="Apellido Paterno *"
            {...register('paternalSurname', { required: 'El apellido paterno es obligatorio' })}
            className={`w-full bg-slate-900/50 border ${errors.paternalSurname ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-slate-600 text-white`}
          />
          {errors.paternalSurname && <ErrorMessage>{errors.paternalSurname.message}</ErrorMessage>}
        </div>
        <div className="space-y-1">
          <input
            type="text"
            placeholder="Apellido Materno *"
            {...register('maternalSurname', { required: 'El apellido materno es obligatorio' })}
            className={`w-full bg-slate-900/50 border ${errors.maternalSurname ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-slate-600 text-white`}
          />
          {errors.maternalSurname && <ErrorMessage>{errors.maternalSurname.message}</ErrorMessage>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="flex flex-col space-y-1">
          <div className="flex">
            <select
              {...register('documentType')}
              className="bg-slate-900/80 border border-slate-800 border-r-0 rounded-l-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 text-white w-24 appearance-none cursor-pointer"
            >
              <option value="DNI">DNI</option>
              <option value="CE">CE</option>
            </select>
            <input
              type="number"
              placeholder="Número *"
              {...register('documentNumber', { 
                required: 'El número de documento es obligatorio',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' }
              })}
              className={`w-full bg-slate-900/50 border ${errors.documentNumber ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-r-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-slate-600 text-white`}
            />
          </div>
          {errors.documentNumber && <ErrorMessage>{errors.documentNumber.message}</ErrorMessage>}
        </div>
        <div className="space-y-1">
          <input
            type="date"
            {...register('birthdate', { required: 'La fecha de nacimiento es obligatoria' })}
            className={`w-full bg-slate-900/50 border ${errors.birthdate ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-white appearance-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer`}
          />
          {errors.birthdate && <ErrorMessage>{errors.birthdate.message}</ErrorMessage>}
        </div>
        <div className="space-y-1">
          <select
            {...register('gender', { required: 'El género es obligatorio' })}
            className={`w-full bg-slate-900/50 border ${errors.gender ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-white appearance-none cursor-pointer`}
          >
            <option value="">Género *</option>
            {genders.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          {errors.gender && <ErrorMessage>{errors.gender.message}</ErrorMessage>}
        </div>
        <div className="space-y-1">
          <select
            {...register('maritalStatus', { required: 'El estado civil es obligatorio' })}
            className={`w-full bg-slate-900/50 border ${errors.maritalStatus ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-white appearance-none cursor-pointer`}
          >
            <option value="">Estado Civil *</option>
            {maritalStatuses.map(ms => <option key={ms.value} value={ms.value}>{ms.label}</option>)}
          </select>
          {errors.maritalStatus && <ErrorMessage>{errors.maritalStatus.message}</ErrorMessage>}
        </div>
      </div>
    </div>
  );
}
