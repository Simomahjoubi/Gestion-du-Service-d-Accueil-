import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { User, Lock, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // MOCK LOGIN FOR NOW - Identical logic, but new UI
    if (username === 'agent') {
      setAuth({ username: 'agent_user', nomComplet: 'Agent Accueil', role: 'AGENT' }, 'mock-token');
      navigate('/agent');
    } else if (username === 'staff') {
      setAuth({ id: 1, username: 'ahmed.benali', nomComplet: 'Ahmed Benali', role: 'FONCTIONNAIRE', serviceId: 1, serviceNom: 'simo' }, 'mock-token');
      navigate('/fonctionnaire');
    } else if (username === 'admin') {
      setAuth({ username: 'admin_user', nomComplet: 'Administrateur Système', role: 'ADMIN' }, 'mock-token');
      navigate('/admin');
    } else if (username === 'chef') {
      setAuth({ username: 'chef_user', nomComplet: 'Responsable de Service', role: 'RESPONSABLE', serviceId: 1 }, 'mock-token');
      navigate('/responsable');
    } else if (username === 'directeur') {
      setAuth({ username: 'dir_user', nomComplet: 'Directeur Général', role: 'DIRECTEUR' }, 'mock-token');
      navigate('/directeur');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-5xl w-full border border-gray-200 min-h-[500px]">
        
        {/* Left Side: Login Form - Centered Content */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center border-r border-gray-100 bg-white">
          <div className="w-full max-w-sm">
            <h1 className="text-4xl font-bold text-[#334155] text-center mb-1">Login</h1>
            <p className="text-gray-500 text-center mb-10 text-sm italic">Veuillez vous identifier</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md w-12 justify-center transition-colors group-focus-within:text-blue-500">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-14 pr-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm shadow-sm transition-all"
                  placeholder="Login"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md w-12 justify-center transition-colors group-focus-within:text-blue-500">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm shadow-sm transition-all"
                  placeholder="Mot de passe"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#334155] text-white py-3.5 rounded-md font-bold hover:bg-[#1e293b] transition-all flex items-center justify-center gap-2 mt-8 uppercase text-xs tracking-widest shadow-lg shadow-slate-200"
              >
                Connexion <LogIn size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Info & Logo */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center bg-white">
          {/* Logo Placeholder - Representing the FH2 Logo in login.PNG */}
          <div className="mb-8 flex flex-col items-center">
             <div className="flex items-center gap-2 mb-4 text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Royaume du Maroc</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">المملكة المغربية</span>
             </div>
             <div className="text-2xl font-black text-red-600 tracking-tighter flex flex-col items-center">
                <span className="text-lg">FONDATION HASSAN II</span>
                <span className="text-sm font-arabic font-bold text-blue-700">مؤسسة الحسن الثاني</span>
             </div>
             <div className="mt-2 text-[8px] text-gray-400 text-center max-w-[200px]">
                pour les œuvres sociales des agents d'autorité et des fonctionnaires du Ministère de l'Intérieur
             </div>
          </div>
          
          <h2 className="text-[#0f172a] font-bold text-center text-lg max-w-xs leading-tight mt-4">
            Bienvenue dans l'application de gestion des adhérents de la Fondation Hassan 2
          </h2>
        </div>
      </div>
    </div>
  );
};
