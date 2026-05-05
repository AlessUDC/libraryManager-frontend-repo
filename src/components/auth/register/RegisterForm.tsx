import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-toastify';
import { type RegisterFormData } from '../../../types/auth';
import type { Role } from '../../../types';
import AcademicData from './AcademicData';
import PersonalData from './PersonalData';
import Location from './Location';
import { registerUser } from '../../../api/auth';
import { es } from '../../../locales/es';
import { useMutation } from '@tanstack/react-query';

type RoleProps = {
  role: Role
}

export default function RegisterForm({ role }: RoleProps) {
  const navigate = useNavigate();
  
  const methods = useForm<RegisterFormData>({
    defaultValues: {
      documentType: 'DNI',
    },
    shouldUnregister: true
  });


  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      const email = methods.getValues('email');
      toast.success('Cuenta creada. Por favor verifica tu correo.');
      navigate('/auth/confirm', { state: { email } });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const onSubmit = (data: RegisterFormData) => {
    mutate({ ...data, role });
  };


  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="
          w-full max-w-xl md:max-w-4xl mx-auto space-y-12 bg-[#0F1523]/80 
          backdrop-blur-xl p-8 lg:p-12 rounded-4xl border border-slate-800/50 
          shadow-2xl relative overflow-hidden
        "
      >
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full"></div>
        {/* Datos Personales */}
        <PersonalData />

        <div className="h-px bg-linear-to-r from-transparent via-slate-800 to-transparent w-full my-12"></div>

        {/* Ubicación y Contacto */}
        <Location />

        {/* Cuenta y Datos Académicos */}
        <AcademicData role={role} />
        
        {/* ------ Completar Registro BOTONES ------ */}
        <div className="mt-10 flex flex-col items-center space-y-4">
          <button
            type="submit"
            disabled={isPending}
            className="
              w-full md:w-auto px-12 py-4 bg-linear-to-r from-blue-600 to-indigo-600 
              hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl 
              font-bold shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] 
              transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              focus:ring-offset-[#0F1523] disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isPending ? es.auth.register.submitting : es.auth.register.submit}

          </button>
          
          <p className="text-slate-400 text-sm">
            {es.auth.register.loginLink.split('?')[0]}?
            <Link 
              to="/auth/login" 
              className="text-blue-500 hover:text-blue-400 font-medium ml-1"
            >
              {es.auth.register.loginLink.split('?')[1].trim()}
            </Link>
          </p>
        </div>
      </form>
    </FormProvider>
  )
}