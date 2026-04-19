import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  LogOut, Bell, User, Menu, Coffee, Users, Calendar, Wifi, WifiOff, X, Activity,
} from 'lucide-react';
import api from '../services/api';
import { referenceService } from '../services/referenceService';

// ─── Config statique pour statuts connus ─────────────────────────────────────
const KNOWN_STATUTS: Record<string, {
  label: string; desc: string; icon: React.ReactNode;
  dot: string; text: string; bg: string; card: string;
}> = {
  EN_PAUSE: {
    label: 'En pause', desc: 'Pause courte',
    icon: <Coffee size={22} className="text-amber-500" />,
    dot: 'bg-amber-400', text: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    card: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
  },
  REUNION: {
    label: 'Réunion', desc: 'En réunion de service',
    icon: <Users size={22} className="text-rose-500" />,
    dot: 'bg-rose-500', text: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    card: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50',
  },
  CONGE: {
    label: 'Congé', desc: 'Absent / en congé',
    icon: <Calendar size={22} className="text-gray-400" />,
    dot: 'bg-gray-400', text: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    card: 'border-gray-200 hover:border-gray-400 hover:bg-gray-50',
  },
};

const EN_LIGNE_CFG = {
  dot: 'bg-emerald-500',
  text: 'text-emerald-700',
  bg: 'bg-emerald-50 border-emerald-200',
  label: 'En ligne',
};

const HORS_LIGNE_CFG = {
  dot: 'bg-gray-400',
  text: 'text-gray-600',
  bg: 'bg-gray-50 border-gray-200',
  label: 'Hors ligne',
};

interface PresenceReason {
  key: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  dot: string;
  text: string;
  bg: string;
  card: string;
}

const FALLBACK_REASONS: PresenceReason[] = [
  { key: 'EN_PAUSE', ...KNOWN_STATUTS.EN_PAUSE },
  { key: 'REUNION', ...KNOWN_STATUTS.REUNION },
  { key: 'CONGE',   ...KNOWN_STATUTS.CONGE   },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const FonctionnaireLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  useWebSocket();

  const [statut, setStatut]                 = useState('HORS_LIGNE');
  const [showModal, setShowModal]           = useState(false);
  const [offlineReasons, setOfflineReasons] = useState<PresenceReason[]>(FALLBACK_REASONS);
  const avatarRef                           = useRef<HTMLDivElement>(null);

  // ── Charger les statuts depuis la référentielle ───────────────────────────
  useEffect(() => {
    referenceService.getByCategorie('STATUT_PRESENCE')
      .then(refs => {
        const reasons: PresenceReason[] = refs
          .filter(r => r.valeur !== 'EN_LIGNE' && r.valeur !== 'HORS_LIGNE')
          .sort((a, b) => a.ordre - b.ordre)
          .map(r => {
            const known = KNOWN_STATUTS[r.valeur];
            if (known) return { key: r.valeur, ...known };
            // Statut personnalisé ajouté par l'administrateur
            const label = r.description || r.valeur.replace(/_/g, ' ');
            return {
              key: r.valeur,
              label,
              desc: r.description || '',
              icon: <Activity size={22} className="text-purple-500" />,
              dot: 'bg-purple-400',
              text: 'text-purple-700',
              bg: 'bg-purple-50 border-purple-200',
              card: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
            };
          });
        if (reasons.length > 0) setOfflineReasons(reasons);
      })
      .catch(() => {}); // garder le fallback en cas d'erreur
  }, []);

  const getStatusCfg = (s: string) => {
    if (s === 'EN_LIGNE')   return EN_LIGNE_CFG;
    if (s === 'HORS_LIGNE') return HORS_LIGNE_CFG;
    return offlineReasons.find(r => r.key === s) ?? HORS_LIGNE_CFG;
  };

  // ── Au montage : passer EN_LIGNE automatiquement ──────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    api.put(`/admin/users/${user.id}/statut-presence`, { statut: 'EN_LIGNE' })
      .then(() => setStatut('EN_LIGNE'))
      .catch(() => setStatut('EN_LIGNE')); // optimistic
  }, [user?.id]);

  // ── Passer hors ligne au fermeture/navigation (best-effort) ──────────────
  useEffect(() => {
    const handleUnload = () => {
      if (user?.id) {
        navigator.sendBeacon(`/api/admin/users/${user.id}/statut-presence`,
          JSON.stringify({ statut: 'HORS_LIGNE' }));
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user?.id]);

  const updateStatut = async (key: string) => {
    if (!user?.id) return;
    setStatut(key);
    setShowModal(false);
    await api.put(`/admin/users/${user.id}/statut-presence`, { statut: key }).catch(() => {});
  };

  const handleStatusClick = () => {
    if (statut === 'EN_LIGNE') {
      setShowModal(true); // demander le motif
    } else {
      updateStatut('EN_LIGNE'); // retour direct en ligne
    }
  };

  const handleLogout = async () => {
    if (user?.id) {
      await api.put(`/admin/users/${user.id}/statut-presence`, { statut: 'HORS_LIGNE' }).catch(() => {});
    }
    logout();
    navigate('/login');
  };

  const cfg = getStatusCfg(statut);
  const isOnline = statut === 'EN_LIGNE';

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">

      {/* ── Top navbar ── */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
        {/* Left */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/fonctionnaire')}>
            <Menu className="text-gray-500 mr-1" size={20} />
            <img src="/logoarfr.jpg?v=2" alt="Logo Fondation" className="h-12 w-auto" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-blue-700">{user?.serviceNom ?? 'Mon Service'}</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* ── Bouton statut ── */}
          <button
            onClick={handleStatusClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${cfg.bg} ${cfg.text}`}
            title={isOnline ? 'Cliquer pour passer hors ligne' : 'Cliquer pour revenir en ligne'}
          >
            <span className={`w-2 h-2 rounded-full ${cfg.dot} ${isOnline ? 'animate-pulse' : ''}`} />
            {cfg.label}
            {isOnline
              ? <WifiOff size={12} className="ml-1 opacity-60" />
              : <Wifi    size={12} className="ml-1 opacity-60" />
            }
          </button>

          {/* Bell */}
          <div className="relative cursor-pointer text-gray-400 hover:text-blue-600">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">!</span>
          </div>

          {/* Avatar */}
          <div ref={avatarRef} className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-700 leading-tight">{user?.nomComplet}</p>
              <p className="text-[10px] text-gray-400">Fonctionnaire</p>
            </div>
            <div className="relative group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white cursor-pointer border border-gray-200">
                <User size={16} />
              </div>
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 hidden group-hover:block z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-800">{user?.nomComplet}</p>
                  <p className="text-[10px] text-gray-400">{user?.serviceNom}</p>
                </div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={13} /> Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
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

      {/* ── Modal motif hors ligne ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-800 text-base">Passer hors ligne</p>
                <p className="text-xs text-gray-400 mt-0.5">Sélectionnez un motif d'absence</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-xl">
                <X size={16} />
              </button>
            </div>

            {/* Options — chargées dynamiquement depuis la référentielle */}
            <div className="p-5 space-y-3">
              {offlineReasons.map(r => (
                <button
                  key={r.key}
                  onClick={() => updateStatut(r.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${r.card}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.bg}`}>
                    {r.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${r.text}`}>{r.label}</p>
                    {r.desc && <p className="text-[11px] text-gray-400">{r.desc}</p>}
                  </div>
                  <span className={`ml-auto w-2.5 h-2.5 rounded-full ${r.dot}`} />
                </button>
              ))}
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
