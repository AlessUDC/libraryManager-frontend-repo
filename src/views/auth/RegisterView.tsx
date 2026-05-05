import { useState } from 'react';
import AuthLayout from '../../layouts/AuthLayout';
import RegisterForm from '../../components/auth/register/RegisterForm';

export default function RegisterView() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl animate-in fade-in duration-700">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Crear Cuenta</h1>
          <p className="text-slate-400">Completa tus datos para registrarte en el sistema</p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === 'student' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Estudiante
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === 'teacher' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Docente
            </button>
          </div>
        </div>

        <RegisterForm role={role}/>
      </div>
    </AuthLayout>
  );
}

