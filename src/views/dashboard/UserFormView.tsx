import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createUser, updateUser, getUserBySlug } from '../../api/users';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessAccountModal from '../../components/auth/SuccessAccountModal';
import {
  ArrowLeftIcon,
  UserIcon,
  BriefcaseIcon,
  XMarkIcon,
  AcademicCapIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { getProvinces, getDistricts, getFaculties, getSchools } from '../../api/metadata';
import type { Province, District, Faculty, School } from '../../types';

type UserRole = 'STUDENT' | 'TEACHER' | 'LIBRARIAN' | 'ADMINISTRATOR';

type UserFormValues = {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
  birthdate: string;
  code: string;
  documentNumber: string;
  documentType: string;
  role: UserRole;
  activeState: boolean;
  maritalStatus: string;
  gender: string;
  mobilePhone: string;
  landlinePhone: string;
  address: string;
  provinceId: string;
  districtId: string;
  facultyId: string;
  schoolId: string;
  cycle: number;
};

export default function UserFormView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(slug);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const selectedRole = watch('role');
  const selectedProvinceId = watch('provinceId');
  const selectedFacultyId = watch('facultyId');

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useQuery({
    queryKey: ['user', slug],
    queryFn: () => getUserBySlug(slug!),
    enabled: isEdit,
    retry: false
  });

  useEffect(() => {
    getProvinces().then(setProvinces);
    getFaculties().then(setFaculties);
  }, []);

  useEffect(() => {
    if (selectedProvinceId) {
      getDistricts(selectedProvinceId).then((data) => {
        setDistricts(data);
        if (user?.userData?.district?.provinceId === selectedProvinceId) {
          setValue('districtId', user.userData.districtId || '');
        }
      });
    } else {
      setDistricts([]);
      setValue('districtId', '');
    }
  }, [selectedProvinceId, user, setValue]);

  useEffect(() => {
    if (selectedFacultyId) {
      getSchools(selectedFacultyId).then((data) => {
        setSchools(data);
        if (
          user?.student?.school?.facultyId === selectedFacultyId ||
          user?.teacher?.facultyId === selectedFacultyId
        ) {
          setValue('schoolId', user?.student?.schoolId || '');
        }
      });
    } else {
      setSchools([]);
      setValue('schoolId', '');
    }
  }, [selectedFacultyId, user, setValue]);

  useEffect(() => {
    if (user) {
      reset({
        ...user.userData,
        code: user.code,
        role: user.role,
        birthdate: user.userData.birthdate
          ? new Date(user.userData.birthdate).toISOString().split('T')[0]
          : '',
        provinceId: user.userData.district?.provinceId || '',
        districtId: user.userData.districtId || '',
        address: user.userData.address?.title || '',
        facultyId: user.student?.school?.facultyId || user.teacher?.facultyId || '',
        schoolId: user.student?.schoolId || '',
        cycle: user.student?.cycle || 1,
      });
    }
  }, [user, reset]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ name: string; code: string; activationToken?: string } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: UserFormValues) => 
      isEdit 
        ? updateUser({ id: user?.userId!, formData: data }) 
        : createUser(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      if (!isEdit) {
        // Store created user info and show modal
        setCreatedUser({
          name: watch('name'),
          code: data.code,
          activationToken: data.activationToken
        });
        setShowSuccessModal(true);
      } else {
        toast.success('Usuario actualizado');
        navigate('/users');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/users');
  };

  const onSubmit = (data: UserFormValues) => {
    // Clean up fields that the backend rejects due to forbidNonWhitelisted: true
    const cleanData = { ...data };
    const blacklistedFields = [
      'userDataId', 
      'addressId', 
      'createdAt', 
      'updatedAt', 
      'district',
      'user',
      'student',
      'teacher',
      'librarian',
      'administrator'
    ];
    
    blacklistedFields.forEach(field => {
      // @ts-ignore
      delete cleanData[field];
    });

    mutation.mutate(cleanData);
  };

  if (isEdit && isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (isEdit && isErrorUser) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
        <XMarkIcon className="w-12 h-12" />
      </div>
      <div>
        <h3 className="text-3xl font-black text-white">Usuario no encontrado</h3>
        <p className="text-slate-500 mt-2">El perfil que intentas editar no existe o ha sido eliminado.</p>
      </div>
      <button onClick={() => navigate('/users')} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700">
        Volver a Usuarios
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-3xl font-black text-white">
            {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h1>
          <p className="text-slate-400">
            {isEdit
              ? 'Actualiza la información del perfil'
              : 'Registra un nuevo miembro en el sistema'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <UserIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Información Personal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Nombres</label>
              <input
                {...register('name', { required: 'El nombre es obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
              />
              {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Apellido Paterno</label>
              <input
                {...register('paternalSurname', { required: 'Campo obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
              />
              {errors.paternalSurname && (
                <ErrorMessage>{errors.paternalSurname.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Apellido Materno</label>
              <input
                {...register('maternalSurname', { required: 'Campo obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
              />
              {errors.maternalSurname && (
                <ErrorMessage>{errors.maternalSurname.message}</ErrorMessage>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
              />
              {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Fecha de Nacimiento</label>
              <input
                type="date"
                {...register('birthdate', { required: 'Campo obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              />
              {errors.birthdate && <ErrorMessage>{errors.birthdate.message}</ErrorMessage>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Género</label>
              <select
                {...register('gender', { required: 'Campo obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all appearance-none cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
              {errors.gender && <ErrorMessage>{errors.gender.message}</ErrorMessage>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Estado Civil</label>
              <select
                {...register('maritalStatus', { required: 'Campo obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all appearance-none cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                <option value="S">Soltero(a)</option>
                <option value="C">Casado(a)</option>
                <option value="V">Viudo(a)</option>
                <option value="D">Divorciado(a)</option>
              </select>
              {errors.maritalStatus && <ErrorMessage>{errors.maritalStatus.message}</ErrorMessage>}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <PhoneIcon className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Ubicación y Contacto</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Provincia</label>
              <select
                {...register('provinceId', { required: 'Campo obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-hidden transition-all appearance-none cursor-pointer"
              >
                <option value="">Seleccionar Provincia...</option>
                {provinces.map(p => <option key={p.provinceId} value={p.provinceId}>{p.title}</option>)}
              </select>
              {errors.provinceId && <ErrorMessage>{errors.provinceId.message}</ErrorMessage>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Distrito</label>
              <select
                {...register('districtId', { required: 'Campo obligatorio' })}
                disabled={!selectedProvinceId}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-hidden transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Seleccionar Distrito...</option>
                {districts.map(d => <option key={d.districtId} value={d.districtId}>{d.title}</option>)}
              </select>
              {errors.districtId && <ErrorMessage>{errors.districtId.message}</ErrorMessage>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Dirección</label>
            <input
              {...register('address', { required: 'Campo obligatorio' })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-hidden transition-all"
              placeholder="Av, Calle, Nro..."
            />
            {errors.address && <ErrorMessage>{errors.address.message}</ErrorMessage>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Celular</label>
              <input
                {...register('mobilePhone', { 
                  required: 'Campo obligatorio',
                  pattern: { value: /^\d{9}$/, message: '9 dígitos' }
                })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-hidden transition-all"
              />
              {errors.mobilePhone && <ErrorMessage>{errors.mobilePhone.message}</ErrorMessage>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Teléfono Fijo</label>
              <input
                {...register('landlinePhone', { 
                  required: 'Campo obligatorio',
                  pattern: { value: /^\d{9}$/, message: '9 dígitos' }
                })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-hidden transition-all"
              />
              {errors.landlinePhone && <ErrorMessage>{errors.landlinePhone.message}</ErrorMessage>}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <BriefcaseIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Cuenta y Rol</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Código</label>
              <input
                {...register('code', { required: 'Código obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-hidden transition-all"
              />
              {errors.code && <ErrorMessage>{errors.code.message}</ErrorMessage>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Tipo Documento</label>
              <select
                {...register('documentType', { required: 'Campo obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-hidden transition-all appearance-none cursor-pointer"
              >
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Número de Documento</label>
              <input
                {...register('documentNumber', { required: 'DNI/CE obligatorio' })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-hidden transition-all"
              />
              {errors.documentNumber && (
                <ErrorMessage>{errors.documentNumber.message}</ErrorMessage>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-300 block">Rol del Sistema</label>
            {!isEdit ? (
              <div className="bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-2 w-full">
                {[
                  { id: 'STUDENT', label: 'Estudiante' },
                  { id: 'TEACHER', label: 'Docente' },
                  { id: 'LIBRARIAN', label: 'Bibliotecario' },
                  { id: 'ADMINISTRATOR', label: 'Administrador' },
                ].map((roleOption) => (
                  <button
                    key={roleOption.id}
                    type="button"
                    onClick={() =>
                      setValue('role', roleOption.id as UserRole, { shouldValidate: true })
                    }
                    className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      selectedRole === roleOption.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    {roleOption.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-sm text-slate-400">
                  Rol asignado: <span className="text-blue-400 font-black">{selectedRole}</span>
                </p>
                <p className="text-[10px] text-slate-600 ml-auto uppercase font-bold tracking-widest">No editable</p>
              </div>
            )}
            <input type="hidden" {...register('role')} />
          </div>
        </div>

        {['STUDENT', 'TEACHER'].includes(selectedRole) && (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <AcademicCapIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Datos Académicos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Facultad</label>
                <select
                  {...register('facultyId', { required: 'Campo obligatorio' })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-hidden transition-all appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar Facultad...</option>
                  {faculties.map(f => <option key={f.facultyId} value={f.facultyId}>{f.title}</option>)}
                </select>
                {errors.facultyId && <ErrorMessage>{errors.facultyId.message}</ErrorMessage>}
              </div>

              {selectedRole === 'STUDENT' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">Escuela</label>
                  <select
                    {...register('schoolId', { required: 'Campo obligatorio' })}
                    disabled={!selectedFacultyId}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-hidden transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Seleccionar Escuela...</option>
                    {schools.map(s => <option key={s.schoolId} value={s.schoolId}>{s.title}</option>)}
                  </select>
                  {errors.schoolId && <ErrorMessage>{errors.schoolId.message}</ErrorMessage>}
                </div>
              )}
            </div>

            {selectedRole === 'STUDENT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">Ciclo</label>
                  <select
                    {...register('cycle', { required: 'Campo obligatorio', valueAsNumber: true })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-hidden transition-all appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(c => (
                      <option key={c} value={c}>{c} Ciclo</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
          >
            {mutation.isPending && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </div>
      </form>

      <SuccessAccountModal 
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        userData={createdUser}
      />
    </div>
  );
}