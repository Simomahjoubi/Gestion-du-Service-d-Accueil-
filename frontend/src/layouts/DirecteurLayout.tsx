import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, LayoutDashboard, User, Bell, Crown } from 'lucide-react';

export const DirecteurLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { path: '/directeur', label: 'Analytique Globale', icon: <LayoutDashboard size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/directeur')}>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold text-red-600 uppercase">Fondation</span>
              <span className="text-[10px] font-bold text-blue-700 uppercase">Hassan II</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-full px-3 py-1">
            <Crown size={12} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Direction Générale</span>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-100 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}{item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer text-gray-400 hover:text-blue-600">
            <Bell size={20} />
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-700 leading-tight">{user?.nomComplet}</p>
              <p className="text-[10px] text-amber-600 font-semibold">Directeur</p>
            </div>
            <div className="relative group">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white cursor-pointer border border-gray-200">
                <User size={16} />
              </div>
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 hidden group-hover:block z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-800">{user?.nomComplet}</p>
                  <p className="text-[10px] text-gray-400">Direction Générale</p>
                </div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={13} /> Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};
