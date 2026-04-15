import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  LogOut, Bell, User, Menu, ChevronDown,
  Circle, Coffee, Users,
} from 'lucide-react';
import api from '../services/api';

const STATUTS = [
  { key: 'DISPONIBLE', label: 'Disponible',  icon: <Circle size={10} className="fill-emerald-500 text-emerald-500"/>, dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { key: 'EN_PAUSE',   label: 'En pause',    icon: <Coffee   size={10} className="text-amber-500"/>,                  dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200'  },
  { key: 'REUNION',    label: 'Réunion',     icon: <Users    size={10} className="text-rose-500"/>,                   dot: 'bg-rose-500',   text: 'text-rose-700',   bg: 'bg-rose-50   border-rose-200'   },
];

export const FonctionnaireLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  useWebSocket();

  const [statut, setStatut]         = useState('DISPONIBLE');
  const [statutOpen, setStatutOpen] = useState(false);
  const statutRef                   = useRef<HTMLDivElement>(null);

  // Load saved presence status on mount
  useEffect(() => {
    if (!user?.id) return;
    api.get(`/admin/users`).then(res => {
      const me = (res.data as any[]).find((u: any) => u.id === user.id);
      if (me?.statutPresence) setStatut(me.statutPresence);
    }).catch(() => {});
  }, [user?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (statutRef.current && !statutRef.current.contains(e.target as Node))
        setStatutOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleStatut = async (key: string) => {
    setStatut(key);
    setStatutOpen(false);
    if (user?.id) {
      await api.put(`/admin/users/${user.id}/statut-presence`, { statut: key }).catch(() => {});
    }
  };

  const current = STATUTS.find(s => s.key === statut) ?? STATUTS[0];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      {/* ── Top navbar ── */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/fonctionnaire')}>
            <Menu className="text-gray-500 mr-1" size={20} />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold text-red-600 uppercase">Fondation</span>
              <span className="text-[10px] font-bold text-blue-700 uppercase">Hassan II</span>
            </div>
          </div>

          {/* Service chip */}
          <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-semibold text-blue-700">{user?.serviceNom ?? 'Mon Service'}</span>
          </div>
        </div>

        {/* Right: status + bell + avatar */}
        <div className="flex items-center gap-3">
          {/* ── Statut présence ── */}
          <div ref={statutRef} className="relative">
            <button
              onClick={() => setStatutOpen(o => !o)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${current.bg} ${current.text}`}
            >
              <span className={`w-2 h-2 rounded-full ${current.dot} ${statut === 'DISPONIBLE' ? 'animate-pulse' : ''}`}/>
              {current.label}
              <ChevronDown size={12} className={`transition-transform ${statutOpen ? 'rotate-180' : ''}`}/>
            </button>

            {statutOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                {STATUTS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => handleStatut(s.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${statut === s.key ? 'bg-gray-50' : ''}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`}/>
                    <span className={s.text}>{s.label}</span>
                    {statut === s.key && <span className="ml-auto text-[10px] text-gray-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bell */}
          <div className="relative cursor-pointer text-gray-400 hover:text-blue-600">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">!</span>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-700 leading-tight">{user?.nomComplet}</p>
              <p className="text-[10px] text-gray-400">Fonctionnaire</p>
            </div>
            <div className="relative group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white cursor-pointer border border-gray-200">
                <User size={16} />
              </div>
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 hidden group-hover:block">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-800">{user?.nomComplet}</p>
                  <p className="text-[10px] text-gray-400">{user?.serviceNom}</p>
                </div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={13}/> Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
