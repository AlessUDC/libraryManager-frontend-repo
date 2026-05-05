import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import AuthLayout from '../../layouts/AuthLayout';
import { resendToken } from '../../api/auth';

type RequestNewTokenForm = {
  email: string;
};

export default function RequestNewTokenView() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RequestNewTokenForm>();

  const { mutate, isPending } = useMutation({
    mutationFn: resendToken,
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Nuevo código enviado');
      navigate('/auth/confirm', { state: { email: variables } });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al solicitar nuevo código');
    }
  });

  const onSubmit = (data: RequestNewTokenForm) => {
    mutate(data.email);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-[#0F1523]/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/50 shadow-2xl relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center border border-white/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="mt-8 mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Solicitar Código</h1>
          <p className="text-slate-400 text-sm">Ingresa tu correo electrónico para recibir un nuevo código de confirmación</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2 ml-1">
              Correo Electrónico
            </label>
            <div className="relative group">
              <input
                id="email"
                type="email"
                className={`
                  w-full px-4 py-3.5 bg-slate-900/50 border rounded-xl 
                  text-white placeholder-slate-600 focus:outline-none focus:ring-2 
                  focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300
                  group-hover:border-slate-700
                  ${errors.email ? 'border-red-500' : 'border-slate-800'}
                `}
                placeholder="ejemplo@correo.com"
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Formato de correo inválido'
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="
                w-full py-4 px-4 bg-linear-to-r from-blue-600 to-indigo-600 
                hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl 
                font-bold shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)]
                transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                focus:ring-offset-[#0F1523] disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isPending ? 'Enviando...' : 'Enviar Código'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center flex flex-col gap-3">
          <Link
            to="/auth/login"
            className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
          >
            Volver al inicio de sesión
          </Link>
          <Link
            to="/auth/confirm"
            className="text-slate-500 hover:text-slate-400 text-xs transition-colors"
          >
            Ya tengo un código
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
