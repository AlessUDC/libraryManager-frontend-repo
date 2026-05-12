import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getFaculties, getSchools } from "../../../api/metadata";
import type { Faculty, School, Role } from "../../../types";
import type { RegisterFormData } from "../../../types/auth";
import AcademicDataIcon from "../../../assets/svg/AcademicData";
import ErrorMessage from "../../ErrorMessage";


interface AcademicDataProps {
  role: Role;
}

export default function AcademicData({ role }: AcademicDataProps) {
    const { register, watch, formState: { errors } } = useFormContext<RegisterFormData>();
    
    // Dynamic data states
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [schools, setSchools] = useState<School[]>([]);

    const selectedFacultyId = watch('facultyId');

    // Static options (not in DB models)
    const cycles = Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `${i + 1} Ciclo` }));


    // Fetch initial data (faculties)
    useEffect(() => {
        getFaculties()
            .then(setFaculties)
            .catch(err => console.error('Error fetching faculties:', err));
    }, []);

    // Fetch schools when faculty changes
    useEffect(() => {
        if (selectedFacultyId) {
            getSchools(selectedFacultyId)
                .then(setSchools)
                .catch(err => console.error('Error fetching schools:', err));
        } else {
            setSchools([]);
        }
    }, [selectedFacultyId]);

  return (
    <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <AcademicDataIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Cuenta y Datos Académicos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-1">
            <input 
              type="email" 
              placeholder="Correo Electrónico *" 
              {...register('email', { 
                required: 'El email es obligatorio', 
                pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail no válido' } 
              })}
              className={`w-full bg-slate-900/50 border ${errors.email ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-slate-600 text-white`}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-1">
            <input 
              type="number" 
              placeholder="Código Universitario *" 
              {...register('code', { required: 'El código es obligatorio' })}
              className={`w-full bg-slate-900/50 border ${errors.code ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-slate-600 text-white`}
            />
            {errors.code && <ErrorMessage>{errors.code.message}</ErrorMessage>}
          </div>
          {role === 'student' && (
            <div className="space-y-1">
              <select 
                {...register('cycle', { required: 'El ciclo es obligatorio', valueAsNumber: true })}
                className={`w-full bg-slate-900/50 border ${errors.cycle ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-white appearance-none cursor-pointer`}
              >
                <option value="">Seleccionar Ciclo *</option>
                {cycles.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.cycle && <ErrorMessage>{errors.cycle.message}</ErrorMessage>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <select 
              {...register('facultyId', { required: 'La facultad es obligatoria' })}
              className={`w-full bg-slate-900/50 border ${errors.facultyId ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-white appearance-none cursor-pointer`}
            >
              <option value="">Seleccionar Facultad *</option>
              {faculties.map(faculty => 
                  <option key={faculty.facultyId} value={faculty.facultyId}>
                      {faculty.title}
                  </option>
              )}
            </select>
            {errors.facultyId && <ErrorMessage>{errors.facultyId.message}</ErrorMessage>}
          </div>
          
          {role === 'student' && (
            <div className="space-y-1">
              <select 
                {...register('schoolId', { required: 'La escuela es obligatoria' })}
                disabled={!selectedFacultyId}
                className={`w-full bg-slate-900/50 border ${errors.schoolId ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
              >
                <option value="">Seleccionar Escuela *</option>
                {schools.map(school => 
                  <option key={school.schoolId} value={school.schoolId}>
                      {school.title}
                  </option>
                )}
              </select>
              {errors.schoolId && <ErrorMessage>{errors.schoolId.message}</ErrorMessage>}
            </div>
          )}
        </div>
    </div>
  )
}
