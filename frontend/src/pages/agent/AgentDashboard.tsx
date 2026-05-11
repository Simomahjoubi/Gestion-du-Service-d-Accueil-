import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  Clock, Search, ArrowUpRight, Plus, ScanLine, History, TrendingUp, BarChart3, UserCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => visiteService.getStatsToday(),
    refetchInterval: 30000,
  });

  const { data: visites } = useQuery({
    queryKey: ['visites-today'],
    queryFn: () => visiteService.getVisitesToday(),
    refetchInterval: 30000,
  });

  const chartData = [
    { name: '08h', value: 2 }, { name: '10h', value: 8 },
    { name: '12h', value: 15 }, { name: '14h', value: 12 },
    { name: '16h', value: 20 },
  ];
  
  const badgesData = [
    { name: 'Occupés', value: stats?.badgesOccupes || 0 },
    { name: 'Libres', value: stats?.badgesLibres || 0 },
  ];
  
  const COLORS = ['#94a3b8', '#0ea5e9'];

  return (
    <div className="min-h-screen bg-[#f1f5f9] space-y-6 pb-20 -m-8 p-8 font-sans">
      
      {/* Header Froid */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
           <h1 className="text-[15px] font-bold text-slate-800 uppercase">Espace <span className="text-blue-600">Agent</span></h1>
           <p className="text-slate-500 mt-2 text-[13px]">Flux d'accueil et badges.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
           <Clock className="text-slate-500" size={14} />
           <span className="text-slate-700 font-bold text-[13px]">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      {/* Action Cards Froid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        <ColdActionButton title="Nouvelle Visite" icon={<Plus size={18} />} theme="blue" onClick={() => navigate('/agent/nouvelle-visite')} />
        <ColdActionButton title="Restituer Badge" icon={<ScanLine size={18} />} theme="teal" onClick={() => navigate('/agent/restitution')} />
        <ColdActionButton title="Historique" icon={<History size={18} />} theme="slate" onClick={() => navigate('/agent/historique')} />
      </div>

      {/* Analytics Froid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1 mt-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-[13px] font-bold text-slate-700 uppercase mb-8 flex items-center gap-3">
             <TrendingUp size={16} className="text-blue-500"/> Flux des Visites
           </h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                 <Tooltip />
                 <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fill="#e0f2fe" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-[13px] font-bold text-slate-700 uppercase mb-8 flex items-center gap-3">
             <BarChart3 size={16} className="text-slate-500"/> Disponibilité
           </h3>
           <div className="h-64 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={badgesData} dataKey="value" innerRadius={60} outerRadius={80} stroke="none">
                   {badgesData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>


      {/* Table Visites Froid */}
      <div className="px-1 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-700 uppercase">Visites Actives</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input type="text" placeholder="Filtrer..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-40" />
            </div>
          </div>
          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full text-[13px] text-left border-separate border-spacing-y-2">
              <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <tr><th className="px-6 py-4">Badge</th><th className="px-6 py-4">Visiteur</th><th className="px-6 py-4">Service</th><th className="px-6 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visites?.map((v: any) => (
                  <tr key={v.id} className="bg-white hover:bg-slate-50">
                    <td className="px-6 py-4"><span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-xs">{v.badgeCode}</span></td>
                    <td className="px-6 py-4 font-bold text-slate-700">{v.visiteurNom} {v.visiteurPrenom}</td>
                    <td className="px-6 py-4 text-slate-500 italic">{v.serviceNom}</td>
                    <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-blue-600"><ArrowUpRight size={16} /></button></td>
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

const ColdActionButton: React.FC<{ title: string, icon: React.ReactNode, theme: 'blue' | 'teal' | 'slate', onClick: () => void }> = ({ title, icon, theme, onClick }) => {
  const styles = {
    blue:   { bg: 'bg-blue-50', text: 'text-blue-700' },
    teal:   { bg: 'bg-teal-50', text: 'text-teal-700' },
    slate:  { bg: 'bg-slate-100', text: 'text-slate-700' },
  };
  const s = styles[theme];
  return (
    <button onClick={onClick} className={`p-5 rounded-lg border border-slate-200 flex items-center gap-4 text-left ${s.bg}`}>
      <div className={s.text}>{icon}</div>
      <span className={`text-[13px] font-bold ${s.text}`}>{title}</span>
    </button>
  );
};
