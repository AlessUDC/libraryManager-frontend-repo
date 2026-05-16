import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../api/auth';
import UserProfileModal from '../components/UserProfileModal';
import Sidebar from '../components/Sidebar';
import ChangeCredentialsModal from '../components/ChangeCredentialsModal';
import MenuIcon from '../assets/svg/Menu'
import UserIcon from '../assets/svg/User'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, type ReactNode } from 'react';

type DashboardLayoutProps = {
  children: ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isProfileOpen = searchParams.get('view-profile') === 'true';
  const isCredentialsOpen = searchParams.get('edit-profile') === 'true';

  const setIsProfileOpen = (open: boolean | ((prev: boolean) => boolean)) => {
    const value = typeof open === 'function' ? open(isProfileOpen) : open;
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('view-profile', 'true');
      params.delete('edit-profile');
    } else {
      params.delete('view-profile');
    }
    setSearchParams(params);
  };

  const setIsCredentialsOpen = (open: boolean | ((prev: boolean) => boolean)) => {
    const value = typeof open === 'function' ? open(isCredentialsOpen) : open;
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('edit-profile', 'true');
      params.delete('view-profile');
    } else {
      params.delete('edit-profile');
    }
    setSearchParams(params);
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
    enabled: isProfileOpen || isCredentialsOpen,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };


  return (
    <div className="min-h-screen bg-[#0F1523] text-slate-200 flex">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modal Perfil Usuario*/}
      <UserProfileModal 
        isOpen={isProfileOpen}
        setIsOpen={setIsProfileOpen}
        setIsCredentialsOpen={setIsCredentialsOpen}
        profile={profile}
        isLoading={isLoading}
        role={role}
      />
 
      {/* Change Credentials Modal */}
      <ChangeCredentialsModal 
        isOpen={isCredentialsOpen}
        setIsOpen={setIsCredentialsOpen}
        profile={profile}
      />

      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        role={role}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
            LibManager
          </h1>
          
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 border border-slate-700 shadow-sm"
          />
        </header>

        {/* Topbar (Desktop) */}
        <header className="hidden md:flex bg-[#0F1523]/80 backdrop-blur-md border-b border-slate-800 p-6 items-center justify-between sticky top-0 z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Panel de Control</h2>
          </div>
          <div className="flex items-center space-x-6">
            <div 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center space-x-3 border-r border-slate-800 pr-6 cursor-pointer group"
            >
              <div className="text-right">
                <div className="max-w-[180px] overflow-hidden">
                  <p className="text-sm font-bold text-white leading-none group-hover:text-blue-400 transition-colors truncate">
                    {JSON.parse(localStorage.getItem('user') || '{}').name || 'Usuario'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold border border-slate-700 shadow-lg transform group-hover:scale-105 transition-all">
                <UserIcon className='w-6 h-6' />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0F1523]">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}