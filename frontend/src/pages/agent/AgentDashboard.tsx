import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  UserPlus, Key, RefreshCcw, History, TrendingUp, BarChart3, UserCheck, Shield, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Palette de couleurs basée sur le logo :
 * - Bleu Foncé (Primaire) : #1e40af
 * - Jaune/Or (Accent)     : #fbbf24
 * - Bleu Moyen            : #3b82f6
 */

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => visiteService.getStatsToday(),
    refetchInterval: 30000,
  });

  const { data: visites, refetch: refetchVisites } = useQuery({
    queryKey: ['visites-today'],
    queryFn: () => visiteService.getVisitesToday(),
    refetchInterval: 30000,
  });

  const handleRefresh = () => { refetchStats(); refetchVisites(); };

  const chartData = [
    { name: '08h', value: 2 }, { name: '10h', value: 8 },
    { name: '12h', value: 15 }, { name: '14h', value: 12 },
    { name: '16h', value: 20 },
  ];
  
  const badgesData = [
    { name: 'Occupés', value: stats?.badgesOccupes || 0 },
    { name: 'Libres', value: stats?.badgesLibres || 0 },
  ];
  
  const COLORS = ['#fbbf24', '#1e40af']; // Jaune et Bleu du logo

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-8 pb-20 -m-8 p-8">
      
      {/* Header Créatif Style Admin */}
      <div className="relative overflow-hidden bg-[#1e40af] rounded-3xl p-8 mb-10 shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbf24] opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-[#fbbf24]" size={20} />
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Poste de Contrôle Accueil</span>
            </div>
            <h1 className="text-3xl font-black text-white">Tableau de Bord Agent</h1>
            <p className="text-blue-100/80 mt-2 max-w-md text-sm leading-relaxed">
              Gérez les entrées, les badges et assurez le suivi fluide des visiteurs de la Fondation.
            </p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={handleRefresh} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px] hover:bg-white/20 transition-all group">
                <RefreshCcw className="text-[#fbbf24] mb-1 group-hover:rotate-180 transition-transform duration-500" size={18} />
                <span className="text-white font-bold text-sm uppercase">Actualiser</span>
             </button>
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                <Clock className="text-[#fbbf24] mb-1" size={18} />
                <span className="text-white font-bold text-lg">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="text-blue-200 text-[10px] uppercase">Heure</span>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Plus stylisées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
        <StatButton 
          title="Nouvelle Visite" 
          desc="Enregistrer un arrivant"
          icon={<UserPlus size={24} />} 
          onClick={() => navigate('/agent/nouvelle-visite')} 
          color="blue" 
        />
        <StatButton 
          title="Restitution Badge" 
          desc="Libérer un accès"
          icon={<Key size={24} />} 
          onClick={() => navigate('/agent/restitution')} 
          color="amber" 
        />
        <StatButton 
          title="Historique" 
          desc="Consulter les archives"
          icon={<History size={24} />} 
          onClick={() => navigate('/agent/historique')} 
          color="indigo" 
        />
      </div>

      {/* Row 2: Charts & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 mt-12">
        {/* Flux Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 transition-all hover:shadow-2xl">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
               <TrendingUp size={20} className="text-[#3b82f6]"/> 
               Flux des Visites
             </h3>
             <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full">TEMPS RÉEL</div>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                 <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Badges Pie */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 transition-all hover:shadow-2xl">
           <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-3">
             <BarChart3 size={20} className="text-[#fbbf24]"/> 
             État des Badges
           </h3>
           <div className="h-64 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie 
                   data={badgesData} 
                   dataKey="value" 
                   innerRadius={70} 
                   outerRadius={95} 
                   paddingAngle={8}
                   stroke="none"
                 >
                   {badgesData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-800">{stats?.badgesLibres || 0}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Libres</span>
             </div>
           </div>
        </div>
      </div>

      {/* Row 3: Active Visits Table */}
      <div className="px-2 mt-12">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
              <UserCheck size={22} className="text-[#1e40af]" />
              Visites en cours
            </h3>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
              {visites?.length || 0} Actives
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">Badge Code</th>
                  <th className="px-8 py-5">Visiteur</th>
                  <th className="px-8 py-5">Service de Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {visites?.map((v: any) => (
                  <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-mono font-bold group-hover:bg-[#1e40af] group-hover:text-white transition-colors">
                        {v.badgeCode}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-800">{v.visiteurNom} {v.visiteurPrenom}</div>
                      <div className="text-[10px] text-gray-400 uppercase mt-0.5">Visiteur</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
                        <span className="font-medium text-gray-600">{v.serviceNom}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!visites || visites.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-medium italic">
                      Aucune visite en cours pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatButton: React.FC<{ title: string, desc: string, icon: React.ReactNode, onClick: () => void, color: 'blue' | 'amber' | 'indigo' }> = ({ title, desc, icon, onClick, color }) => {
  const themes = {
    blue:   { bg: 'bg-blue-50',   iconBg: 'bg-[#1e40af]', iconColor: 'text-white',     shadow: 'shadow-blue-100', accent: 'bg-[#1e40af]' },
    amber:  { bg: 'bg-amber-50',  iconBg: 'bg-[#fbbf24]', iconColor: 'text-gray-900', shadow: 'shadow-amber-100', accent: 'bg-[#fbbf24]' },
    indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-600', iconColor: 'text-white',     shadow: 'shadow-indigo-100', accent: 'bg-indigo-600' },
  };
  const theme = themes[color];

  return (
    <button 
      onClick={onClick} 
      className={`group w-full bg-white p-1 rounded-[2rem] border border-gray-100 ${theme.shadow} shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl text-left`}
    >
      <div className="bg-white p-6 rounded-[1.8rem] flex items-center gap-6">
        <div className={`${theme.iconBg} ${theme.iconColor} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div>
          <h4 className="font-black text-gray-800 text-lg leading-tight">{title}</h4>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">{desc}</p>
        </div>
      </div>
    </button>
  );
};
