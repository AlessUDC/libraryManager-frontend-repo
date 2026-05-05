import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import AuthLayout from '../../layouts/AuthLayout';
import { loginUser } from '../../api/auth';
import ErrorMessage from '../../components/ErrorMessage';

export default function LoginView() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(data.message || 'Inicio de sesión exitoso');
      navigate('/'); // Redirigir al home básico
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al iniciar sesión');
    }
  });

  const onSubmit = (data: any) => {
    mutate({
      code: data.code,
      password: data.password,
    });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-[#0F1523]/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/50 shadow-2xl relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center border border-white/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="mt-8 mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Bienvenido</h1>
          <p className="text-slate-400 text-sm">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-slate-400 mb-2 ml-1">
              Código de Usuario
            </label>
            <div className="relative group">
              <input
                id="code"
                type="text"
                {...register('code', { required: 'El código de usuario es obligatorio' })}
                className={`w-full px-4 py-3.5 bg-slate-900/50 border ${errors.code ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 group-hover:border-slate-700`}
                placeholder="Ingrese su código de usuario"
              />
            </div>
            {errors.code && <ErrorMessage>{errors.code.message as string}</ErrorMessage>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 ml-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-400">
                Contraseña
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                ¿Olvidaste tu contraseña? Reestablecer
              </Link>
            </div>
            <div className="relative group">
              <input
                id="password"
                type="password"
                {...register('password', { required: 'La contraseña es obligatoria' })}
                className={`w-full px-4 py-3.5 bg-slate-900/50 border ${errors.password ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'} rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 group-hover:border-slate-700`}
                placeholder="Ingrese su contraseña"
              />
            </div>
            {errors.password && <ErrorMessage>{errors.password.message as string}</ErrorMessage>}
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
              {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-sm">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/auth/register"
              className="text-blue-500 hover:text-blue-400 font-bold transition-colors ml-1"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
