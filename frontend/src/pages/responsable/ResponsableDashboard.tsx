import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import {
  AlertTriangle, CheckCircle, Users, Clock, Badge, RefreshCw,
  ArrowRightLeft, X, TrendingUp, Activity, PieChart as PieIcon,
  Tag, User, CalendarCheck, ChevronRight, CreditCard, Hash, Phone, Briefcase, Shield
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

interface Visite {
  id: number;
  visiteurId: number;
  visiteurNom: string;
  typeVisiteur: string;
  badgeCode: string;
  statut: string;
  heureArrivee: string;
  motifLibelle: string;
  serviceNom: string;
  fonctionnaireNom: string;
  grade?: string;
  typeAssurance?: string;
}

interface VisiteurInfo {
  id: number;
  nom: string; prenom: string; cin?: string; numAdhesion?: string;
  sexe?: string; telephone?: string; situationFamiliale?: string;
  type: string; statutAdherent?: string; lienParente?: string;
  typeAdherentDetail?: string; grade?: string;
  typeAssurance?: string; affectation?: string;
}

interface Dossier {
  visiteur: VisiteurInfo;
  adherent?: VisiteurInfo;
  famille?: VisiteurInfo[];
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

const STATUT_BADGE: Record<string, { cls: string; label: string }> = {
  EN_ATTENTE: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',  label: 'En attente' },
  EN_COURS:   { cls: 'bg-blue-100  text-blue-700  border border-blue-200',   label: 'En cours'   },
  TERMINEE:   { cls: 'bg-gray-100  text-gray-500  border border-gray-200',   label: 'Terminée'   },
  CLOTUREE:   { cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Clôturée' },
};

const TYPE_COLORS: Record<string, string> = {
  ADHERENT:   'bg-blue-100 text-blue-700',
  CONJOINT:   'bg-violet-100 text-violet-700',
  ENFANT:     'bg-pink-100 text-pink-700',
  EXTERNE:    'bg-gray-100 text-gray-600',
  VIP:        'bg-yellow-100 text-yellow-700',
  MEDECIN:    'bg-green-100 text-green-700',
  PARTENAIRE: 'bg-orange-100 text-orange-700',
};

const BADGE_COLORS = [
  'from-blue-600 to-blue-400', 'from-violet-600 to-violet-400',
  'from-rose-600 to-rose-400', 'from-teal-600 to-teal-400',
  'from-amber-600 to-amber-400',
];

function fmtTime(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Dossier Modal ────────────────────────────────────────────────────────────
const DossierModal: React.FC<{ visiteurId: number; onClose: () => void }> = ({ visiteurId, onClose }) => {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<Dossier>(`/visiteurs/${visiteurId}/dossier`)
      .then(r => setDossier(r.data))
      .catch(() => setDossier(null))
      .finally(() => setLoading(false));
  }, [visiteurId]);

  const v      = dossier?.visiteur;
  const adh    = dossier?.adherent;
  const main   = v?.type === 'ADHERENT' ? v : adh;
  const famille = dossier?.famille ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-10 px-4 pb-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              {loading ? <p className="text-white font-bold text-lg">Chargement…</p> : (
                <>
                  <p className="text-white font-bold text-lg leading-tight">{v?.nom} {v?.prenom}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[v?.type ?? 'EXTERNE']}`}>{v?.type}</span>
                    {v?.statutAdherent && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{v.statutAdherent}</span>}
                  </div>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-xl"><X size={18} /></button>
        </div>
        {!loading && dossier && (
          <div className="p-6 space-y-5">
            {v?.type !== 'ADHERENT' && adh && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Shield size={16} className="text-blue-500 shrink-0"/>
                <div className="text-sm">
                  <span className="text-blue-500 font-medium">Adhérent principal : </span>
                  <span className="font-bold text-blue-800">{adh.nom} {adh.prenom}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={<CreditCard size={13}/>} label="CIN" value={main?.cin} />
              <InfoItem icon={<Hash size={13}/>} label="N° Adhésion" value={main?.numAdhesion} />
              <InfoItem icon={<Phone size={13}/>} label="Téléphone" value={main?.telephone} />
              <InfoItem icon={<Briefcase size={13}/>} label="Grade" value={main?.grade} />
            </div>
            {famille.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase">Famille</h3>
                {famille.map(m => (
                  <div key={m.id} className="text-sm bg-gray-50 p-2 rounded-lg border border-gray-100">{m.nom} {m.prenom} ({m.type})</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | null }> = ({ icon, label, value }) => (
  value ? (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-xs font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  ) : null
);

// ─── Visit Card (Responsable) ────────────────────────────────────────────────
const VisiteCard: React.FC<{
  visite: Visite;
  idx: number;
  onReaffecter: (v: any) => void;
  onDossier:  (visiteurId: number) => void;
}> = ({ visite, idx, onReaffecter, onDossier }) => {
  const sb = STATUT_BADGE[visite.statut];
  const grad = BADGE_COLORS[idx % BADGE_COLORS.length];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1 bg-gradient-to-r ${grad}`} />
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white`}><Tag size={18}/></div>
            <div>
              <p className="font-bold text-gray-800">{visite.badgeCode}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[100px]">{visite.fonctionnaireNom}</p>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sb?.cls}`}>{sb?.label}</span>
        </div>
        <p className="text-sm font-bold text-gray-800 truncate mb-1">{visite.visiteurNom}</p>
        <p className="text-[10px] text-gray-500 mb-3 truncate">{visite.motifLibelle}</p>
        <div className="flex gap-2">
          <button onClick={() => onDossier(visite.visiteurId)} className="flex-1 py-1.5 text-[10px] font-bold text-gray-600 bg-gray-50 rounded-lg border border-gray-100">Dossier</button>
          <button onClick={() => onReaffecter({ visiteId: visite.id, visiteurNom: visite.visiteurNom, fonctionnaireNom: visite.fonctionnaireNom, fonctionnaireId: 0 })} 
            className="flex-1 py-1.5 text-[10px] font-bold text-white bg-blue-600 rounded-lg">Réaffecter</button>
        </div>
      </div>
    </div>
  );
};

