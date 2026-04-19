import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { User, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const ROLE_ROUTES: Record<string, string> = {
  ADMIN:        '/admin',
  AGENT:        '/agent',
  FONCTIONNAIRE:'/fonctionnaire',
  RESPONSABLE:  '/responsable',
  DIRECTEUR:    '/directeur',
};

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const setAuth  = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      const u   = res.data;

      setAuth(
        {
          id:         u.id,
          username:   u.username,
          nomComplet: u.nomComplet,
          role:       u.role,
          serviceId:  u.serviceId  ?? undefined,
          serviceNom: u.serviceNom ?? undefined,
        },
        'session-token'
      );

      const route = ROLE_ROUTES[u.role];
      if (route) {
        navigate(route);
      } else {
        setError('Rôle non reconnu.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (err?.response?.status === 401) {
        setError(msg ?? 'Identifiants incorrects.');
      } else if (err?.response?.status === 403) {
        setError(msg ?? 'Compte désactivé. Contactez l\'administrateur.');
      } else {
        setError('Erreur de connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-5xl w-full border border-gray-200 min-h-[500px]">

        {/* Left: Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center border-r border-gray-100 bg-white">
          <div className="w-full max-w-sm">
            <h1 className="text-4xl font-bold text-[#334155] text-center mb-1">Login</h1>
            <p className="text-gray-500 text-center mb-10 text-sm italic">Veuillez vous identifier</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-lg mb-5">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md w-12 justify-center transition-colors group-focus-within:text-blue-500">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="block w-full pl-14 pr-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm shadow-sm transition-all disabled:bg-gray-50"
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
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="block w-full pl-14 pr-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm shadow-sm transition-all disabled:bg-gray-50"
                  placeholder="Mot de passe"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#334155] text-white py-3.5 rounded-md font-bold hover:bg-[#1e293b] transition-all flex items-center justify-center gap-2 mt-8 uppercase text-xs tracking-widest shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Connexion…</>
                  : <><LogIn size={18} /> Connexion</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* Right: Info */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center bg-white">
          <div className="mb-8 w-full flex justify-center">
            <img 
              src="/logoarfr.jpg?v=3" 
              alt="Logo Fondation" 
              className="w-72" 
            />
          </div>

          <h2 className="text-[#0f172a] font-bold text-center text-xl max-w-sm leading-tight mt-4">
            Bienvenue dans l'application de gestion des adhérents de la Fondation Hassan 2
          </h2>
        </div>
      </div>
    </div>
  );
};
