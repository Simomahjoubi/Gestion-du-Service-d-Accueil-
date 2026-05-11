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
 * - Alignement strict sur les styles du Navbar (font-sans, text-[13px], font-bold)
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
    <div className="min-h-screen bg-[#f8fafc] space-y-6 pb-20 -m-8 p-8 font-sans">
      
      {/* Header Soft Agent - Style Aligné sur Navbar */}
      <div className="relative overflow-hidden bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-40"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-50 rounded-md mb-3 border border-blue-100">
              <Shield className="text-blue-600" size={12} />
              <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">Poste de Contrôle Accueil</span>
            </div>
            <h1 className="text-[15px] font-bold text-gray-700 tracking-tight uppercase">Espace <span className="text-blue-700">Agent</span></h1>
            <p className="text-gray-500 mt-2 text-[13px] leading-relaxed">
              Supervision des flux d'entrées et gestion des accès sécurisés.
            </p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={handleRefresh} className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm hover:bg-white transition-all group">
                <RefreshCcw className="text-blue-500 group-hover:rotate-180 transition-transform duration-700" size={14} />
                <span className="text-gray-400 text-[9px] font-bold uppercase mt-0.5">Refresh</span>
             </button>
             <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
                <Clock className="text-amber-500" size={14} />
                <span className="text-gray-700 font-bold text-[13px]">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Access Buttons Soft */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        <ActionButton 
          title="Nouvelle Visite" 
          icon={<UserPlus size={18} />} 
          onClick={() => navigate('/agent/nouvelle-visite')} 
          theme="blue"
        />
        <ActionButton 
          title="Restitution Badge" 
          icon={<Key size={18} />} 
          onClick={() => navigate('/agent/restitution')} 
          theme="amber"
        />
        <ActionButton 
          title="Historique" 
          icon={<History size={18} />} 
          onClick={() => navigate('/agent/historique')} 
          theme="slate"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1 mt-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200 transition-all hover:border-blue-200">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-[13px] font-bold text-gray-700 uppercase flex items-center gap-3">
               <TrendingUp size={16} className="text-blue-500"/> 
               Activité du jour
             </h3>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Live Feed</span>
             </div>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                 <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAgent)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 transition-all hover:border-blue-200">
           <h3 className="text-[13px] font-bold text-gray-700 uppercase mb-8 flex items-center gap-3">
             <BarChart3 size={16} className="text-amber-500"/> 
             Stock Badges
           </h3>
           <div className="h-64 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie 
                   data={badgesData} 
                   dataKey="value" 
                   innerRadius={65} 
                   outerRadius={85} 
                   paddingAngle={8}
                   stroke="none"
                 >
                   {badgesData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-700">{stats?.badgesLibres || 0}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Libres</span>
             </div>
           </div>
        </div>
      </div>

      {/* Active Table Soft */}
      <div className="px-1 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                 <UserCheck size={16} />
               </div>
               <h3 className="text-[13px] font-bold text-gray-700 uppercase">Visites Actives</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
              <input type="text" placeholder="Filtrer..." className="pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-100 w-40" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-gray-50/50 text-gray-400 uppercase text-[9px] font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-4">Badge</th>
                  <th className="px-8 py-4">Visiteur</th>
                  <th className="px-8 py-4">Service</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visites?.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-8 py-4">
                      <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">
                        {v.badgeCode}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="font-bold text-gray-700">{v.visiteurNom} {v.visiteurPrenom}</div>
                    </td>
                    <td className="px-8 py-4 text-gray-500 italic">
                      {v.serviceNom}
                    </td>
                    <td className="px-8 py-4 text-right">
                       <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          <ArrowUpRight size={16} />
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
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600' },
    slate:  { bg: 'bg-slate-50',  text: 'text-slate-600' },
  };
  const s = styles[theme];

  return (
    <button 
      onClick={onClick} 
      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all duration-300 flex items-center gap-4 text-left group"
    >
      <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.text} flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-700 text-[13px] tracking-tight">{title}</h4>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Accès Rapide</p>
      </div>
    </button>
  );
};
