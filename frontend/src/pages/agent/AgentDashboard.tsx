import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { visiteService } from '../../services/visiteService';
import { 
  UserPlus, 
  Key, 
  RefreshCcw,
  Activity,
  Tag,
  History,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => visiteService.getStatsToday(),
    refetchInterval: 30000,
  });

  const { data: visites, isLoading: visitesLoading, refetch: refetchVisites } = useQuery({
    queryKey: ['visites-today'],
    queryFn: () => visiteService.getVisitesToday(),
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetchStats();
    refetchVisites();
  };

  const totalVisites = stats?.totalVisitesAujourdhui || 0;
  const enAttente = stats?.visitesEnAttente || 0;
  
  const chartData = [
    { name: '08h', visites: 2 },
    { name: '10h', visites: Math.floor(totalVisites * 0.3) },
    { name: '12h', visites: Math.floor(totalVisites * 0.6) },
    { name: '14h', visites: enAttente },
    { name: '16h', visites: totalVisites },
  ];

  const badgesData = [
    { name: 'Occupés', value: stats?.badgesOccupes || 0 },
    { name: 'Libres', value: stats?.badgesLibres || 0 },
  ];
  const COLORS = ['#ef4444', '#22c55e'];

  return (
    <div className="space-y-10 pb-10">
      
      {/* 1. Header avec Bonjour [Nom du Compte] */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-2">Tableau de bord opérationnel</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.nomComplet || 'Agent'}</span> 👋
          </h1>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all"
        >
          <RefreshCcw size={24} className={(statsLoading || visitesLoading) ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. Commandes Rapides (Section Maîtresse) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <QuickAction 
            title="Nouvelle Arrivée" 
            icon={<UserPlus size={36} />} 
            onClick={() => navigate('/agent/nouvelle-visite')} 
            color="bg-blue-600"
            desc="Enregistrer un visiteur"
          />
          <QuickAction 
            title="Sortie Visiteur" 
            icon={<Key size={36} />} 
            onClick={() => navigate('/agent/restitution')} 
            color="bg-purple-600"
            desc="Restituer un badge"
          />
          <QuickAction 
            title="Historique Jour" 
            icon={<History size={36} />} 
            onClick={() => navigate('/agent/historique')} 
            color="bg-slate-800"
            desc="Journal des visites"
          />
      </section>

      {/* 3. Statistiques Visuelles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Activity size={20} /></div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Flux d'accueil actuel</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="visites" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVisites)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Tag size={20} /></div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">État du stock badges</h3>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={badgesData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                  {badgesData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
               <span className="text-[10px] font-black text-gray-400 uppercase">Total</span>
               <span className="text-3xl font-black text-gray-800 tracking-tighter">{(stats?.badgesOccupes || 0) + (stats?.badgesLibres || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Liste des Visites Actives */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="text-base font-black text-gray-800 uppercase tracking-widest">Dernières activités</h3>
          <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg shadow-blue-200 uppercase">{visites?.length || 0} en cours</span>
        </div>
        <div className="overflow-x-auto text-left">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                <th className="px-8 py-5">Badge</th>
                <th className="px-8 py-5">Visiteur</th>
                <th className="px-8 py-5">Destination</th>
                <th className="px-8 py-5">Arrivée</th>
                <th className="px-8 py-5 text-center">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visitesLoading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-gray-400 font-bold">Chargement...</td></tr>
              ) : !visites || visites.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">Aucune visite active pour le moment</td></tr>
              ) : (
                visites.map((v: any) => (
                  <tr key={v.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black shadow-lg shadow-slate-200">
                        {v.badgeCode || '---'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                       <p className="font-black text-gray-800 text-sm uppercase">{v.visiteurNom} {v.visiteurPrenom}</p>
                       <p className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">{v.visiteurType}</p>
                    </td>
                    <td className="px-8 py-5 text-xs text-gray-600 font-black uppercase tracking-tighter italic">{v.serviceNom}</td>
                    <td className="px-8 py-5 text-sm font-black text-indigo-600 tabular-nums">
                      {new Date(v.dateHeureArrivee).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <StatusDot status={v.statut} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

/* COMPOSANT ACTION RAPIDE GÉANT ET CLICKABLE */

const QuickAction: React.FC<{ title: string, desc: string, icon: React.ReactNode, onClick: () => void, color: string }> = ({ title, desc, icon, onClick, color }) => (
  <button 
    onClick={onClick}
    className="bg-white p-10 rounded-[2.5rem] shadow-sm border-2 border-gray-100 hover:border-blue-500 hover:shadow-2xl transition-all group flex flex-col items-center text-center w-full relative overflow-hidden active:scale-95"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-[4] transition-transform duration-1000`}></div>
    <div className={`w-20 h-20 ${color} text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10`}>
      {icon}
    </div>
    <div className="relative z-10">
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2 leading-none">{title}</h3>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">{desc}</p>
    </div>
    <div className="mt-6 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
       Lancer l'opération <ArrowRight size={14} />
    </div>
  </button>
);

const StatusDot: React.FC<{ status: string }> = ({ status }) => {
  const configs: Record<string, {label: string, dot: string, bg: string}> = {
    'EN_ATTENTE': { label: 'En attente', dot: 'bg-orange-500', bg: 'bg-orange-50 text-orange-700' },
    'EN_COURS': { label: 'En cours', dot: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700' },
    'TERMINEE': { label: 'Terminée', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700' },
  };
  const cfg = configs[status] || configs['EN_ATTENTE'];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${cfg.bg} text-[9px] font-black uppercase tracking-widest border border-current opacity-80`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </div>
  );
};
