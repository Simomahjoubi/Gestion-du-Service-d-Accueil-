import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  RefreshCcw, History, TrendingUp, BarChart3, UserCheck, Shield, Clock, Search, ArrowUpRight, Plus, ScanLine
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Palette "Agent Warm & Creative" :
 * - Dégradés dynamiques
 * - Cartes d'action vibrantes
 * - Alignement font-sans text-[13px]
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

  return (
    <div className="min-h-screen bg-[#fffcf9] space-y-8 pb-20 -m-8 p-8 font-sans">
      
      {/* Header Agent Warm */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-8 border border-blue-100 shadow-sm shadow-blue-900/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-50 rounded-md mb-3 border border-blue-100">
              <Shield className="text-blue-600" size={12} />
              <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">Poste de Contrôle Accueil</span>
            </div>
            <h1 className="text-[16px] font-bold text-slate-700 tracking-tight uppercase">Espace <span className="text-blue-600">Agent</span></h1>
            <p className="text-slate-500 mt-2 text-[13px] leading-relaxed">
              Supervision des flux d'entrées et gestion sécurisée des accès visiteurs.
            </p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={handleRefresh} className="bg-white border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-all group">
                <RefreshCcw className="text-blue-500 group-hover:rotate-180 transition-transform duration-700" size={14} />
                <span className="text-slate-400 text-[9px] font-bold uppercase mt-0.5 tracking-widest">Actualiser</span>
             </button>
             <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                <Clock className="text-amber-500" size={14} />
                <span className="text-slate-700 font-bold text-[13px]">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Action Cards Vibrantes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        <WarmActionButton 
          title="Nouvelle Visite" 
          icon={<Plus size={20} />} 
          theme="blue"
          onClick={() => navigate('/agent/nouvelle-visite')}
        />
        <WarmActionButton 
          title="Restituer Badge" 
          icon={<ScanLine size={20} />} 
          theme="amber"
          onClick={() => navigate('/agent/restitution')}
        />
        <WarmActionButton 
          title="Historique" 
          icon={<History size={20} />} 
          theme="slate"
          onClick={() => navigate('/agent/historique')}
        />
      </div>

      {/* Stats Section Creative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-1 mt-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-50 transition-all hover:shadow-2xl">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-[13px] font-bold text-slate-700 uppercase flex items-center gap-3 tracking-widest">
               <TrendingUp size={16} className="text-blue-500"/> 
               Activité du jour
             </h3>
             <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-700 text-[9px] font-bold uppercase tracking-widest">En Direct</span>
             </div>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorAgentWarm" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                 <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }} 
                   itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                 />
                 <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAgentWarm)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-50 transition-all hover:shadow-2xl">
           <h3 className="text-[13px] font-bold text-slate-700 uppercase mb-8 flex items-center gap-3 tracking-widest">
             <BarChart3 size={16} className="text-amber-500"/> 
             Disponibilité
           </h3>
           <div className="h-64 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie 
                   data={badgesData} 
                   dataKey="value" 
                   innerRadius={65} 
                   outerRadius={85} 
                   paddingAngle={10}
                   stroke="none"
                 >
                   {badgesData.map((_, i) => <Cell key={i} fill={i === 1 ? '#3b82f6' : '#fbbf24'} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{stats?.badgesLibres || 0}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Badges Libres</span>
             </div>
           </div>
        </div>
      </div>

      {/* Table Visites Soft */}
      <div className="px-1 mt-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                 <UserCheck size={18} />
               </div>
               <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-tight">Visites Actives</h3>
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-400 transition-colors" size={14} />
              <input type="text" placeholder="Recherche rapide..." className="pl-9 pr-4 py-2 bg-slate-50/50 border-none rounded-xl text-[12px] focus:ring-1 focus:ring-blue-100 w-48 transition-all" />
            </div>
          </div>
          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full text-[13px] text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Badge</th>
                  <th className="px-6 py-4">Visiteur</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visites?.map((v: any) => (
                  <tr key={v.id} className="group bg-white hover:bg-slate-50 transition-all border border-slate-100">
                    <td className="px-6 py-5 first:rounded-l-2xl border-y border-l group-hover:border-blue-100">
                      <span className="font-mono font-black text-[11px] text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all">
                        {v.badgeCode}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-y group-hover:border-blue-100">
                      <div className="font-bold text-slate-700">{v.visiteurNom} {v.visiteurPrenom}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">Identifié</div>
                    </td>
                    <td className="px-6 py-5 border-y group-hover:border-blue-100">
                      <div className="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></div>
                        <span className="font-semibold text-slate-600 italic text-[11px]">{v.serviceNom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 last:rounded-r-2xl border-y border-r group-hover:border-blue-100 text-right">
                       <button className="p-2.5 hover:bg-blue-100 text-blue-500 hover:text-blue-700 rounded-xl transition-all shadow-sm">
                          <ArrowUpRight size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const WarmActionButton: React.FC<{ title: string, icon: React.ReactNode, theme: 'blue' | 'amber' | 'slate', onClick?: () => void }> = ({ title, icon, theme, onClick }) => {
  const styles = {
    blue:   { bg: 'from-blue-600 to-blue-400',   light: 'bg-blue-50',   text: 'text-blue-600',   shadow: 'shadow-blue-200' },
    amber:  { bg: 'from-amber-500 to-orange-400', light: 'bg-amber-50',  text: 'text-amber-600',  shadow: 'shadow-amber-200' },
    slate:  { bg: 'from-slate-700 to-slate-500',  light: 'bg-slate-50',  text: 'text-slate-600',  shadow: 'shadow-slate-200' },
  };
  const s = styles[theme];

  return (
    <button 
      onClick={onClick}
      className={`group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-xl ${s.shadow} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex items-center gap-5 text-left overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      <div className={`relative z-10 w-12 h-12 rounded-xl ${s.light} ${s.text} flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all duration-500 shadow-inner`}>
        {icon}
      </div>
      <div className="relative z-10">
        <h4 className="font-bold text-slate-700 text-[13px] tracking-tight group-hover:text-white transition-colors uppercase tracking-widest">{title}</h4>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 group-hover:text-white/70 transition-colors">Action Rapide</p>
      </div>
    </button>
  );
};
