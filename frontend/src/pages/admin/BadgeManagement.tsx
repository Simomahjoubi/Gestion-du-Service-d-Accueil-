import React, { useState, useEffect, useCallback } from 'react';
import {
  BadgeCheck, BadgeX, Plus, Trash2, RefreshCw, Search,
  ChevronDown, X, AlertTriangle, Layers, CheckCircle2,
  Tag, Building2, Clock, User, Shield, Filter,
} from 'lucide-react';
import { badgeService, BadgeDetail, ServiceBadgeStat } from '../../services/badgeService';

// ─── Palette par service (cycling) ───────────────────────────────────────────
const SERVICE_COLORS = [
  { bg: 'from-blue-600 to-blue-500',    light: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   ring: 'ring-blue-300'   },
  { bg: 'from-violet-600 to-violet-500',light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', ring: 'ring-violet-300' },
  { bg: 'from-rose-600 to-rose-500',    light: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   ring: 'ring-rose-300'   },
  { bg: 'from-amber-600 to-amber-500',  light: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  ring: 'ring-amber-300'  },
  { bg: 'from-teal-600 to-teal-500',    light: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   ring: 'ring-teal-300'   },
  { bg: 'from-pink-600 to-pink-500',    light: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700',   ring: 'ring-pink-300'   },
  { bg: 'from-indigo-600 to-indigo-500',light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-300' },
  { bg: 'from-green-600 to-green-500',  light: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  ring: 'ring-green-300'  },
];

const statusCfg = {
  DISPONIBLE:       { label: 'Libre',              cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  OCCUPE:           { label: 'Occupé',             cls: 'bg-rose-100    text-rose-700    border border-rose-200'    },
  PRET_A_RESTITUER: { label: 'Prêt à restituer',  cls: 'bg-amber-100   text-amber-700   border border-amber-200'   },
  RESTITUE:         { label: 'Restitué',           cls: 'bg-gray-100    text-gray-600    border border-gray-200'    },
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

interface ServiceOption { id: number; nom: string; }

// ─── Badge Card ───────────────────────────────────────────────────────────────
const BadgeCard: React.FC<{
  badge: BadgeDetail;
  colorIdx: number;
  onDelete: (id: number, code: string) => void;
}> = ({ badge, colorIdx, onDelete }) => {
  const col  = SERVICE_COLORS[colorIdx % SERVICE_COLORS.length];
  const free = badge.statut === 'DISPONIBLE';

  return (
    <div className={`relative rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
      free
        ? 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100'
        : 'bg-white border-rose-200 hover:border-rose-400 hover:shadow-rose-100'
    }`}>
      {/* Top stripe */}
      <div className={`h-1.5 rounded-t-xl ${free ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${col.bg} flex items-center justify-center shadow-sm`}>
              <Tag size={16} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-800 leading-tight">{badge.code}</p>
              <p className="text-[10px] text-gray-400">{badge.serviceNom}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg[badge.statut]?.cls ?? ''}`}>
              {statusCfg[badge.statut]?.label ?? badge.statut}
            </span>
            {free && (
              <button
                onClick={() => onDelete(badge.id, badge.code)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Supprimer ce badge"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {free ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-emerald-700">Badge disponible</span>
          </div>
        ) : (
          <div className="space-y-2">
            <InfoRow icon={<User size={12} />} label="Visiteur" value={badge.visiteurNom ?? '—'} />
            <InfoRow icon={<Shield size={12} />} label="Personnel" value={badge.staffNom ?? '—'} />
            <InfoRow icon={<Clock size={12} />} label="Depuis" value={formatDate(badge.dateOccupation)} />
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-[11px]">
    <span className="text-gray-400 shrink-0">{icon}</span>
    <span className="text-gray-400 w-16 shrink-0">{label}</span>
    <span className="text-gray-700 font-medium truncate">{value}</span>
  </div>
);

// ─── Service Section ──────────────────────────────────────────────────────────
const ServiceSection: React.FC<{
  stat: ServiceBadgeStat;
  badges: BadgeDetail[];
  colorIdx: number;
  onDelete: (id: number, code: string) => void;
  onGenerate: (serviceId: number, serviceNom: string) => void;
  search: string;
}> = ({ stat, badges, colorIdx, onDelete, onGenerate, search }) => {
  const [collapsed, setCollapsed] = useState(false);
  const col = SERVICE_COLORS[colorIdx % SERVICE_COLORS.length];

  const filtered = search
    ? badges.filter(b =>
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        (b.visiteurNom ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : badges;

  if (filtered.length === 0 && search) return null;

  return (
    <div className="mb-8">
      {/* Service header */}
      <div className={`bg-gradient-to-r ${col.bg} rounded-2xl p-4 mb-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{stat.serviceNom}</h3>
              <p className="text-white/70 text-xs">Préfixe : <span className="font-bold text-white">{stat.prefix}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats pills */}
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center">
                <p className="text-white font-bold text-lg leading-none">{stat.total}</p>
                <p className="text-white/70 text-[9px] uppercase tracking-wide">Total</p>
              </div>
              <div className="bg-emerald-400/30 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center">
                <p className="text-white font-bold text-lg leading-none">{stat.libres}</p>
                <p className="text-white/70 text-[9px] uppercase tracking-wide">Libres</p>
              </div>
              <div className="bg-rose-400/30 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center">
                <p className="text-white font-bold text-lg leading-none">{stat.occupes}</p>
                <p className="text-white/70 text-[9px] uppercase tracking-wide">Occupés</p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => onGenerate(stat.serviceId, stat.serviceNom)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors backdrop-blur-sm border border-white/20"
              >
                <Plus size={13} /> Ajouter
              </button>
              <button
                onClick={() => setCollapsed(c => !c)}
                className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
              >
                <ChevronDown size={16} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Badge grid */}
      {!collapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
              <Layers size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Aucun badge pour ce service.</p>
              <button
                onClick={() => onGenerate(stat.serviceId, stat.serviceNom)}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                Générer des badges
              </button>
            </div>
          ) : (
            filtered.map(b => (
              <BadgeCard key={b.id} badge={b} colorIdx={colorIdx} onDelete={onDelete} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Generate Modal ───────────────────────────────────────────────────────────
const GenerateModal: React.FC<{
  services: ServiceOption[];
  preselected?: number;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ services, preselected, onClose, onSuccess }) => {
  const [serviceId, setServiceId] = useState<number>(preselected ?? (services[0]?.id ?? 0));
  const [count, setCount]         = useState(5);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!serviceId) { setError('Sélectionnez un service.'); return; }
    if (count < 1 || count > 50) { setError('Entre 1 et 50 badges.'); return; }
    try {
      setLoading(true);
      await badgeService.generate(serviceId, count);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Erreur lors de la génération.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BadgeCheck size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Générer des badges</h2>
              <p className="text-blue-200 text-xs">Attribution automatique des codes</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Service</label>
            <div className="relative">
              <select
                value={serviceId}
                onChange={e => setServiceId(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-blue-400 focus:outline-none appearance-none bg-white pr-10"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Nombre de badges à générer
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-blue-400 focus:outline-none text-center font-bold text-lg"
              />
              <div className="flex flex-col gap-1">
                {[5, 10, 15].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${count === n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Les codes sont générés automatiquement (ex: A001, A002…)</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              {loading ? 'Génération…' : 'Générer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirm: React.FC<{
  code: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ code, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h3 className="font-bold text-gray-800 text-base mb-1">Supprimer le badge</h3>
      <p className="text-sm text-gray-500 mb-6">
        Êtes-vous sûr de vouloir supprimer le badge <span className="font-bold text-gray-800">{code}</span> ?
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Annuler
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
          Supprimer
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const BadgeManagement: React.FC = () => {
  const [badges, setBadges]       = useState<BadgeDetail[]>([]);
  const [stats, setStats]         = useState<ServiceBadgeStat[]>([]);
  const [services, setServices]   = useState<ServiceOption[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterSvc, setFilterSvc] = useState<number | null>(null);
  const [filterStat, setFilterStat] = useState<string>('');

  const [showGenerate, setShowGenerate]   = useState(false);
  const [generateSvcId, setGenerateSvcId] = useState<number | undefined>();
  const [deletePending, setDeletePending] = useState<{ id: number; code: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([badgeService.getAll(), badgeService.getStats()]);
      setBadges(b);
      setStats(s);
      setServices(s.map(x => ({ id: x.serviceId, nom: x.serviceNom })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deletePending) return;
    try {
      await badgeService.delete(deletePending.id);
      setDeletePending(null);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Erreur lors de la suppression.');
      setDeletePending(null);
    }
  };

  const handleOpenGenerate = (serviceId: number) => {
    setGenerateSvcId(serviceId);
    setShowGenerate(true);
  };

  // ── Global stats ──
  const totalBadges = badges.length;
  const totalLibres = badges.filter(b => b.statut === 'DISPONIBLE').length;
  const totalOccupes = badges.filter(b => b.statut !== 'DISPONIBLE').length;

  // ── Filtered badges per service ──
  const displayedStats = filterSvc
    ? stats.filter(s => s.serviceId === filterSvc)
    : stats;

  const getBadgesForService = (serviceId: number) => {
    let b = badges.filter(b => b.serviceId === serviceId);
    if (filterStat) b = b.filter(x => x.statut === filterStat);
    return b;
  };

  return (
    <div className="p-6 min-h-screen bg-[#f8f9fa]">
      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
            <BadgeCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Gestion des Badges</h1>
            <p className="text-xs text-gray-400">Attribution et suivi des badges par service</p>
          </div>
        </div>
      </div>

      {/* ── Global stats bar ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<Layers size={20} />} label="Total badges" value={totalBadges} color="blue" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Libres" value={totalLibres} color="emerald" />
        <StatCard icon={<BadgeX size={20} />} label="Occupés" value={totalOccupes} color="rose" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un badge…"
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

        {/* Service filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={filterSvc ?? ''}
            onChange={e => setFilterSvc(e.target.value ? Number(e.target.value) : null)}
            className="pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white appearance-none"
          >
            <option value="">Tous les services</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStat}
            onChange={e => setFilterStat(e.target.value)}
            className="pl-4 pr-8 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white appearance-none"
          >
            <option value="">Tous les statuts</option>
            <option value="DISPONIBLE">Libres</option>
            <option value="OCCUPE">Occupés</option>
            <option value="PRET_A_RESTITUER">Prêts à restituer</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex-1" />

        <button
          onClick={() => { setGenerateSvcId(undefined); setShowGenerate(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} /> Générer des badges
        </button>

        <button
          onClick={load}
          className="w-10 h-10 flex items-center justify-center border-2 border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors bg-white"
          title="Actualiser"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <RefreshCw size={32} className="animate-spin mb-3" />
          <p className="text-sm">Chargement des badges…</p>
        </div>
      ) : displayedStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Layers size={48} className="mb-3 opacity-30" />
          <p className="text-base font-medium">Aucun service trouvé</p>
          <p className="text-sm mt-1">Créez d'abord des services depuis la section "Services & Motifs".</p>
        </div>
      ) : (
        displayedStats.map((stat, idx) => (
          <ServiceSection
            key={stat.serviceId}
            stat={stat}
            badges={getBadgesForService(stat.serviceId)}
            colorIdx={idx}
            onDelete={(id, code) => setDeletePending({ id, code })}
            onGenerate={handleOpenGenerate}
            search={search}
          />
        ))
      )}

      {/* ── Modals ── */}
      {showGenerate && (
        <GenerateModal
          services={services}
          preselected={generateSvcId}
          onClose={() => setShowGenerate(false)}
          onSuccess={load}
        />
      )}

      {deletePending && (
        <DeleteConfirm
          code={deletePending.code}
          onConfirm={handleDelete}
          onCancel={() => setDeletePending(null)}
        />
      )}
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const colorMap: Record<string, { bg: string; icon: string; value: string }> = {
  blue:    { bg: 'bg-blue-50 border-blue-200',    icon: 'text-blue-500',    value: 'text-blue-700'    },
  emerald: { bg: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-500', value: 'text-emerald-700' },
  rose:    { bg: 'bg-rose-50 border-rose-200',    icon: 'text-rose-500',    value: 'text-rose-700'    },
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border-2 p-4 ${c.bg} flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm ${c.icon}`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
};
