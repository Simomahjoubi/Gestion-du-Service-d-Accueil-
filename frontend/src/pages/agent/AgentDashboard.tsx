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
  History,
  ArrowRight,
  TrendingUp,
  BarChart3
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
    { name: '08h', value: 2 },
    { name: '10h', value: Math.floor(totalVisites * 0.3) },
    { name: '12h', value: Math.floor(totalVisites * 0.6) },
    { name: '14h', value: enAttente },
    { name: '16h', value: totalVisites },
  ];

  const badgesData = [
    { name: 'Occupés', value: stats?.badgesOccupes || 0 },
    { name: 'Libres', value: stats?.badgesLibres || 0 },
  ];
  const COLORS = ['#f43f5e', '#10b981']; 

  const occupationPercent = stats 
    ? Math.round((stats.badgesOccupes / (stats.badgesOccupes + stats.badgesLibres)) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      
      {/* 1. Header Harmonisé */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <p className="text-blue-600 font-semibold text-[11px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2 leading-none">
            <TrendingUp size={14} /> Espace Opérationnel | فضاء العمليات
          </p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase leading-none">
            Bonjour | مرحبا, <span className="text-blue-700">{user?.nomComplet || 'Agent'}</span> 👋
          </h1>
        </div>
        <button 
          onClick={handleRefresh}
          className="group flex items-center gap-2 bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 transition-all"
        >
          <RefreshCcw size={20} className={(statsLoading || visitesLoading) ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
        </button>
      </div>

      {/* 2. Commandes Rapides */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <QuickAction 
            title="Nouvelle Arrivée" 
            titleAr="وصول جديد"
            icon={<UserPlus size={28} />} 
            onClick={() => navigate('/agent/nouvelle-visite')} 
            color="bg-blue-600"
            desc="Enregistrer un visiteur | تسجيل زائر جديد"
          />
          <QuickAction 
            title="Sortie Visiteur" 
            titleAr="خروج زائر"
            icon={<Key size={28} />} 
            onClick={() => navigate('/agent/restitution')} 
            color="bg-indigo-600"
            desc="Restituer un badge | إرجاع الشارة"
          />
          <QuickAction 
            title="Historique Jour" 
            titleAr="سجل اليوم"
            icon={<History size={28} />} 
            onClick={() => navigate('/agent/historique')} 
            color="bg-slate-700"
            desc="Journal des visites | سجل الزيارات"
          />
      </section>

      {/* 3. Statistiques Visuelles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Activity size={18} /></div>
            <h3 className="text-[13px] font-bold text-gray-700 uppercase tracking-widest flex justify-between w-full">
               <span>Flux d'accueil actuel</span>
               <span className="font-arabic">تدفق الاستقبال الحالي</span>
            </h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '600'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisites)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><BarChart3 size={18} /></div>
            <h3 className="text-[13px] font-bold text-gray-700 uppercase tracking-widest flex justify-between w-full">
               <span>État du stock badges</span>
               <span className="font-arabic">حالة مخزون الشارات</span>
            </h3>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={badgesData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                  {badgesData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
               <span className="text-2xl font-bold text-gray-800 tracking-tight">{occupationPercent}%</span>
               <span className="text-[10px] font-semibold text-gray-400 uppercase">Occupés | مستعملة</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Liste des Visites Actives */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-4">
             <span>Flux opérationnel</span>
             <span className="text-gray-400 font-normal">|</span>
             <span className="font-arabic">سير العمليات</span>
          </h3>
          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded border border-blue-100 uppercase">{visites?.length || 0} en cours | قيد الإجراء</span>
        </div>
        <div className="overflow-x-auto text-left">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4 flex flex-col items-start gap-1">
                   <span>Badge</span>
                   <span className="font-arabic text-[9px]">شارة</span>
                </th>
                <th className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                      <span>Visiteur</span>
                      <span className="font-arabic text-[9px]">زائر</span>
                   </div>
                </th>
                <th className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                      <span>Destination</span>
                      <span className="font-arabic text-[9px]">الوجهة</span>
                   </div>
                </th>
                <th className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                      <span>Arrivée</span>
                      <span className="font-arabic text-[9px]">الوصول</span>
                   </div>
                </th>
                <th className="px-6 py-4 text-center">
                   <div className="flex flex-col gap-1 items-center">
                      <span>État</span>
                      <span className="font-arabic text-[9px]">الحالة</span>
                   </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visitesLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-bold">Chargement... | جاري التحميل</td></tr>
              ) : !visites || visites.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[11px] italic">Aucune visite active | لا توجد زيارات نشطة</td></tr>
              ) : (
                visites.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-sm">
                        {v.badgeCode || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-gray-900 text-[13px] uppercase tracking-tight">{v.visiteurNom} {v.visiteurPrenom}</p>
                       <p className="text-[10px] text-blue-600 font-semibold uppercase">{v.visiteurType}</p>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-gray-500 font-semibold uppercase tracking-tighter italic">{v.serviceNom}</td>
                    <td className="px-6 py-4 text-[12px] font-semibold text-gray-700">
                      {new Date(v.dateHeureArrivee).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-center">
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

const QuickAction: React.FC<{ title: string, titleAr: string, desc: string, icon: React.ReactNode, onClick: () => void, color: string }> = ({ title, titleAr, desc, icon, onClick, color }) => (
  <button 
    onClick={onClick}
    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-600 hover:shadow-md transition-all group flex flex-col items-center text-center w-full relative overflow-hidden active:scale-95"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-[4] transition-transform duration-1000`}></div>
    <div className={`w-14 h-14 ${color} text-white rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-all duration-300 relative z-10`}>
      {icon}
    </div>
    <div className="relative z-10 w-full">
      <div className="flex flex-col gap-1 mb-2">
         <h3 className="text-[16px] font-bold text-gray-900 uppercase tracking-tight leading-none">{title}</h3>
         <h3 className="text-[14px] font-arabic text-blue-700 leading-none">{titleAr}</h3>
      </div>
      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider leading-relaxed">{desc}</p>
    </div>
    <div className="mt-4 flex items-center gap-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
       Lancer | ابدأ <ArrowRight size={14} />
    </div>
  </button>
);

const StatusDot: React.FC<{ status: string }> = ({ status }) => {
  const configs: Record<string, {label: string, labelAr: string, dot: string, bg: string}> = {
    'EN_ATTENTE': { label: 'En attente', labelAr: 'في الانتظار', dot: 'bg-orange-500', bg: 'bg-orange-50 text-orange-700 border-orange-100' },
    'EN_COURS': { label: 'En cours', labelAr: 'قيد الإجراء', dot: 'bg-blue-600', bg: 'bg-blue-50 text-blue-700 border-blue-100' },
    'TERMINEE': { label: 'Terminée', labelAr: 'تمت', dot: 'bg-emerald-600', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  };
  const cfg = configs[status] || configs['EN_ATTENTE'];
  return (
    <div className="flex flex-col items-center gap-1">
       <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${cfg.bg} text-[8px] font-bold uppercase tracking-widest border`}>
         <span className={`w-1 h-1 rounded-full ${cfg.dot} animate-pulse`} />
         {cfg.label}
       </div>
       <span className="font-arabic text-[9px] text-gray-500">{cfg.labelAr}</span>
    </div>
  );
};
