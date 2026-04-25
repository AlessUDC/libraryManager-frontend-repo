import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';

export default function RegisterView() {
  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4">Crear Cuenta</h1>
        <p className="text-slate-400 mb-8">La pantalla de registro se implementará próximamente.</p>
        <Link
          to="/login"
          className="inline-flex justify-center py-2 px-4 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-300 bg-transparent hover:bg-slate-800 focus:outline-none transition-all duration-200"
        >
          Volver al Login
        </Link>
      </div>
    </AuthLayout>
  );
}
