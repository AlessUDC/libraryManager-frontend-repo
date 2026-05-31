import type { Dispatch, SetStateAction } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '../assets/svg/SidebarHomeIcon';
import BookIcon from '../assets/svg/SidebarBook';
import ClipboardIcon from '../assets/svg/SidebarClipboard';
import LogoutIcon from '../assets/svg/Logout';

import { UserGroupIcon, TagIcon, MagnifyingGlassIcon, TicketIcon, BanknotesIcon } from '@heroicons/react/24/outline';

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen?: Dispatch<SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
  role: string;
  handleLogout: () => void;
};

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  isCollapsed,
  role,
  handleLogout
}: SidebarProps) {
  const location = useLocation();

  const isStudentOrTeacher = ['estudiante', 'student', 'docente', 'teacher'].includes(role.toLowerCase());

  const allMenuItems = [
    { name: 'Inicio', icon: HomeIcon, path: '/' },
    { name: 'Explorar', icon: MagnifyingGlassIcon, path: '/explore' },
    { name: 'Catálogo', icon: BookIcon, path: '/catalogue' },
    { name: 'Autores', icon: UserGroupIcon, path: '/authors' },
    { name: 'Categorías', icon: TagIcon, path: '/categories' },
    { name: 'Mis Préstamos', icon: ClipboardIcon, path: '/loans' },
    { name: 'Mis Reservas', icon: TicketIcon, path: '/reservations' },
    { name: 'Gestión Préstamos y Reservas', icon: ClipboardIcon, path: '/manage-loans' },
    // { name: 'Devolución Rápida', icon: ArrowUturnLeftIcon, path: '/quick-return' },
    { name: 'Usuarios', icon: UserGroupIcon, path: '/users' },
    { name: 'Multas y Sanciones', icon: BanknotesIcon, path: '/fines-appeals' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.name === 'Inicio') return true;
    if (isStudentOrTeacher) {
      return ['Explorar', 'Mis Préstamos', 'Mis Reservas', 'Multas y Sanciones'].includes(item.name);
    }
    // Para Bibliotecario o Admin
    const isAdmin = role.toUpperCase() === 'ADMINISTRATOR';
    if (isAdmin) {
      return ['Catálogo', 'Autores', 'Categorías', 'Usuarios', 'Gestión Préstamos y Reservas', 'Devolución Rápida'].includes(item.name);
    }
    return ['Catálogo', 'Autores', 'Categorías', 'Gestión Préstamos y Reservas', 'Devolución Rápida'].includes(item.name);
  });

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 md:relative flex flex-col bg-[#0B0F19]/95 backdrop-blur-xl border-r border-slate-800/60 shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      w-72 ${isCollapsed ? 'md:w-20' : 'md:w-72'}
    `}>
      {/* Logo Area */}
      <div className={`p-6 border-b border-slate-800/60 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]">
              LibManager
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">{role}</p>
          </div>
        ) : (
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]">
            LM
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => {
                if (setIsSidebarOpen) {
                  setIsSidebarOpen(false);
                }
              }}
              className={`
                flex items-center p-3 rounded-xl font-medium transition-all duration-300 group relative
                ${isActive
                  ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/5 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }
                ${isCollapsed ? 'justify-center' : 'hover:translate-x-1'}
              `}
            >
              {isActive && !isCollapsed && (
                <span className="absolute left-0 w-1 h-5 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full" />
              )}

              <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'} transition-all duration-300`} />
              {!isCollapsed && <span className="transition-colors duration-300">{item.name}</span>}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-950 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 border border-slate-800 shadow-2xl">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center p-3 bg-slate-900/40 hover:bg-red-500/10 hover:text-red-400 border border-slate-800/80 hover:border-red-500/30 text-slate-400 rounded-xl font-medium transition-all duration-300 active:scale-95 shadow-sm
            ${isCollapsed ? 'justify-center' : 'justify-start'}
          `}
        >
          <LogoutIcon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} transition-transform duration-300 group-hover:scale-110`} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
