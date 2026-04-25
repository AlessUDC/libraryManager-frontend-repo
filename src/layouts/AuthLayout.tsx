import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative">
        <div className="p-8 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
