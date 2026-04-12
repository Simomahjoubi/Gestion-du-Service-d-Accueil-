import React from 'react';
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
  UserCog
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

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
             <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-red-600 uppercase">Fondation</span>
                <span className="text-[10px] font-bold text-blue-700 uppercase">Hassan II</span>
             </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <NavItem icon={<Home size={16}/>} label="Tableau de bord" active={location.pathname === '/admin'} onClick={() => navigate('/admin')} />
            <NavItem icon={<Users size={16}/>} label="Adhérents" active={location.pathname === '/admin/adherents'} onClick={() => navigate('/admin/adherents')} />
            <NavItem icon={<UserCog size={16}/>} label="Comptes" active={location.pathname === '/admin/comptes'} onClick={() => navigate('/admin/comptes')} />
            <NavItem icon={<LayoutGrid size={16}/>} label="Services & Motifs" active={location.pathname === '/admin/services'} onClick={() => navigate('/admin/services')} />
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
