import { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import AuthLayout from '../../layouts/AuthLayout';
import { verifyResetToken } from '../../api/auth';

export default function ResetPasswordTokenView() {
  const [tokenArray, setTokenArray] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const token = tokenArray.join('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const { mutate, isPending } = useMutation({
    mutationFn: verifyResetToken,
    onSuccess: (data) => {
      toast.success(data.message || 'Código verificado');
      // Redirigir a la vista de nueva contraseña pasando el token y email
      navigate('/auth/new-password', { state: { token, email } });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al verificar el código');
    }
  });

  const handleChange = (index: number, value: string) => {
    const val = value.replace(/[^0-9]/g, '');
    
    if (val.length > 1) {
      const digits = val.slice(0, 6).split('');
      const newArray = [...tokenArray];
      for (let i = 0; i < digits.length; i++) {
        if (index + i < 6) newArray[index + i] = digits[i];
      }
      setTokenArray(newArray);
      
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newArray = [...tokenArray];
    newArray[index] = val;
    setTokenArray(newArray);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!tokenArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newArray = [...tokenArray];
        newArray[index] = '';
        setTokenArray(newArray);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasteData) {
      const digits = pasteData.split('');
      const newArray = [...tokenArray];
      digits.forEach((digit, i) => {
        if (i < 6) newArray[i] = digit;
      });
      setTokenArray(newArray);
      inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length !== 6) {
      toast.error('El código debe tener 6 dígitos');
      return;
    }
    mutate({ email, token });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-[#0F1523]/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/50 shadow-2xl relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center border border-white/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="mt-8 mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Verificar Código</h1>
          <p className="text-slate-400 text-sm">
            Ingresa el código de 6 dígitos que enviamos a tu correo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-slate-400 mb-4 text-center">
              Código de Recuperación
            </label>
            <div className="flex justify-center gap-2 sm:gap-4">
              {tokenArray.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="
                    w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold 
                    bg-slate-900/50 border border-slate-700 rounded-xl text-white 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                    focus:border-blue-500 transition-all duration-300
                    shadow-inner
                  "
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || token.length !== 6}
              className="
                w-full py-4 px-4 bg-linear-to-r from-blue-600 to-indigo-600 
                hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl 
                font-bold shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)]
                transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                focus:ring-offset-[#0F1523] disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isPending ? 'Verificando...' : 'Verificar Código'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-sm">
            ¿No recibiste el código?{' '}
            <Link
              to="/auth/forgot-password"
              className="text-blue-500 hover:text-blue-400 font-bold transition-colors ml-1"
            >
              Solicitar nuevo código
            </Link>
          </p>
          <Link
            to="/auth/login"
            className="block mt-4 text-xs text-slate-500 hover:text-slate-400"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
