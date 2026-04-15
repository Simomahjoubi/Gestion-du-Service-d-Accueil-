import React, { useState, useEffect, useCallback } from 'react';
import {
  BadgeCheck, BadgeX, Search, RefreshCw, X, CheckCircle2,
  User, Shield, Clock, Tag, Building2,
  Unlock, Layers,
} from 'lucide-react';
import { badgeService, BadgeDetail, ServiceBadgeStat } from '../../services/badgeService';

// ─── Palette service ──────────────────────────────────────────────────────────
const SERVICE_COLORS = [
  'from-blue-600 to-blue-500',
  'from-violet-600 to-violet-500',
  'from-rose-600 to-rose-500',
  'from-amber-600 to-amber-500',
  'from-teal-600 to-teal-500',
  'from-pink-600 to-pink-500',
  'from-indigo-600 to-indigo-500',
  'from-green-600 to-green-500',
];

const SERVICE_LIGHT = [
  { border: 'border-blue-200',   tag: 'bg-blue-100 text-blue-700'   },
  { border: 'border-violet-200', tag: 'bg-violet-100 text-violet-700'},
  { border: 'border-rose-200',   tag: 'bg-rose-100 text-rose-700'   },
  { border: 'border-amber-200',  tag: 'bg-amber-100 text-amber-700' },
  { border: 'border-teal-200',   tag: 'bg-teal-100 text-teal-700'   },
  { border: 'border-pink-200',   tag: 'bg-pink-100 text-pink-700'   },
  { border: 'border-indigo-200', tag: 'bg-indigo-100 text-indigo-700'},
  { border: 'border-green-200',  tag: 'bg-green-100 text-green-700' },
];

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Libérer confirmation ─────────────────────────────────────────────────────
const LiberConfirm: React.FC<{
  badge: BadgeDetail;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ badge, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-400 p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Unlock size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold">Libérer le badge</h3>
          <p className="text-white/70 text-xs">Cette action est irréversible</p>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-sm font-bold text-gray-800 mb-3">{badge.code} — {badge.serviceNom}</p>
          <div className="space-y-1.5 text-[12px] text-gray-600">
            <p><span className="text-gray-400">Visiteur :</span> <span className="font-semibold">{badge.visiteurNom ?? '—'}</span></p>
            <p><span className="text-gray-400">Personnel :</span> <span className="font-semibold">{badge.staffNom ?? '—'}</span></p>
            <p><span className="text-gray-400">Depuis :</span> <span className="font-semibold">{formatDate(badge.dateOccupation)}</span></p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-5 text-center">
          Confirmez-vous que le visiteur a bien restitué le badge <span className="font-bold text-gray-800">{badge.code}</span> ?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-500 flex items-center justify-center gap-2"
          >
            <Unlock size={14} /> Libérer
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Badge card (agent view) ──────────────────────────────────────────────────
const AgentBadgeCard: React.FC<{
  badge: BadgeDetail;
  svcColorIdx: number;
  onLiberer: (b: BadgeDetail) => void;
}> = ({ badge, svcColorIdx, onLiberer }) => {
  const free  = badge.statut === 'DISPONIBLE';
  const light = SERVICE_LIGHT[svcColorIdx % SERVICE_LIGHT.length];

  return (
    <div className={`relative bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
      free ? 'border-emerald-200 hover:border-emerald-400' : 'border-rose-200 hover:border-rose-300'
    }`}>
      <div className={`h-1.5 rounded-t-xl ${free ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`} />

      <div className="p-4">
        {/* Badge code + service tag */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${SERVICE_COLORS[svcColorIdx % SERVICE_COLORS.length]} flex items-center justify-center shadow-sm`}>
              <Tag size={15} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">{badge.code}</p>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${light.tag}`}>
                {badge.serviceNom}
              </span>
            </div>
          </div>
        </div>

        {/* Status + info */}
        {free ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl mb-3">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-emerald-700">Disponible</span>
          </div>
        ) : (
          <div className="space-y-1.5 mb-3">
            <AgentInfoRow icon={<User size={11} />} label="Visiteur" value={badge.visiteurNom ?? '—'} />
            <AgentInfoRow icon={<Shield size={11} />} label="Personnel" value={badge.staffNom ?? '—'} />
            <AgentInfoRow icon={<Clock size={11} />} label="Depuis" value={formatDate(badge.dateOccupation)} />
          </div>
        )}

        {/* Libérer button (only for occupied) */}
        {!free && (
          <button
            onClick={() => onLiberer(badge)}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <Unlock size={12} /> Libérer le badge
          </button>
        )}
      </div>
    </div>
  );
};

const AgentInfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-[11px]">
    <span className="text-gray-400 shrink-0">{icon}</span>
    <span className="text-gray-400 w-14 shrink-0">{label}</span>
    <span className="text-gray-700 font-medium truncate">{value}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const BadgesPage: React.FC = () => {
  const [badges, setBadges]       = useState<BadgeDetail[]>([]);
  const [stats, setStats]         = useState<ServiceBadgeStat[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterSvc, setFilterSvc] = useState<number | null>(null);
  const [filterStat, setFilterStat] = useState<'ALL' | 'DISPONIBLE' | 'OCCUPE'>('ALL');
  const [liberPending, setLiberPending] = useState<BadgeDetail | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([badgeService.getAll(), badgeService.getStats()]);
      setBadges(b);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLiberer = async () => {
    if (!liberPending) return;
    try {
      await badgeService.liberer(liberPending.id);
      setLiberPending(null);
      load();
    } catch {
      alert('Erreur lors de la libération du badge.');
    }
  };

  // ── Build service→colorIndex map ──
  const svcColorMap = Object.fromEntries(
    stats.map((s, i) => [s.serviceId, i])
  );

  // ── Filter ──
  const filtered = badges.filter(b => {
    if (filterSvc != null && b.serviceId !== filterSvc) return false;
    if (filterStat === 'DISPONIBLE' && b.statut !== 'DISPONIBLE') return false;
    if (filterStat === 'OCCUPE'     && b.statut === 'DISPONIBLE') return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.code.toLowerCase().includes(q) &&
          !(b.visiteurNom ?? '').toLowerCase().includes(q) &&
          !(b.serviceNom ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const libres  = badges.filter(b => b.statut === 'DISPONIBLE').length;
  const occupes = badges.filter(b => b.statut !== 'DISPONIBLE').length;

  return (
    <div className="p-6 min-h-screen bg-[#f8f9fa]">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
          <BadgeCheck size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Suivi des Badges</h1>
          <p className="text-xs text-gray-400">Vue temps réel — libres et occupés</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={load}
            className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Layers size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{badges.length}</p>
            <p className="text-xs text-gray-500">Total badges</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-emerald-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{libres}</p>
            <p className="text-xs text-gray-500">Disponibles</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-rose-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
            <BadgeX size={20} className="text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-700">{occupes}</p>
            <p className="text-xs text-gray-500">Occupés</p>
          </div>
        </div>
      </div>

      {/* ── Service summary pills ── */}
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterSvc(null)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-colors ${
              filterSvc === null ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            Tous les services
          </button>
          {stats.map((s, i) => {
            const col = SERVICE_COLORS[i % SERVICE_COLORS.length];
            const active = filterSvc === s.serviceId;
            return (
              <button
                key={s.serviceId}
                onClick={() => setFilterSvc(active ? null : s.serviceId)}
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all ${
                  active
                    ? `bg-gradient-to-r ${col} text-white border-transparent shadow-sm`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <Building2 size={10} />
                {s.serviceNom}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {s.libres}L / {s.occupes}O
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par code, visiteur, service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
          {(['ALL', 'DISPONIBLE', 'OCCUPE'] as const).map(v => (
            <button
              key={v}
              onClick={() => setFilterStat(v)}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                filterStat === v
                  ? v === 'DISPONIBLE'
                    ? 'bg-emerald-500 text-white'
                    : v === 'OCCUPE'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {v === 'ALL' ? 'Tous' : v === 'DISPONIBLE' ? 'Libres' : 'Occupés'}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 ml-auto">
          {filtered.length} badge{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <RefreshCw size={32} className="animate-spin mb-3" />
          <p className="text-sm">Chargement…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BadgeCheck size={48} className="mb-3 opacity-30" />
          <p className="text-base font-medium">Aucun badge trouvé</p>
          <p className="text-sm mt-1">Modifiez vos filtres ou actualisez la page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(b => (
            <AgentBadgeCard
              key={b.id}
              badge={b}
              svcColorIdx={svcColorMap[b.serviceId ?? 0] ?? 0}
              onLiberer={setLiberPending}
            />
          ))}
        </div>
      )}

      {/* ── Libérer modal ── */}
      {liberPending && (
        <LiberConfirm
          badge={liberPending}
          onConfirm={handleLiberer}
          onCancel={() => setLiberPending(null)}
        />
      )}
    </div>
  );
};
