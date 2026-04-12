import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { LogOut, Bell, ClipboardList } from 'lucide-react';

export const FonctionnaireLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Activate real-time notifications
  useWebSocket();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold border-b border-slate-600 pb-2">FH2 Staff</h2>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg text-white">
            <ClipboardList size={20} /> Ma File d'attente
          </div>
        </nav>
        <div className="p-4 border-t border-slate-600">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-600 rounded-lg transition-colors text-red-100">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-800">Espace Fonctionnaire</h1>
          <div className="flex items-center gap-6">
             <div className="relative cursor-pointer text-gray-400 hover:text-primary">
                <Bell size={24} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>
             </div>
             <div className="text-sm text-gray-500">Service : <span className="font-bold text-primary">Service Social</span></div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-8">
          {children}
        </section>
      </main>
    </div>
  );
};
