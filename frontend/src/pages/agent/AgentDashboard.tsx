import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { ArrowUpRight, Plus, ScanLine, History } from 'lucide-react';
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
  
  // Mock data for demonstration if API returns empty
  const mockVisites = [
    { id: 1, badgeCode: 'B-001', visiteurNom: 'ALAMI', visiteurPrenom: 'Youssef', serviceNom: 'Direction Générale' },
    { id: 2, badgeCode: 'B-002', visiteurNom: 'BENANI', visiteurPrenom: 'Fatima', serviceNom: 'Service Accueil' },
    { id: 3, badgeCode: 'B-003', visiteurNom: 'RACHIDI', visiteurPrenom: 'Omar', serviceNom: 'Ressources Humaines' },
    { id: 4, badgeCode: 'B-004', visiteurNom: 'MANSOURI', visiteurPrenom: 'Salma', serviceNom: 'Comptabilité' },
  ];

  const displayVisites = visites && visites.length > 0 ? visites : mockVisites;
  
  const pieData = [
    { name: 'Occupés', value: stats?.badgesOccupes ?? 15 },
    { name: 'Libres', value: stats?.badgesLibres ?? 35 },
  ];
  
  const pieColors = ['#e2e8f0', '#2563eb']; // Slate 200, Blue 600

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header - Aligné sur la Navbar */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[15px] font-bold text-slate-800 uppercase tracking-widest">Tableau de Bord</h1>
            <p className="text-[13px] text-slate-500">Supervision en temps réel des accès et du flux visiteur.</p>
          </div>
          <button 
            onClick={() => navigate('/agent/nouvelle-visite')} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md text-[13px] font-bold hover:bg-blue-800 transition shadow-sm"
          >
            <Plus size={16} /> Enregistrer Arrivée
          </button>
        </div>

        {/* Action Bar - Design Premium Pro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton title="Nouvelle Visite" icon={<Plus size={18} />} onClick={() => navigate('/agent/nouvelle-visite')} />
          <ActionButton title="Restituer Badge" icon={<ScanLine size={18} />} onClick={() => navigate('/agent/restitution')} />
          <ActionButton title="Historique" icon={<History size={18} />} onClick={() => navigate('/agent/historique')} />
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
                <span className="text-2xl font-bold text-slate-800">{stats?.badgesLibres ?? 35}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Libres</span>
              </div>
            </div>
          </div>

          {/* Visites Table */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-8 py-4">Badge</th>
                  <th className="px-8 py-4">Visiteur</th>
                  <th className="px-8 py-4">Service</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayVisites.map((v: any) => (
                  <tr key={v.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-8 py-4 font-mono font-bold text-blue-700">{v.badgeCode}</td>
                    <td className="px-8 py-4 font-medium text-slate-700">{v.visiteurNom} {v.visiteurPrenom}</td>
                    <td className="px-8 py-4 text-slate-500 italic">{v.serviceNom}</td>
                    <td className="px-8 py-4 text-right"><ArrowUpRight size={16} className="ml-auto text-slate-400 hover:text-blue-700 cursor-pointer" /></td>
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

const ActionButton: React.FC<{ title: string, icon: React.ReactNode, onClick: () => void }> = ({ title, icon, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all text-slate-700 font-bold text-[13px]"
  >
    {icon} {title}
  </button>
);
