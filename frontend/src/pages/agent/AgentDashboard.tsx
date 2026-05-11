import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { Plus, ScanLine, History, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Design Unifié : 
 * - Font: font-sans (Inter/System), text-[13px] pour les labels.
 * - Palette: "Premium Administrative" (Soft Blues, Crisp Whites, Slate Greys).
 * - Layout: High-end Administrative Dashboard.
 */

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
    { name: 'Occupés', value: stats?.badgesOccupes ?? 0 },
    { name: 'Libres', value: stats?.badgesLibres ?? 0 },
  ];
  const pieColors = ['#e2e8f0', '#2563eb']; // Slate 200, Blue 600

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header - Aligné sur la Navbar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="space-y-1">
            <h1 className="text-[15px] font-bold text-slate-800 uppercase tracking-widest">Tableau de Bord Agent</h1>
            <p className="text-[13px] text-slate-500">Supervision en temps réel des accès et du flux visiteur.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm">
            <Clock size={16} className="text-blue-700" />
            <span className="text-[14px] font-bold text-slate-800 tabular-nums">
              {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        </div>

        {/* Action Bar - Design Premium Pro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton title="Nouvelle Visite" icon={<Plus size={18} />} onClick={() => navigate('/agent/nouvelle-visite')} color="blue" />
          <ActionButton title="Restituer Badge" icon={<ScanLine size={18} />} onClick={() => navigate('/agent/restitution')} color="teal" />
          <ActionButton title="Historique" icon={<History size={18} />} onClick={() => navigate('/agent/historique')} color="slate" />
        </div>

        {/* Main Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flux Visiteurs */}
          <div className="lg:col-span-2 bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-700 uppercase mb-8">Flux visiteurs par heure</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                  <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Badge Status */}
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center">
            <h3 className="text-[13px] font-bold text-slate-700 uppercase w-full mb-8">Badges Disponibles</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={80} stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-2xl font-bold text-slate-800">{stats?.badgesLibres ?? 0}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Libres</span>
              </div>
            </div>
          </div>

          {/* Visites Table */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
                <h3 className="text-[13px] font-bold text-slate-700 uppercase">Visites Actives</h3>
                <button onClick={() => navigate('/agent/historique')} className="text-blue-700 text-[11px] font-bold uppercase hover:underline">Voir tout</button>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-8 py-4">Heure</th>
                  <th className="px-8 py-4">Visiteur</th>
                  <th className="px-8 py-4">Badge</th>
                  <th className="px-8 py-4">Service</th>
                  <th className="px-8 py-4">Motif</th>
                  <th className="px-8 py-4">Fonctionnaire</th>
                  <th className="px-8 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visites?.slice(0, 4).map((v: any) => (
                  <tr key={v.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-8 py-4 text-slate-500">{v.heureArrivee ? v.heureArrivee.substring(11, 16) : '-'}</td>
                    <td className="px-8 py-4 font-medium text-slate-700">{v.visiteurNom}</td>
                    <td className="px-8 py-4 font-mono font-bold text-blue-700">{v.badgeCode || '-'}</td>
                    <td className="px-8 py-4 text-slate-500 italic">{v.serviceNom}</td>
                    <td className="px-8 py-4 text-slate-500">{v.motifLibelle || '-'}</td>
                    <td className="px-8 py-4 text-slate-500">{v.fonctionnaireNom || '-'}</td>
                    <td className="px-8 py-4 font-bold text-blue-800">{v.statut}</td>
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

const ActionButton: React.FC<{ title: string, icon: React.ReactNode, onClick: () => void, color: 'blue' | 'teal' | 'slate' }> = ({ title, icon, onClick, color }) => {
  const colors = {
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    teal: 'border-teal-200 bg-teal-50 text-teal-800',
    slate: 'border-slate-200 bg-slate-100 text-slate-800',
  };
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-3 px-6 py-4 border rounded-md transition-all font-bold text-[13px] ${colors[color]}`}
    >
      {icon} {title}
    </button>
  );
};
