import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';

export default function LoginView() {
  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Bienvenido</h1>
        <p className="text-slate-400 text-sm">Ingresa tus credenciales para continuar</p>
      </div>

      <form className="space-y-6">
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium text-slate-300 mb-2">
            Código de Usuario
          </label>
          <div className="relative">
            <input
              id="codigo"
              name="codigo"
              type="text"
              required
              className="
                w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl 
                text-white placeholder-slate-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200
              "
              placeholder="Ingrese su código de usuario"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Contraseña
            </label>
            <a
              href="#"
              className="
                text-sm font-medium text-blue-400 hover:text-blue-300 
                transition-colors pointer-events-none opacity-50
              "
              onClick={(e) => e.preventDefault()}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="
                w-full px-4 py-3 bg-slate-800/50 border border-slate-700 
                rounded-xl text-white placeholder-slate-500 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition-all duration-200
              "
              placeholder="Ingrese su contraseña"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="
              w-full flex justify-center py-3 px-4 border border-transparent
              rounded-xl shadow-sm text-sm font-bold text-white bg-linear-to-r 
              from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
              focus:ring-offset-slate-900 transition-all duration-200 transform 
              hover:scale-[1.02] active:scale-[0.98]
            "
          >
            Iniciar Sesión
          </button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-slate-400">¿No tienes una cuenta?</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/register"
            className="
              w-full flex justify-center py-3 px-4 border border-slate-600 rounded-xl 
              shadow-sm text-sm font-medium text-slate-300 bg-transparent hover:bg-slate-800
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 
              focus:ring-offset-slate-900 transition-all duration-200
            "
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
