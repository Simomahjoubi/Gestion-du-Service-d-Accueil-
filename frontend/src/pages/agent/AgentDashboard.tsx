import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  History, 
  Clock, 
  Users, 
  ShieldCheck, 
  Activity,
  ArrowRight,
  UserPlus,
  RotateCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, YAxis, CartesianGrid } from 'recharts';

/**
 * Design Équilibré : Professionnel & Administratif
 * - Font: font-sans (Inter), text-[13px] pour la cohérence avec la navbar.
 * - Palette: Slate 800 (Text), Blue 600 (Accents), Gray 100 (Borders).
 * - Style: Card-based avec arrondis modérés et ombres légères.
 */

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => visiteService.getStatsToday(), refetchInterval: 30000 });
  const { data: visites } = useQuery({ queryKey: ['visites-today'], queryFn: () => visiteService.getVisitesToday(), refetchInterval: 30000 });
  const { data: hourlyData } = useQuery({ queryKey: ['hourly-stats'], queryFn: () => visiteService.getHourlyStats(), refetchInterval: 60000 });

  const chartData = hourlyData?.map((count: number, i: number) => ({ time: `${i}:00`, visitors: count })) ?? [];
  
  const pieData = [
    { name: 'Occupés', value: stats?.badgesOccupes ?? 0 },
    { name: 'Libres', value: stats?.badgesLibres ?? 0 },
  ];
  const pieColors = ['#f1f5f9', '#2563eb']; // Slate 100, Blue 600

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Section */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-[15px] font-bold text-slate-800 uppercase tracking-widest">Tableau de Bord Agent</h1>
            <p className="text-[13px] text-slate-500 mt-1">Supervision des accès et gestion du flux visiteur.</p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm">
            <Clock size={16} className="text-blue-600" />
            <span className="text-[14px] font-bold text-slate-700 tabular-nums">
              {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        </div>

        {/* Action Grid - Professional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ActionCard 
            title="Nouvelle Visite" 
            label="Enregistrement"
            icon={<UserPlus size={20} />} 
            onClick={() => navigate('/agent/nouvelle-visite')} 
            color="blue"
          />
          <ActionCard 
            title="Gérer les badges" 
            label="Suivi et clôture des accès"
            icon={<RotateCcw size={20} />} 
            onClick={() => navigate('/agent/restitution')} 
            color="slate"
          />
          <ActionCard 
            title="Historique" 
            label="Journal d'activité"
            icon={<History size={20} />} 
            onClick={() => navigate('/agent/historique')} 
            color="white"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Charts Area */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <Activity size={18} className="text-blue-600" />
              <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Flux des Visiteurs (24h)</h3>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Badge Status */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center gap-2 mb-8">
              <ShieldCheck size={18} className="text-blue-600" />
              <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">État des Badges</h3>
            </div>
            
            <div className="relative h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={80} stroke="none" paddingAngle={5}>
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-3xl font-bold text-slate-800">{stats?.badgesLibres ?? 0}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Disponibles</span>
              </div>
            </div>

            <div className="w-full mt-6 space-y-2">
               <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-md border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Occupés</span>
                  <span className="text-[13px] font-bold text-slate-800">{stats?.badgesOccupes ?? 0}</span>
               </div>
               <div className="flex justify-between items-center px-4 py-2 bg-blue-50 rounded-md border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-600 uppercase">Libres</span>
                  <span className="text-[13px] font-bold text-blue-700">{stats?.badgesLibres ?? 0}</span>
               </div>
            </div>
          </div>

          {/* Visits Table */}
          <div className="lg:col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-slate-500" />
                  <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Visites en cours</h3>
                </div>
                <button onClick={() => navigate('/agent/historique')} className="text-blue-600 text-[11px] font-bold uppercase hover:underline flex items-center gap-1">
                  Voir tout <ArrowRight size={12} />
                </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-50/50 text-slate-500 font-bold uppercase text-[10px] tracking-[0.1em]">
                  <tr>
                    <th className="px-8 py-4 border-b border-gray-100">Visiteur</th>
                    <th className="px-8 py-4 border-b border-gray-100">Badge</th>
                    <th className="px-8 py-4 border-b border-gray-100">Service</th>
                    <th className="px-8 py-4 border-b border-gray-100">Fonctionnaire</th>
                    <th className="px-8 py-4 border-b border-gray-100 text-center">Badge Pris</th>
                    <th className="px-8 py-4 border-b border-gray-100 text-center">Acceptée</th>
                    <th className="px-8 py-4 border-b border-gray-100 text-center">Fin Visite</th>
                    <th className="px-8 py-4 border-b border-gray-100 text-center">Badge Rendu</th>
                    <th className="px-8 py-4 border-b border-gray-100 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visites?.slice(0, 5).map((v: any) => (
                    <tr key={v.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-8 py-4 font-bold text-slate-700">{v.visiteurNom}</td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono font-bold text-[11px]">
                          {v.badgeCode || '-'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-slate-500">{v.serviceNom}</td>
                      <td className="px-8 py-4 text-slate-500">{v.fonctionnaireNom || '-'}</td>
                      <td className="px-8 py-4 text-center text-slate-500 tabular-nums font-bold">
                        {v.heureArrivee ? v.heureArrivee.substring(11, 16) : '-'}
                      </td>
                      <td className="px-8 py-4 text-center text-blue-600 tabular-nums font-bold">
                        {v.heureAcceptation ? v.heureAcceptation.substring(11, 16) : '-'}
                      </td>
                      <td className="px-8 py-4 text-center text-slate-500 tabular-nums font-bold">
                        {v.heureCloture ? v.heureCloture.substring(11, 16) : '-'}
                      </td>
                      <td className="px-8 py-4 text-center text-emerald-600 tabular-nums font-bold">
                        {v.heureRestitutionBadge ? v.heureRestitutionBadge.substring(11, 16) : '-'}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                          <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                          {v.statut}
                        </span>
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

interface ActionCardProps {
  title: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: 'blue' | 'slate' | 'white';
}

const ActionCard: React.FC<ActionCardProps> = ({ title, label, icon, onClick, color }) => {
  const themes = {
    blue: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
    slate: 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900',
    white: 'bg-white text-slate-800 border-gray-200 hover:bg-gray-50',
  };

  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-5 p-6 rounded-xl border shadow-sm transition-all group ${themes[color]}`}
    >
      <div className={`p-3 rounded-lg ${color === 'white' ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white'} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="text-left">
        <h3 className="text-[14px] font-bold uppercase tracking-wider leading-none mb-1">{title}</h3>
        <p className={`text-[11px] font-medium opacity-70 uppercase tracking-widest`}>{label}</p>
      </div>
      <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
};