const BADGE_PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b'];
const BAR_COLOR = '#3b82f6';
const MOTIF_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316','#14b8a6'];

export const ResponsableDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const serviceId = user?.serviceId;

  const [stats, setStats]         = useState<Stats | null>(null);
  const [flux, setFlux]           = useState<FluxItem[]>([]);
  const [activeVisits, setActiveVisits] = useState<Visite[]>([]);
  const [todayVisits, setTodayVisits]   = useState<Visite[]>([]);
  const [rendement, setRendement] = useState<Rendement[]>([]);
  const [visitesParJour, setVisitesParJour] = useState<{jour:string;visites:number}[]>([]);
  const [topMotifs, setTopMotifs]           = useState<{motif:string;count:number}[]>([]);
  const [loading, setLoading]     = useState(true);
  const [reaffectModal, setReaffectModal] = useState<FluxItem | null>(null);
  const [selectedFct, setSelectedFct]     = useState<string>('');
  const [lastRefresh, setLastRefresh]     = useState(new Date());
  const [dossierVisiteurId, setDossierVisiteurId] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    if (!serviceId) { setLoading(false); return; }
    try {
      const [s, f, r, vpj, tm, av, rv] = await Promise.all([
        api.get<Stats>(`/responsable/service/${serviceId}/stats`),
        api.get<FluxItem[]>(`/responsable/service/${serviceId}/flux`),
        api.get<Rendement[]>(`/responsable/service/${serviceId}/rendement`),
        api.get<{jour:string;visites:number}[]>(`/responsable/service/${serviceId}/visites-par-jour`),
        api.get<{motif:string;count:number}[]>(`/responsable/service/${serviceId}/top-motifs`),
        api.get<Visite[]>(`/responsable/service/${serviceId}/file-attente`),
        api.get<{visites: Visite[]}>(`/responsable/service/${serviceId}/rapport?periode=JOUR`),
      ]);
      setStats(s.data);
      setFlux(f.data);
      setRendement(r.data);
      setVisitesParJour(vpj.data);
      setTopMotifs(tm.data);
      setActiveVisits(av.data);
      setTodayVisits(rv.data.visites);
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

      {/* ── NOUVEAU: File d'attente active & Historique (Style Fonctionnaire) ── */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Active queue cards */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> File d'attente active
              {activeVisits.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeVisits.length}
                </span>
              )}
            </h2>
          </div>

          {activeVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-gray-400">
              <CheckCircle size={32} className="mb-2 opacity-20"/>
              <p className="text-sm font-medium">Aucune visite active</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeVisits.map((v, i) => (
                <VisiteCard key={v.id} visite={v} idx={i}
                  onReaffecter={setReaffectModal}
                  onDossier={setDossierVisiteurId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Today's history list */}
        <div className="xl:w-80 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <CalendarCheck size={14}/> Aujourd'hui
              {todayVisits.length > 0 && (
                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {todayVisits.length}
                </span>
              )}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {todayVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CalendarCheck size={32} className="mb-2 opacity-30"/>
                <p className="text-sm">Aucune visite enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {todayVisits.map(v => {
                  const sb = STATUT_BADGE[v.statut];
                  return (
                    <div key={v.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => setDossierVisiteurId(v.visiteurId)}
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Tag size={14} className="text-blue-500"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{v.visiteurNom}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-mono text-gray-400">{v.badgeCode}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-[9px] text-gray-400">{fmtTime(v.heureArrivee)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sb?.cls ?? ''}`}>
                          {sb?.label ?? v.statut}
                        </span>
                        <ChevronRight size={11} className="text-gray-300 group-hover:text-gray-500 transition-colors"/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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

      {/* Dossier modal */}
      {dossierVisiteurId != null && (
        <DossierModal visiteurId={dossierVisiteurId} onClose={() => setDossierVisiteurId(null)} />
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
