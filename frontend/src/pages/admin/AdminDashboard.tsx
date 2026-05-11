import React from 'react';
import { Users, TrendingUp, Activity, ShieldCheck, Globe, Database, Clock, ArrowUpRight } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { ServiceManagement } from './ServiceManagement';
import { AdherentManagement } from './AdherentManagement';

/**
 * Palette de couleurs "Administrative Soft & Creative" :
 * - Bleu Principal (Léger) : #3b82f6 (Blue 500)
 * - Bleu Fond             : #eff6ff (Blue 50)
 * - Or/Jaune (Accent)     : #fbbf24
 * - Texte                 : #1e293b (Slate 800)
 */

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] space-y-10 pb-20 -m-8 p-8">
      
      {/* Header Soft & Professionnel */}
      <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-10 border border-blue-100/50 shadow-xl shadow-blue-900/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50 rounded-full -ml-24 -mb-24 blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4 border border-blue-100">
              <ShieldCheck className="text-blue-600" size={14} />
              <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">Console d'administration</span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Vue d'ensemble <span className="text-blue-600">Système</span></h1>
            <p className="text-slate-500 mt-4 text-base leading-relaxed">
              Bienvenue dans votre espace de pilotage. Gérez les ressources et supervisez l'activité de la Fondation avec une interface claire et performante.
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col items-center justify-center min-w-[120px] shadow-sm">
                <Globe className="text-blue-500 mb-2" size={20} />
                <span className="text-slate-800 font-black text-xl">Stable</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase mt-1">Status</span>
             </div>
             <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col items-center justify-center min-w-[120px] shadow-sm">
                <Clock className="text-amber-500 mb-2" size={20} />
                <span className="text-slate-800 font-black text-xl">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase mt-1">Système</span>
             </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
              <Database className="text-blue-600" size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Indicateurs clés</h2>
              <p className="text-xs text-slate-400 font-medium">Statistiques globales en temps réel</p>
            </div>
          </div>
          
          {/* KPI Cards Soft */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <KpiCard 
              title="Adhérents" 
              value="1,284" 
              trend="+12.5%"
              icon={<Users size={24}/>} 
              theme="blue"
            />
            <KpiCard 
              title="Visites du Jour" 
              value="86" 
              trend="+5.2%"
              icon={<Activity size={24}/>} 
              theme="amber"
            />
            <KpiCard 
              title="Sessions Actives" 
              value="12" 
              trend="Stable"
              icon={<TrendingUp size={24}/>} 
              theme="slate"
            />
          </div>
        </section>

        {/* Content Containers */}
        <div className="grid grid-cols-1 gap-12 mt-20">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Users size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Gestion des Adhérents</h2>
               </div>
               <button className="text-blue-600 font-bold text-sm hover:underline">Voir tout</button>
             </div>
             <AdherentManagement />
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
             <UserManagement />
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
             <ServiceManagement />
          </div>
        </div>
      </div>

    </div>
  );
};

const KpiCard: React.FC<{ 
  title: string, 
  value: string, 
  trend?: string,
  icon: React.ReactNode, 
  theme: 'blue' | 'amber' | 'slate' 
}> = ({ title, value, trend, icon, theme }) => {
  const styles = {
    blue:   { bg: 'bg-blue-50/50',   iconColor: 'text-blue-600',   accent: 'bg-blue-600' },
    amber:  { bg: 'bg-amber-50/50',  iconColor: 'text-amber-600',  accent: 'bg-amber-600' },
    slate:  { bg: 'bg-slate-50/50',  iconColor: 'text-slate-600',  accent: 'bg-slate-600' },
  };
  
  const s = styles[theme];

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 transition-all duration-300 hover:shadow-2xl hover:border-blue-200 group">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.iconColor} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-100">
            <ArrowUpRight size={10} />
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
      
      <div className={`h-1 w-12 mt-6 ${s.accent} rounded-full opacity-30 group-hover:opacity-100 transition-opacity w-0 group-hover:w-16 duration-500`}></div>
    </div>
  );
};
