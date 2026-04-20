import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import {
  AlertTriangle, CheckCircle, Users, Clock, Badge, RefreshCw,
  ArrowRightLeft, X, TrendingUp, Activity, PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';

interface Stats {
  visitesEnAttente: number; visitesEnCours: number;
  visitesTraiteesAujourdhui: number; alertes45Min: number;
  badgesDisponibles: number; badgesOccupes: number;
  badgesPretARestituer: number; totalBadges: number;
  fonctionnairesPresents: number; totalFonctionnaires: number;
}

interface FluxItem {
  visiteId: number; visiteurNom: string;
  fonctionnaireId: number; fonctionnaireNom: string;
  statut: string; minutesAttente: number;
  alerte: boolean; badgeCode: string; motif: string;
}

interface Rendement {
  fonctionnaireId: number; nomComplet: string; statutPresence: string;
  visitesEnAttente: number; visitesEnCours: number;
  visitesTraiteesAujourdhui: number;
  tempsTraitementMoyen: number; tauxOccupation: number;
}

const STATUT_COLORS: Record<string, string> = {
  EN_LIGNE:   'bg-emerald-100 text-emerald-700',
  EN_PAUSE:   'bg-amber-100 text-amber-700',
  REUNION:    'bg-rose-100 text-rose-700',
  CONGE:      'bg-gray-100 text-gray-600',
  MISSION:    'bg-purple-100 text-purple-700',
  HORS_LIGNE: 'bg-gray-100 text-gray-400',
};

const BADGE_PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b'];
const BAR_COLOR = '#3b82f6';
const MOTIF_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316','#14b8a6'];

export const ResponsableDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const serviceId = user?.serviceId;

  const [stats, setStats]         = useState<Stats | null>(null);
  const [flux, setFlux]           = useState<FluxItem[]>([]);
  const [rendement, setRendement] = useState<Rendement[]>([]);
  const [visitesParJour, setVisitesParJour] = useState<{jour:string;visites:number}[]>([]);
  const [topMotifs, setTopMotifs]           = useState<{motif:string;count:number}[]>([]);
  const [loading, setLoading]     = useState(true);
  const [reaffectModal, setReaffectModal] = useState<FluxItem | null>(null);
  const [selectedFct, setSelectedFct]     = useState<string>('');
  const [lastRefresh, setLastRefresh]     = useState(new Date());

  const fetchAll = useCallback(async () => {
    if (!serviceId) { setLoading(false); return; }
    try {
      const [s, f, r, vpj, tm] = await Promise.all([
        api.get<Stats>(`/responsable/service/${serviceId}/stats`),
        api.get<FluxItem[]>(`/responsable/service/${serviceId}/flux`),
        api.get<Rendement[]>(`/responsable/service/${serviceId}/rendement`),
        api.get<{jour:string;visites:number}[]>(`/responsable/service/${serviceId}/visites-par-jour`),
        api.get<{motif:string;count:number}[]>(`/responsable/service/${serviceId}/top-motifs`),
      ]);
      setStats(s.data);
      setFlux(f.data);
      setRendement(r.data);
      setVisitesParJour(vpj.data);
      setTopMotifs(tm.data);
      setLastRefresh(new Date());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [serviceId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleReaffecter = async () => {
    if (!reaffectModal || !selectedFct) return;
    await api.post(`/responsable/visites/${reaffectModal.visiteId}/reaffecter?fonctionnaireId=${selectedFct}`);
    setReaffectModal(null);
    setSelectedFct('');
    fetchAll();
  };

  const fmtMin = (m: number) => {
    if (m <= 0) return '—';
    if (m < 1) return '< 1 min';
    return m < 60 ? `${Math.round(m)} min` : `${Math.floor(m/60)}h${String(Math.round(m%60)).padStart(2,'0')}`;
  };

  // Badge pie data
  const badgePieData = [
    { name: 'Disponibles',      value: stats?.badgesDisponibles ?? 0 },
    { name: 'Occupés',          value: stats?.badgesOccupes ?? 0 },
    { name: 'Prêt à restituer', value: stats?.badgesPretARestituer ?? 0 },
  ].filter(d => d.value > 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supervision du Service</h1>
          <p className="text-xs text-gray-400 mt-0.5">Actualisé à {lastRefresh.toLocaleTimeString('fr-FR')}</p>
        </div>
        <div className="flex items-center gap-2">
          {(stats?.alertes45Min ?? 0) > 0 && (
            <span className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse">
              <AlertTriangle size={13} /> {stats?.alertes45Min} alerte{stats!.alertes45Min > 1 ? 's' : ''} +45 min
            </span>
          )}
          <button onClick={fetchAll} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock size={18} className="text-amber-500" />}    label="En attente"          value={stats?.visitesEnAttente ?? 0}         color="border-amber-200 bg-amber-50" />
        <StatCard icon={<Activity size={18} className="text-blue-500" />}  label="En cours"            value={stats?.visitesEnCours ?? 0}            color="border-blue-200 bg-blue-50" />
        <StatCard icon={<CheckCircle size={18} className="text-emerald-500" />} label="Traitées aujourd'hui" value={stats?.visitesTraiteesAujourdhui ?? 0} color="border-emerald-200 bg-emerald-50" />
        <StatCard icon={<Users size={18} className="text-purple-500" />}   label="Effectif présent"    value={`${stats?.fonctionnairesPresents ?? 0}/${stats?.totalFonctionnaires ?? 0}`} color="border-purple-200 bg-purple-50" />
      </div>

      {/* Flux + Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flux réel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Flux en temps réel</h2>
            <span className="text-xs text-gray-400">{flux.length} visite{flux.length !== 1 ? 's' : ''} active{flux.length !== 1 ? 's' : ''}</span>
          </div>
          {flux.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">Aucune visite active</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {flux.map(item => (
                <div key={item.visiteId} className={`flex items-center gap-4 px-5 py-3 ${item.alerte ? 'bg-red-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.visiteurNom}</p>
                    <p className="text-xs text-gray-400">{item.motif} · Badge {item.badgeCode}</p>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    <p className="font-medium text-gray-700">{item.fonctionnaireNom}</p>
                    <p className="text-[10px]">fonctionnaire</p>
                  </div>
                  <div className={`text-xs font-bold text-center min-w-[60px] ${item.alerte ? 'text-red-600' : item.minutesAttente > 20 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {item.alerte && <AlertTriangle size={10} className="inline mr-0.5" />}
                    {fmtMin(item.minutesAttente)}
                    <p className="text-[10px] font-normal">{item.statut === 'EN_COURS' ? 'en cours' : 'attente'}</p>
                  </div>
                  <button
                    onClick={() => { setReaffectModal(item); setSelectedFct(''); }}
                    className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                  >
                    <ArrowRightLeft size={11} /> Réaffecter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badge pie chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><PieIcon size={16} className="text-blue-500" /> Statut des badges</h2>
            <p className="text-xs text-gray-400 mt-0.5">Total : {stats?.totalBadges ?? 0} badges</p>
          </div>
          <div className="p-4">
            {badgePieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={badgePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value" label={({ value }) => value}>
                    {badgePieData.map((_, i) => (
                      <Cell key={i} fill={BADGE_PIE_COLORS[i % BADGE_PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} badges`, '']} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts row: visites/jour + top motifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visites par jour - 30 derniers jours */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500" /> Visites — 30 derniers jours</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={visitesParJour} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="jour" tick={{ fontSize: 10, fill: '#9ca3af' }}
                  interval={Math.floor(visitesParJour.length / 6)} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v: number) => [`${v} visites`, '']}
                />
                <Line type="monotone" dataKey="visites" stroke={BAR_COLOR}
                  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top motifs ce mois */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Badge size={16} className="text-blue-500" /> Motifs les plus demandés (ce mois)</h2>
          </div>
          <div className="p-4">
            {topMotifs.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Aucune donnée ce mois</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topMotifs} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="motif" width={90}
                    tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number) => [`${v} visites`, '']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {topMotifs.map((_, i) => (
                      <Cell key={i} fill={MOTIF_COLORS[i % MOTIF_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Rendement fonctionnaires */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500" /> Rendement des fonctionnaires</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3">Fonctionnaire</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-center">En attente</th>
                <th className="px-5 py-3 text-center">En cours</th>
                <th className="px-5 py-3 text-center">Traitées</th>
                <th className="px-5 py-3 text-center">Tps moyen</th>
                <th className="px-5 py-3">Taux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rendement.map(r => (
                <tr key={r.fonctionnaireId} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{r.nomComplet}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUT_COLORS[r.statutPresence] ?? 'bg-gray-100 text-gray-500'}`}>
                      {r.statutPresence.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-amber-600">{r.visitesEnAttente}</td>
                  <td className="px-5 py-3 text-center font-bold text-blue-600">{r.visitesEnCours}</td>
                  <td className="px-5 py-3 text-center font-bold text-emerald-600">{r.visitesTraiteesAujourdhui}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{fmtMin(r.tempsTraitementMoyen)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${r.tauxOccupation}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-10">{r.tauxOccupation}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal réaffectation */}
      {reaffectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-800">Réaffecter la visite</p>
                <p className="text-xs text-gray-400 mt-0.5">{reaffectModal.visiteurNom}</p>
              </div>
              <button onClick={() => setReaffectModal(null)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500">Fonctionnaire actuel : <span className="font-semibold text-gray-700">{reaffectModal.fonctionnaireNom}</span></p>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nouveau fonctionnaire</label>
                <select
                  value={selectedFct}
                  onChange={e => setSelectedFct(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">— Sélectionner —</option>
                  {rendement
                    .filter(r => r.fonctionnaireId !== reaffectModal.fonctionnaireId)
                    .map(r => (
                      <option key={r.fonctionnaireId} value={r.fonctionnaireId}>
                        {r.nomComplet} ({r.visitesEnAttente + r.visitesEnCours} visites)
                      </option>
                    ))}
                </select>
              </div>
              <button
                onClick={handleReaffecter}
                disabled={!selectedFct}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirmer la réaffectation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string }> = ({ icon, label, value, color }) => (
  <div className={`bg-white rounded-xl border p-5 shadow-sm ${color}`}>
    <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-semibold text-gray-500 uppercase">{label}</span></div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);
