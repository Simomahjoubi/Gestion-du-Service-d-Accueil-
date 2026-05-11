import React from 'react';
import { Users, TrendingUp, Activity, ShieldCheck, Globe, Database, Clock, ArrowUpRight, PlusCircle, Settings, FileBarChart } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { ServiceManagement } from './ServiceManagement';
import { AdherentManagement } from './AdherentManagement';

/**
 * Palette "Warm & Creative Administrative" :
 * - Dégradés doux (Ambre, Rose-Orange, Indigo-Violet)
 * - Ombres colorées
 * - Alignement font-sans text-[13px]
 */

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fffcf9] space-y-8 pb-20 -m-8 p-8 font-sans">
      
      {/* Header Soft & Warm */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-8 border border-orange-100 shadow-sm shadow-orange-900/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-50 rounded-full -ml-24 -mb-24 blur-3xl opacity-40"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-orange-50 rounded-md mb-3 border border-orange-100">
              <ShieldCheck className="text-orange-600" size={12} />
              <span className="text-orange-700 text-[10px] font-bold uppercase tracking-wider">Console d'administration</span>
            </div>
            <h1 className="text-[16px] font-bold text-slate-700 tracking-tight uppercase">Pilotage <span className="text-orange-600">Système</span></h1>
            <p className="text-slate-500 mt-2 text-[13px] leading-relaxed">
              Supervision des ressources et de l'activité globale avec une approche chaleureuse et performante.
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="flex flex-col">
                  <span className="text-slate-700 font-bold text-[13px]">Opérationnel</span>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">Status</span>
                </div>
             </div>
             <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                <Clock className="text-amber-500" size={16} />
                <div className="flex flex-col">
                  <span className="text-slate-700 font-bold text-[13px]">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">Heure</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Action Cards - Plus colorées et créatives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        <WarmActionButton 
          title="Ajouter Adhérent" 
          icon={<PlusCircle size={20} />} 
          theme="orange"
        />
        <WarmActionButton 
          title="Configurer Services" 
          icon={<Settings size={20} />} 
          theme="indigo"
        />
        <WarmActionButton 
          title="Rapports Globaux" 
          icon={<FileBarChart size={20} />} 
          theme="rose"
        />
      </div>

      <div className="px-1 pt-4">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Database className="text-orange-300" size={16} />
            <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Statistiques Clés</h2>
          </div>
          
          {/* KPI Cards avec dégradés subtils */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <WarmKpiCard 
              title="Adhérents" 
              value="1,284" 
              trend="+12%"
              icon={<Users size={20}/>} 
              gradient="from-orange-500 to-amber-400"
              shadow="shadow-orange-200"
            />
            <WarmKpiCard 
              title="Visites du Jour" 
              value="86" 
              trend="+5%"
              icon={<Activity size={20}/>} 
              gradient="from-rose-500 to-pink-400"
              shadow="shadow-rose-200"
            />
            <WarmKpiCard 
              title="Sessions Actives" 
              value="12" 
              trend="Live"
              icon={<TrendingUp size={20}/>} 
              gradient="from-indigo-600 to-blue-400"
              shadow="shadow-indigo-200"
            />
          </div>
        </section>

        {/* Content Containers Soft */}
        <div className="grid grid-cols-1 gap-10 mt-16">
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/30">
             <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                  <Users size={20} />
                </div>
                <h2 className="text-[14px] font-bold text-slate-700 uppercase">Gestion des Adhérents</h2>
             </div>
             <AdherentManagement />
          </div>
          
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/30">
             <UserManagement />
          </div>
          
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/30">
             <ServiceManagement />
          </div>
        </div>
      </div>

    </div>
  );
};

const WarmKpiCard: React.FC<{ 
  title: string, 
  value: string, 
  trend: string,
  icon: React.ReactNode, 
  gradient: string,
  shadow: string
}> = ({ title, value, trend, icon, gradient, shadow }) => (
  <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-2xl ${shadow} transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative`}>
    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-lg shadow-current/20`}>
          {icon}
        </div>
        <div className="bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 group-hover:text-emerald-500 transition-colors">
          {trend}
        </div>
      </div>
      
      <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
      <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h3>
    </div>
  </div>
);

const WarmActionButton: React.FC<{ title: string, icon: React.ReactNode, theme: 'orange' | 'indigo' | 'rose' }> = ({ title, icon, theme }) => {
  const themes = {
    orange: { bg: 'bg-orange-500', shadow: 'shadow-orange-200', light: 'bg-orange-50', text: 'text-orange-600' },
    indigo: { bg: 'bg-indigo-600', shadow: 'shadow-indigo-200', light: 'bg-indigo-50', text: 'text-indigo-600' },
    rose:   { bg: 'bg-rose-500',   shadow: 'shadow-rose-200',   light: 'bg-rose-50',   text: 'text-rose-600' },
  };
  const t = themes[theme];

  return (
    <button className={`group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-xl ${t.shadow} transition-all duration-300 hover:shadow-2xl hover:border-transparent flex items-center gap-5 text-left overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br from-white to-slate-50 group-hover:opacity-0 transition-opacity`}></div>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'orange' ? 'from-orange-500 to-amber-400' : theme === 'indigo' ? 'from-indigo-600 to-blue-500' : 'from-rose-500 to-pink-400'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className={`relative z-10 w-12 h-12 rounded-xl ${t.light} ${t.text} flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all duration-300`}>
        {icon}
      </div>
      <div className="relative z-10">
        <h4 className="font-bold text-slate-700 text-[13px] tracking-tight group-hover:text-white transition-colors">{title}</h4>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-white/70 transition-colors">Action Rapide</p>
      </div>
    </button>
  );
};
