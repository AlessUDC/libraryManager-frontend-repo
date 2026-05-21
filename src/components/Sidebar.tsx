import type { Dispatch, SetStateAction } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '../assets/svg/SidebarHomeIcon';
import BookIcon from '../assets/svg/SidebarBook';
import ClipboardIcon from '../assets/svg/SidebarClipboard';
import LogoutIcon from '../assets/svg/Logout';

import ChevronRightIcon from '../assets/svg/ChevronRight';
import ChevronLeftIcon from '../assets/svg/ChevronLeft';
import { UserGroupIcon, TagIcon, MagnifyingGlassIcon, TicketIcon, BanknotesIcon, ChatBubbleBottomCenterTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

type SidebarProps = {
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
  role: string;
  handleLogout: () => void;
};

export default function Sidebar({
  isSidebarOpen,
  isCollapsed,
  setIsCollapsed,
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
    { name: 'Usuarios', icon: UserGroupIcon, path: '/users' },
    { name: 'Multas y Apelaciones', icon: BanknotesIcon, path: '/fines-appeals' },
    { name: 'Gestionar Apelaciones', icon: ChatBubbleBottomCenterTextIcon, path: '/manage-appeals' },
    { name: 'Auditoría de Sistema', icon: ShieldCheckIcon, path: '/audit-logs' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.name === 'Inicio') return true;
    if (isStudentOrTeacher) {
      return ['Explorar', 'Mis Préstamos', 'Mis Reservas', 'Multas y Apelaciones'].includes(item.name);
    }
    // Para Bibliotecario o Admin
    const isAdmin = role.toUpperCase() === 'ADMINISTRATOR';
    if (isAdmin) {
      return ['Catálogo', 'Autores', 'Categorías', 'Usuarios', 'Gestión Préstamos y Reservas', 'Gestionar Apelaciones', 'Auditoría de Sistema'].includes(item.name);
    }
    return ['Catálogo', 'Autores', 'Categorías', 'Gestión Préstamos y Reservas', 'Gestionar Apelaciones'].includes(item.name);
  });


  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 md:relative flex flex-col bg-slate-900/90 border-r border-slate-800 transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      ${isCollapsed ? 'md:w-20' : 'md:w-72'}
    `}>
      {/* Logo Area */}
      <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
                LibManager
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">{role}</p>
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-all duration-300"
            >
              <ChevronLeftIcon className='w-5 h-5' />
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-all duration-300"
          >
            <ChevronRightIcon className='w-5 h-5' />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name}
              to={item.path} 
              className={`
                flex items-center p-3 rounded-xl font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} transition-all`} />
              {!isCollapsed && <span>{item.name}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}

      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center p-3 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30 text-white rounded-xl font-medium transition-all border border-slate-700
            ${isCollapsed ? 'justify-center' : 'justify-center'}
          `}
        >
          <LogoutIcon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-2'}`} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
