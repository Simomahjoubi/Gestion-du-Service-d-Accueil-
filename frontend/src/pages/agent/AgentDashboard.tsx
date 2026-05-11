import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  Clock, ArrowUpRight, Plus, ScanLine, History
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => visiteService.getStatsToday(), refetchInterval: 30000 });
  const { data: visites } = useQuery({ queryKey: ['visites-today'], queryFn: () => visiteService.getVisitesToday(), refetchInterval: 30000 });

  const chartData = [
    { time: '08:00', visitors: 12 }, { time: '10:00', visitors: 28 },
    { time: '12:00', visitors: 45 }, { time: '14:00', visitors: 32 },
    { time: '16:00', visitors: 58 }, { time: '18:00', visitors: 25 },
  ];
  
  const pieData = [
    { name: 'Occupés', value: stats?.badgesOccupes || 0 },
    { name: 'Libres', value: stats?.badgesLibres || 0 },
  ];
  
  const pieColors = ['#0f172a', '#38bdf8']; // Slate 900, Sky 400

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header Section */}
        <div className="lg:col-span-12 flex justify-between items-end mb-4">
          <div>
            <h1 className="text-[18px] font-bold text-slate-800 uppercase tracking-wide">Tableau de bord Agent</h1>
            <p className="text-slate-500 text-[13px]">Flux d'accueil en temps réel</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/agent/nouvelle-visite')} className="px-4 py-2 bg-blue-600 text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 transition">Nouvelle Visite</button>
          </div>
        </div>

        {/* Action Cards Froid */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ColdActionButton title="Nouvelle Visite" icon={<Plus size={18} />} theme="blue" onClick={() => navigate('/agent/nouvelle-visite')} />
          <ColdActionButton title="Restituer Badge" icon={<ScanLine size={18} />} theme="teal" onClick={() => navigate('/agent/restitution')} />
          <ColdActionButton title="Historique" icon={<History size={18} />} theme="slate" onClick={() => navigate('/agent/historique')} />
        </div>

        {/* Chart: Activity (Creative Area Chart) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-8">Flux visiteurs par heure</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="visitors" stroke="#0ea5e9" strokeWidth={3} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Badges (Creative Donut Chart) */}
        <div className="lg:col-span-4 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest w-full mb-8">Disponibilité Badges</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={90} cornerRadius={10} paddingAngle={5} stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <span className="text-3xl font-black text-slate-800">{stats?.badgesLibres || 0}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Libres</span>
            </div>
          </div>
        </div>

        {/* Visites Table */}
        <div className="lg:col-span-12 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-4">Badge</th>
                <th className="px-8 py-4">Visiteur</th>
                <th className="px-8 py-4">Service</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visites?.map((v: any) => (
                <tr key={v.id} className="hover:bg-blue-50/50 transition">
                  <td className="px-8 py-4 font-mono font-bold text-blue-600">{v.badgeCode}</td>
                  <td className="px-8 py-4 font-semibold">{v.visiteurNom} {v.visiteurPrenom}</td>
                  <td className="px-8 py-4 text-slate-500">{v.serviceNom}</td>
                  <td className="px-8 py-4 text-right"><ArrowUpRight size={16} className="ml-auto text-slate-400 hover:text-blue-600 cursor-pointer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
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
