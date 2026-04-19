import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LogOut,
  Home,
  Users,
  Search,
  ChevronDown,
  Menu,
  LayoutGrid,
  UserCog,
  BookOpen,
  BadgeCheck,
} from 'lucide-react';
import { CATEGORIE_LABELS, ALL_CATEGORIES, ReferenceCategorie } from '../services/referenceService';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [refOpen, setRefOpen] = useState(false);
  const refRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (refRef.current && !refRef.current.contains(e.target as Node)) {
        setRefOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      {/* Top Navigation Bar - Inspired by app.PNG */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
             <Menu className="text-gray-500 mr-2" size={20} />
             <img src="/logoarfr.jpg" alt="Logo Fondation" className="h-12 w-auto" />
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <NavItem icon={<Home size={16}/>} label="Tableau de bord" active={location.pathname === '/admin'} onClick={() => navigate('/admin')} />
            <NavItem icon={<Users size={16}/>} label="Adhérents" active={location.pathname === '/admin/adherents'} onClick={() => navigate('/admin/adherents')} />
            <NavItem icon={<UserCog size={16}/>} label="Comptes" active={location.pathname === '/admin/comptes'} onClick={() => navigate('/admin/comptes')} />
            <NavItem icon={<LayoutGrid size={16}/>} label="Services & Motifs" active={location.pathname === '/admin/services'} onClick={() => navigate('/admin/services')} />
            <NavItem icon={<BadgeCheck size={16}/>} label="Badges" active={location.pathname === '/admin/badges'} onClick={() => navigate('/admin/badges')} />

            {/* Dropdown Références */}
            <div ref={refRef} className="relative">
              <div
                onClick={() => setRefOpen(o => !o)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  location.pathname === '/admin/references'
                    ? 'bg-gray-100 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen size={16} />
                <span className="text-[13px]">Références</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform ${refOpen ? 'rotate-180' : ''}`} />
              </div>
              {refOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50">
                  {ALL_CATEGORIES.map((cat: ReferenceCategorie) => (
                    <button
                      key={cat}
                      onClick={() => {
                        navigate(`/admin/references?categorie=${cat}`);
                        setRefOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {CATEGORIE_LABELS[cat]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-full max-w-lg">
            <input 
              type="text" 
              placeholder="Chercher..." 
              className="w-full bg-gray-100 border-none rounded-md py-1.5 pl-9 pr-12 text-sm focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            <span className="absolute right-3 top-1.5 text-[10px] bg-white border border-gray-300 rounded px-1 py-0.5 text-gray-400">⌘+K</span>
          </div>

          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-700 leading-tight">Admin</p>
                <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                   En ligne
                </div>
             </div>
             <div className="relative group">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white cursor-pointer overflow-hidden border border-gray-200">
                   <Users size={18} />
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 hidden group-hover:block">
                   <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-800">{user?.nomComplet}</p>
                      <p className="text-[10px] text-gray-500">{user?.role}</p>
                   </div>
                   <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={14} /> Déconnexion
                   </button>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
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

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, hasDropdown?: boolean, onClick?: () => void }> = ({ icon, label, active, hasDropdown, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${active ? 'bg-gray-100 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
  >
    {icon}
    <span className="text-[13px]">{label}</span>
    {hasDropdown && <ChevronDown size={12} className="text-gray-400" />}
  </div>
);
