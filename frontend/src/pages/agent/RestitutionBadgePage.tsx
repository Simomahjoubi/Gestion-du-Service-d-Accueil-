import React, { useState, useEffect, useCallback } from 'react';
import {
  Key, Search, X, RefreshCw, CheckCircle2, Clock,
  LogOut, User, Shield, Tag, Building2, BadgeCheck,
  BadgeX, Layers, Unlock,
} from 'lucide-react';
import { badgeService, BadgeDetail, ServiceBadgeStat } from '../../services/badgeService';

// ─── Palette service ──────────────────────────────────────────────────────────
const SVC_GRAD = [
  'from-blue-600 to-blue-500',   'from-violet-600 to-violet-500',
  'from-rose-600 to-rose-500',   'from-amber-600 to-amber-500',
  'from-teal-600 to-teal-500',   'from-pink-600 to-pink-500',
  'from-indigo-600 to-indigo-500','from-green-600 to-green-500',
];
const SVC_TAG = [
  'bg-blue-100 text-blue-700',   'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',   'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',   'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700','bg-green-100 text-green-700',
];

function fmtDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Confirmation modal ───────────────────────────────────────────────────────
const ConfirmLiberer: React.FC<{
  badge: BadgeDetail;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ badge, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Unlock size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold">Restituer le badge</h3>
          <p className="text-white/70 text-xs">Confirmez la restitution physique</p>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 space-y-1.5 text-[12px] text-gray-600">
          <p className="text-sm font-bold text-gray-800 mb-2">{badge.code} — {badge.serviceNom}</p>
          <p><span className="text-gray-400">Visiteur :</span> <span className="font-semibold">{badge.visiteurNom ?? '—'}</span></p>
          <p><span className="text-gray-400">Personnel :</span> <span className="font-semibold">{badge.staffNom ?? '—'}</span></p>
          <p><span className="text-gray-400">Depuis :</span> <span className="font-semibold">{fmtDate(badge.dateOccupation)}</span></p>
        </div>
        <p className="text-sm text-gray-500 mb-5 text-center">
          Le visiteur a bien rendu le badge <span className="font-bold text-gray-800">{badge.code}</span> ?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold hover:from-emerald-700 hover:to-emerald-600 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Unlock size={14} />}
            {loading ? 'Traitement…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Badge card ───────────────────────────────────────────────────────────────
const BadgeCard: React.FC<{
  badge: BadgeDetail;
  svcIdx: number;
  onRestituer: (b: BadgeDetail) => void;
}> = ({ badge, svcIdx, onRestituer }) => {
  const grad = SVC_GRAD[svcIdx % SVC_GRAD.length];
  const tag  = SVC_TAG[svcIdx % SVC_TAG.length];
  const free = badge.statut === 'DISPONIBLE';
  const pret = badge.statut === 'PRET_A_RESTITUER';

  return (
    <div className={`relative bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
      free ? 'border-gray-150 opacity-70 hover:opacity-90' :
      pret ? 'border-emerald-300 shadow-emerald-100 shadow-md ring-2 ring-emerald-400 ring-offset-1' :
             'border-rose-200 hover:border-rose-300'
    }`}>
      {/* Top stripe */}
      <div className={`h-1.5 rounded-t-xl ${
        free ? 'bg-gradient-to-r from-gray-200 to-gray-300' :
        pret ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
               'bg-gradient-to-r from-rose-400 to-rose-500'
      }`} />

      {pret && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
          À restituer
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm`}>
              <Tag size={15} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">{badge.code}</p>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${tag}`}>
                {badge.serviceNom}
              </span>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
            free ? 'bg-gray-100 text-gray-500' :
            pret ? 'bg-emerald-100 text-emerald-700' :
                   'bg-rose-100 text-rose-700'
          }`}>
            {free ? 'Libre' : pret ? 'Prêt' : 'Occupé'}
          </span>
        </div>

        {/* Content */}
        {free ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <CheckCircle2 size={13} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400">Badge disponible</span>
          </div>
        ) : (
          <>
            <div className="space-y-1.5 mb-3">
              <InfoRow icon={<User size={11}/>}   label="Visiteur"   value={badge.visiteurNom ?? '—'} />
              <InfoRow icon={<Shield size={11}/>} label="Personnel"  value={badge.staffNom ?? '—'} />
              <InfoRow icon={<Clock size={11}/>}  label="Depuis"     value={fmtDate(badge.dateOccupation)} />
            </div>

            <button
              onClick={() => onRestituer(badge)}
              disabled={!pret}
              className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                pret
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={pret ? 'Restituer ce badge' : 'En attente de clôture par le fonctionnaire'}
            >
              <LogOut size={12} />
              {pret ? 'Restituer le badge' : 'En attente de clôture'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-[11px]">
    <span className="text-gray-400 shrink-0">{icon}</span>
    <span className="text-gray-400 w-14 shrink-0">{label}</span>
    <span className="text-gray-700 font-medium truncate">{value}</span>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const RestitutionBadgePage: React.FC = () => {
  const [badges, setBadges]     = useState<BadgeDetail[]>([]);
  const [stats, setStats]       = useState<ServiceBadgeStat[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterSvc, setFilterSvc] = useState<number | null>(null);
  const [filterStat, setFilterStat] = useState<'ALL' | 'PRET_A_RESTITUER' | 'OCCUPE' | 'DISPONIBLE'>('ALL');
  const [confirm, setConfirm]   = useState<BadgeDetail | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast]       = useState('');

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

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const svcIdx = Object.fromEntries(stats.map((s, i) => [s.serviceId, i]));

  const handleRestituer = async () => {
    if (!confirm) return;
    setConfirming(true);
    try {
      await badgeService.liberer(confirm.id);
      setToast(`Badge ${confirm.code} restitué avec succès.`);
      setConfirm(null);
      load();
    } catch {
      setToast('Erreur lors de la restitution.');
    } finally {
      setConfirming(false);
    }
  };

  const filtered = badges.filter(b => {
    if (filterSvc != null && b.serviceId !== filterSvc) return false;
    if (filterStat !== 'ALL' && b.statut !== filterStat) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.code.toLowerCase().includes(q) &&
          !(b.visiteurNom ?? '').toLowerCase().includes(q) &&
          !(b.serviceNom ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const libres  = badges.filter(b => b.statut === 'DISPONIBLE').length;
  const occupes = badges.filter(b => b.statut === 'OCCUPE').length;
  const prets   = badges.filter(b => b.statut === 'PRET_A_RESTITUER').length;

  return (
    <div className="p-6 min-h-screen bg-[#f8f9fa]">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center shadow-sm">
          <Key size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Restitution des Badges</h1>
          <p className="text-xs text-gray-400">Suivi en temps réel · libres, occupés, prêts à restituer</p>
        </div>
        <div className="ml-auto">
          <button onClick={load}
            className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Layers size={18}/>}       label="Total"       value={badges.length} color="gray"    />
        <StatCard icon={<BadgeCheck size={18}/>}   label="Libres"      value={libres}        color="gray"    />
        <StatCard icon={<BadgeX size={18}/>}       label="Occupés"     value={occupes}       color="rose"    />
        <StatCard icon={<Unlock size={18}/>}       label="À restituer" value={prets}         color="emerald" />
      </div>

      {/* ── Service pills ── */}
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <PillBtn active={filterSvc === null} onClick={() => setFilterSvc(null)} grad="">
            Tous les services
          </PillBtn>
          {stats.map((s, i) => (
            <PillBtn
              key={s.serviceId}
              active={filterSvc === s.serviceId}
              onClick={() => setFilterSvc(filterSvc === s.serviceId ? null : s.serviceId)}
              grad={SVC_GRAD[i % SVC_GRAD.length]}
            >
              <Building2 size={10} /> {s.serviceNom}
              <span className="text-[9px] opacity-70 ml-1">{s.libres}L·{s.occupes}O</span>
            </PillBtn>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Code badge, nom visiteur, service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:outline-none bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status toggle */}
        <div className="flex bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
          {(['ALL', 'DISPONIBLE', 'OCCUPE', 'PRET_A_RESTITUER'] as const).map(v => (
            <button key={v} onClick={() => setFilterStat(v)}
              className={`px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                filterStat === v
                  ? v === 'DISPONIBLE'       ? 'bg-gray-500 text-white'
                  : v === 'OCCUPE'           ? 'bg-rose-500 text-white'
                  : v === 'PRET_A_RESTITUER' ? 'bg-emerald-500 text-white'
                                             : 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}>
              {v === 'ALL' ? 'Tous' : v === 'DISPONIBLE' ? 'Libres' : v === 'OCCUPE' ? 'Occupés' : 'À restituer'}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 ml-auto">
          {filtered.length} badge{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <RefreshCw size={32} className="animate-spin mb-3" />
          <p className="text-sm">Chargement des badges…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Key size={48} className="mb-3 opacity-30" />
          <p className="text-base font-medium">Aucun badge trouvé</p>
          <p className="text-sm mt-1">Modifiez vos filtres ou actualisez.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(b => (
            <BadgeCard
              key={b.id}
              badge={b}
              svcIdx={svcIdx[b.serviceId ?? 0] ?? 0}
              onRestituer={setConfirm}
            />
          ))}
        </div>
      )}

      {/* ── Confirm modal ── */}
      {confirm && (
        <ConfirmLiberer
          badge={confirm}
          onConfirm={handleRestituer}
          onCancel={() => setConfirm(null)}
          loading={confirming}
        />
      )}
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STAT_COL: Record<string, { bg: string; icon: string; val: string }> = {
  gray:    { bg: 'bg-gray-50 border-gray-200',     icon: 'text-gray-500',    val: 'text-gray-700'    },
  rose:    { bg: 'bg-rose-50 border-rose-200',     icon: 'text-rose-500',    val: 'text-rose-700'    },
  emerald: { bg: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-500', val: 'text-emerald-700' },
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => {
  const c = STAT_COL[color] ?? STAT_COL.gray;
  return (
    <div className={`rounded-2xl border-2 p-4 ${c.bg} flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${c.icon} shrink-0`}>
        {icon}
      </div>
      <div>
        <p className={`text-xl font-bold ${c.val}`}>{value}</p>
        <p className="text-[10px] text-gray-500">{label}</p>
      </div>
    </div>
  );
};

const PillBtn: React.FC<{
  active: boolean; onClick: () => void; grad: string; children: React.ReactNode;
}> = ({ active, onClick, grad, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all ${
      active && grad
        ? `bg-gradient-to-r ${grad} text-white border-transparent shadow-sm`
        : active
        ? 'bg-gray-800 text-white border-gray-800'
        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
    }`}
  >
    {children}
  </button>
);
