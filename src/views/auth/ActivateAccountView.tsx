import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import AuthLayout from '../../layouts/AuthLayout';
import { activateAccount } from '../../api/auth';
import { KeyIcon } from '@heroicons/react/24/outline';

export default function ActivateAccountView() {
  const { token } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: activateAccount,
    onSuccess: (data) => {
      toast.success(data.message || 'Cuenta activada correctamente');
      navigate('/auth/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al activar la cuenta');
    }
  });

  const onSubmit = (data: any) => {
    if (!token) return;
    mutate({
      token,
      password: data.password,
      passwordConfirmation: data.passwordConfirmation
    });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-[#0F1523]/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/50 shadow-2xl relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-linear-to-tr from-emerald-600 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center border border-white/20">
          <KeyIcon className="w-10 h-10 text-white" />
        </div>

        <div className="mt-8 mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Activar Cuenta</h1>
          <p className="text-slate-400 text-sm">Crea tu contraseña para activar tu acceso a LibManager</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-2 ml-1">
              Nueva Contraseña
            </label>
            <div className="relative group">
              <input
                id="password"
                type="password"
                className={`
                  w-full px-4 py-3.5 bg-slate-900/50 border ${errors.password ? 'border-red-500' : 'border-slate-800'} rounded-xl 
                  text-white placeholder-slate-600 focus:outline-none focus:ring-2 
                  focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300
                  group-hover:border-slate-700
                `}
                placeholder="Mínimo 8 caracteres"
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 ml-1">{errors.password.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-slate-400 mb-2 ml-1">
              Confirmar Contraseña
            </label>
            <div className="relative group">
              <input
                id="passwordConfirmation"
                type="password"
                className={`
                  w-full px-4 py-3.5 bg-slate-900/50 border ${errors.passwordConfirmation ? 'border-red-500' : 'border-slate-800'} rounded-xl 
                  text-white placeholder-slate-600 focus:outline-none focus:ring-2 
                  focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300
                  group-hover:border-slate-700
                `}
                placeholder="Repite tu contraseña"
                {...register('passwordConfirmation', {
                  required: 'La confirmación es obligatoria',
                  validate: (val: string) => {
                    if (watch('password') !== val) {
                      return "Las contraseñas no coinciden";
                    }
                  }
                })}
              />
              {errors.passwordConfirmation && (
                <p className="mt-1 text-xs text-red-500 ml-1">{errors.passwordConfirmation.message as string}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="
                w-full py-4 px-4 bg-linear-to-r from-emerald-600 to-teal-600 
                hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl 
                font-bold shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)]
                transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 
                focus:ring-offset-[#0F1523] disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isPending ? 'Activando...' : 'Activar mi cuenta'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
