import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, CheckCircle, Clock, Crown, Download,
  LayoutGrid, PieChart as PieIcon, RefreshCw, Repeat, Star, TrendingUp, Users,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  directeurService,
  type AdherentRecurrentItem,
  type DirecteurGlobalStats,
  type EvolutionPoint,
  type MotifStatItem,
  type PeriodeDirecteur,
  type ServiceStatItem,
  type TypeVisiteurStat,
} from '../../services/directeurService';

const PERIODES: { key: PeriodeDirecteur; label: string }[] = [
  { key: 'JOUR',    label: "Aujourd'hui" },
  { key: 'SEMAINE', label: '7 jours' },
  { key: 'MOIS',    label: 'Ce mois' },
  { key: 'ANNEE',   label: 'Cette année' },
];

const SERVICE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#6366f1'];
const MOTIF_COLORS   = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#14b8a6', '#ef4444', '#84cc16'];
const TYPE_COLORS    = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

const fmtMinutes = (m: number) => {
  if (!m || m <= 0) return '—';
  if (m < 1)   return '< 1 min';
  if (m < 60)  return `${Math.round(m)} min`;
  return `${Math.floor(m / 60)}h${String(Math.round(m % 60)).padStart(2, '0')}`;
};

export const DirecteurDashboard: React.FC = () => {
  const [periode,  setPeriode]  = useState<PeriodeDirecteur>('MOIS');
  const [stats,    setStats]    = useState<DirecteurGlobalStats | null>(null);
  const [services, setServices] = useState<ServiceStatItem[]>([]);
  const [motifs,   setMotifs]   = useState<MotifStatItem[]>([]);
  const [adherents, setAdherents] = useState<AdherentRecurrentItem[]>([]);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [types,    setTypes]    = useState<TypeVisiteurStat[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [g, s, m, a, e, t] = await Promise.all([
        directeurService.getGlobalStats(periode),
        directeurService.getServicesStats(periode),
        directeurService.getTopMotifs(periode, 8),
        directeurService.getAdherentsRecurrents(periode, 10),
        directeurService.getEvolution(),
        directeurService.getRepartitionVisiteurs(periode),
      ]);
      setStats(g);
      setServices(s);
      setMotifs(m);
      setAdherents(a);
      setEvolution(e);
      setTypes(t);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [periode]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExport = () => {
    const rows: string[] = [];
    rows.push('=== Rapport Analytique Fondation — ' + periode + ' ===');
    if (stats) {
      rows.push(`Total visites;${stats.totalVisites}`);
      rows.push(`Terminées;${stats.visitesTerminees}`);
      rows.push(`En cours;${stats.visitesEnCours}`);
      rows.push(`En attente;${stats.visitesEnAttente}`);
      rows.push(`Visiteurs uniques;${stats.visiteursUniques}`);
      rows.push(`Temps attente moyen (min);${stats.tempsAttenteMoyen}`);
      rows.push(`Temps traitement moyen (min);${stats.tempsTraitementMoyen}`);
      rows.push(`Taux de traitement (%);${stats.tauxTraitement}`);
    }
    rows.push('');
    rows.push('--- Stats par service ---');
    rows.push('Service;Total;Terminées;En cours;En attente;Tps moyen (min);Taux (%)');
    services.forEach(s => rows.push(
      `${s.serviceNom};${s.totalVisites};${s.visitesTerminees};${s.visitesEnCours};${s.visitesEnAttente};${s.tempsTraitementMoyen};${s.tauxTraitement}`
    ));
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `rapport-direction-${periode}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Top 6 services pour le bar chart
  const topServices = useMemo(() => services.slice(0, 6), [services]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={20} className="text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-800">Analytique Globale — Fondation</h1>
          </div>
          <p className="text-xs text-gray-400">
            Vue consolidée tous services · Actualisé à {lastRefresh.toLocaleTimeString('fr-FR')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            {PERIODES.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriode(p.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  periode === p.key
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw size={13} /> Actualiser
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-2 rounded-lg font-semibold shadow hover:shadow-md"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          gradient="from-blue-500 to-blue-700"
          icon={<Activity size={20} />}
          label="Visites totales"
          value={stats?.totalVisites ?? 0}
          sub={`${stats?.visiteursUniques ?? 0} visiteurs uniques`}
        />
        <KpiCard
          gradient="from-emerald-500 to-emerald-700"
          icon={<CheckCircle size={20} />}
          label="Taux de traitement"
          value={`${stats?.tauxTraitement ?? 0}%`}
          sub={`${stats?.visitesTerminees ?? 0} visites finalisées`}
        />
        <KpiCard
          gradient="from-violet-500 to-violet-700"
          icon={<Clock size={20} />}
          label="Temps moyen"
          value={fmtMinutes(stats?.tempsTraitementMoyen ?? 0)}
          sub={`Attente: ${fmtMinutes(stats?.tempsAttenteMoyen ?? 0)}`}
        />
        <KpiCard
          gradient="from-amber-500 to-amber-700"
          icon={<Users size={20} />}
          label="Capacité opérationnelle"
          value={`${stats?.totalFonctionnaires ?? 0}`}
          sub={`${stats?.totalServices ?? 0} services actifs`}
        />
      </div>

      {/* Quick status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusTile icon={<CheckCircle size={16} className="text-emerald-500" />} label="Terminées" value={stats?.visitesTerminees ?? 0} color="bg-emerald-50 border-emerald-200" />
        <StatusTile icon={<Activity size={16} className="text-blue-500" />}      label="En cours"   value={stats?.visitesEnCours ?? 0}   color="bg-blue-50 border-blue-200" />
        <StatusTile icon={<AlertTriangle size={16} className="text-amber-500" />} label="En attente" value={stats?.visitesEnAttente ?? 0} color="bg-amber-50 border-amber-200" />
      </div>

      {/* Evolution + Type visiteur */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> Évolution mensuelle — 12 mois
            </h2>
            <span className="text-xs text-gray-400">Total visites par mois</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={evolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="evoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v: number) => [`${v} visites`, '']}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#evoGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <PieIcon size={16} className="text-blue-500" /> Type de visiteurs
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Répartition sur la période</p>
          </div>
          <div className="p-4">
            {types.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={types}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="type"
                    label={({ count }) => count}
                  >
                    {types.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} visites`, '']} />
                  <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-[10px] text-gray-600">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top services + Top motifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" /> Services les plus sollicités
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Top 6 par volume de visites</p>
          </div>
          <div className="p-4">
            {topServices.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topServices} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="serviceNom" width={110} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number) => [`${v} visites`, '']}
                  />
                  <Bar dataKey="totalVisites" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {topServices.map((_, i) => <Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Star size={16} className="text-amber-500" /> Motifs de visite les plus fréquents
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Top 8 tous services confondus</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-[260px] overflow-y-auto">
            {motifs.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Aucune donnée</div>
            ) : motifs.map((m, i) => {
              const max = motifs[0]?.count ?? 1;
              const pct = Math.round((m.count / max) * 100);
              return (
                <div key={`${m.motif}-${m.serviceNom}`} className="px-5 py-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: MOTIF_COLORS[i % MOTIF_COLORS.length] }}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{m.motif}</p>
                        <p className="text-[10px] text-gray-400 truncate">{m.serviceNom}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 flex-shrink-0 ml-2">{m.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${pct}%`, background: MOTIF_COLORS[i % MOTIF_COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Adhérents récurrents */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Repeat size={16} className="text-violet-500" /> Adhérents aux visites multiples
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Visiteurs ayant au moins 2 visites sur la période</p>
          </div>
          <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
            {adherents.length} adhérent{adherents.length > 1 ? 's' : ''}
          </span>
        </div>
        {adherents.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Aucun adhérent récurrent sur la période</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3">Adhérent</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-center">Visites</th>
                  <th className="px-5 py-3">Services visités</th>
                  <th className="px-5 py-3">Motifs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {adherents.map(a => (
                  <tr key={a.visiteurId} className="hover:bg-violet-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{a.nomComplet}</p>
                      <p className="text-[10px] text-gray-400">CIN : {a.cin ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {a.typeVisiteur}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 bg-gradient-to-br from-violet-500 to-violet-700 text-white text-xs font-bold rounded-lg">
                        {a.totalVisites}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {a.services.map(s => (
                          <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {a.motifs.slice(0, 3).map(m => (
                          <span key={m} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            {m}
                          </span>
                        ))}
                        {a.motifs.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{a.motifs.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Détail tous les services */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <LayoutGrid size={16} className="text-blue-500" /> Performance détaillée par service
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Volume, rendement et temps moyen sur la période</p>
        </div>
        {services.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Aucun service</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {services.map((s, i) => (
              <ServiceCard key={s.serviceId} svc={s} color={SERVICE_COLORS[i % SERVICE_COLORS.length]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub: string; gradient: string }> =
  ({ icon, label, value, sub, gradient }) => (
  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg`}>
    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
    <div className="absolute -bottom-6 -right-2 w-16 h-16 bg-white/5 rounded-full" />
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">{label}</span>
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="text-[11px] text-white/70 mt-1">{sub}</p>
    </div>
  </div>
);

const StatusTile: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> =
  ({ icon, label, value, color }) => (
  <div className={`flex items-center justify-between px-5 py-4 rounded-xl border ${color}`}>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">{icon}</div>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </div>
    <span className="text-2xl font-bold text-gray-800">{value}</span>
  </div>
);

const ServiceCard: React.FC<{ svc: ServiceStatItem; color: string }> = ({ svc, color }) => (
  <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50/40">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{svc.serviceNom}</p>
          <p className="text-[10px] text-gray-400">{svc.fonctionnairesCount} fonctionnaire{svc.fonctionnairesCount > 1 ? 's' : ''}</p>
        </div>
      </div>
      <span className="text-2xl font-extrabold text-gray-800">{svc.totalVisites}</span>
    </div>

    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
      <div className="bg-emerald-50 rounded-lg py-1.5">
        <p className="text-[9px] font-semibold text-emerald-700 uppercase">Terminées</p>
        <p className="text-sm font-bold text-emerald-700">{svc.visitesTerminees}</p>
      </div>
      <div className="bg-blue-50 rounded-lg py-1.5">
        <p className="text-[9px] font-semibold text-blue-700 uppercase">En cours</p>
        <p className="text-sm font-bold text-blue-700">{svc.visitesEnCours}</p>
      </div>
      <div className="bg-amber-50 rounded-lg py-1.5">
        <p className="text-[9px] font-semibold text-amber-700 uppercase">Attente</p>
        <p className="text-sm font-bold text-amber-700">{svc.visitesEnAttente}</p>
      </div>
    </div>

    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
      <span>Taux de traitement</span>
      <span className="font-bold text-gray-700">{svc.tauxTraitement}%</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${svc.tauxTraitement}%`, background: color }} />
    </div>

    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-[11px]">
      <span className="text-gray-500">Temps moyen</span>
      <span className="font-semibold text-gray-700">{fmtMinutes(svc.tempsTraitementMoyen)}</span>
    </div>
  </div>
);
