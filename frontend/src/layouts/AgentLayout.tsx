import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LogOut,
  Home,
  UserPlus,
  Key,
  Search,
  Menu,
  User,
  Bell,
} from 'lucide-react';

export const AgentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      {/* Top Navigation Bar - Inspired by app.PNG */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/agent')}>
             <Menu className="text-gray-500 mr-2" size={20} />
             <img src="/logoarfr.jpg" alt="Logo Fondation" className="h-12 w-auto" />
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <NavItem 
              icon={<Home size={16}/>} 
              label="Dashboard" 
              active={isActive('/agent')} 
              onClick={() => navigate('/agent')} 
            />
            <NavItem 
              icon={<UserPlus size={16}/>} 
              label="Nouvelle Visite" 
              active={isActive('/agent/nouvelle-visite')} 
              onClick={() => navigate('/agent/nouvelle-visite')} 
            />
            <NavItem
              icon={<Key size={16}/>}
              label="Restitution Badge"
              active={isActive('/agent/restitution')}
              onClick={() => navigate('/agent/restitution')}
            />
          </nav>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-full max-w-lg">
            <input 
              type="text" 
              placeholder="Chercher une visite..." 
              className="w-full bg-gray-100 border-none rounded-md py-1.5 pl-9 pr-12 text-sm focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
             <div className="relative cursor-pointer text-gray-400 hover:text-blue-600">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
             </div>
             
             <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-bold text-gray-700 leading-tight">Agent</p>
                   <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      En ligne
                   </div>
                </div>
                <div className="relative group">
                   <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white cursor-pointer overflow-hidden border border-gray-200">
                      <User size={18} />
                   </div>
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 hidden group-hover:block">
                      <div className="px-4 py-2 border-b border-gray-100">
                         <p className="text-xs font-bold text-gray-800">{user?.nomComplet}</p>
                         <p className="text-[10px] text-gray-500">Agent d'accueil</p>
                      </div>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                         <LogOut size={14} /> Déconnexion
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 w-full">
        {children}
      </main>

      {/* Footer Institutionnel */}
      <footer className="py-4 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[#64748b]">
          <p className="text-[12px] font-medium tracking-wide">
            Fondation Hassan II pour les Œuvres Sociales
          </p>
          <p className="text-[12px] font-semibold tracking-tight">
            FH2_Service_informatique <span className="mx-1">Copyright 2026</span> Devlabs
          </p>
        </div>
      </footer>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
      active 
        ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="text-[13px]">{label}</span>
  </div>
);
