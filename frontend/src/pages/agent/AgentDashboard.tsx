import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  UserPlus, Key, RefreshCcw, History, TrendingUp, BarChart3, UserCheck, Shield, Clock, Search, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Palette de couleurs "Agent Light & Creative" :
 * - Bleu Principal : #3b82f6
 * - Accent Or      : #fbbf24
 * - Fond           : #f8fafc
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
  
  const COLORS = ['#fbbf24', '#3b82f6']; // Jaune et Bleu clair

  return (
    <div className="min-h-screen bg-[#f8fafc] space-y-10 pb-20 -m-8 p-8">
      
      {/* Header Soft Agent */}
      <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-10 border border-blue-100/50 shadow-xl shadow-blue-900/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4 border border-blue-100">
              <Shield className="text-blue-600" size={14} />
              <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">Poste de Contrôle Accueil</span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Espace <span className="text-blue-600">Agent</span></h1>
            <p className="text-slate-500 mt-3 max-w-md text-base leading-relaxed">
              Supervisez les flux d'entrées et gérez les accès sécurisés en temps réel.
            </p>
          </div>
          
          <div className="flex gap-4">
             <button onClick={handleRefresh} className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col items-center justify-center min-w-[110px] shadow-sm hover:bg-white transition-all group">
                <RefreshCcw className="text-blue-500 mb-2 group-hover:rotate-180 transition-transform duration-700" size={20} />
                <span className="text-slate-400 text-[10px] font-bold uppercase mt-1">Refresh</span>
             </button>
             <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col items-center justify-center min-w-[110px] shadow-sm">
                <Clock className="text-amber-500 mb-2" size={20} />
                <span className="text-slate-800 font-black text-xl">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Access Buttons Soft */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
        <ActionButton 
          title="Nouvelle Visite" 
          icon={<UserPlus size={24} />} 
          onClick={() => navigate('/agent/nouvelle-visite')} 
          theme="blue"
        />
        <ActionButton 
          title="Restitution Badge" 
          icon={<Key size={24} />} 
          onClick={() => navigate('/agent/restitution')} 
          theme="amber"
        />
        <ActionButton 
          title="Historique" 
          icon={<History size={24} />} 
          onClick={() => navigate('/agent/historique')} 
          theme="slate"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 mt-12">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:shadow-2xl">
           <div className="flex items-center justify-between mb-10">
             <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
               <TrendingUp size={22} className="text-blue-500"/> 
               Activité du jour
             </h3>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Live Feed</span>
             </div>
           </div>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                 <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAgent)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:shadow-2xl">
           <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-3">
             <BarChart3 size={22} className="text-amber-500"/> 
             Stock Badges
           </h3>
           <div className="h-72 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie 
                   data={badgesData} 
                   dataKey="value" 
                   innerRadius={80} 
                   outerRadius={105} 
                   paddingAngle={10}
                   stroke="none"
                 >
                   {badgesData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-800">{stats?.badgesLibres || 0}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Disponibles</span>
             </div>
           </div>
        </div>
      </div>

      {/* Active Table Soft */}
      <div className="px-2 mt-12">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                 <UserCheck size={24} />
               </div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">Visites Actives</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="Filtrer..." className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-blue-100 w-48" />
            </div>
          </div>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
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
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-mono font-black text-xs">
                        {v.badgeCode}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-y group-hover:border-blue-100">
                      <div className="font-bold text-slate-700">{v.visiteurNom} {v.visiteurPrenom}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Identifié</div>
                    </td>
                    <td className="px-6 py-5 border-y group-hover:border-blue-100">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span className="font-semibold text-slate-600 italic">{v.serviceNom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 last:rounded-r-2xl border-y border-r group-hover:border-blue-100 text-right">
                       <button className="p-2 hover:bg-blue-50 text-blue-400 hover:text-blue-600 rounded-lg transition-colors">
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

const ActionButton: React.FC<{ title: string, icon: React.ReactNode, onClick: () => void, theme: 'blue' | 'amber' | 'slate' }> = ({ title, icon, onClick, theme }) => {
  const styles = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
    slate:  { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-100' },
  };
  const s = styles[theme];

  return (
    <button 
      onClick={onClick} 
      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 flex items-center gap-6 text-left"
    >
      <div className={`w-16 h-16 rounded-[1.5rem] ${s.bg} ${s.text} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-inner`}>
        {icon}
      </div>
      <div>
        <h4 className="font-black text-slate-800 text-xl tracking-tight leading-tight">{title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 group-hover:text-blue-500 transition-colors">Accès Rapide</p>
      </div>
    </button>
  );
};
