import React from 'react';
import { Users, TrendingUp, Activity, ShieldCheck, Globe, Database, Clock, ArrowUpRight } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { ServiceManagement } from './ServiceManagement';
import { AdherentManagement } from './AdherentManagement';

/**
 * Palette de couleurs "Administrative Soft & Creative" :
 * - Alignement strict sur les styles du Navbar (font-sans, text-[13px], font-bold)
 */

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] space-y-6 pb-20 -m-8 p-8 font-sans">
      
      {/* Header Soft & Professionnel - Style Aligné sur Navbar */}
      <div className="relative overflow-hidden bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-40"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-50 rounded-md mb-3 border border-blue-100">
              <ShieldCheck className="text-blue-600" size={12} />
              <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">Console d'administration</span>
            </div>
            {/* Font size et style alignés sur NavItem (text-[13px] ou légèrement plus pour le titre principal mais même font) */}
            <h1 className="text-[15px] font-bold text-gray-700 tracking-tight uppercase">Tableau de Bord <span className="text-blue-700">Vue d'ensemble</span></h1>
            <p className="text-gray-500 mt-2 text-[13px] leading-relaxed">
              Supervision des ressources et de l'activité globale de la Fondation.
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
                <Globe className="text-blue-500" size={14} />
                <div className="flex flex-col">
                  <span className="text-gray-700 font-bold text-[13px]">Stable</span>
                  <span className="text-gray-400 text-[9px] font-bold uppercase">Status</span>
                </div>
             </div>
             <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
                <Clock className="text-amber-500" size={14} />
                <div className="flex flex-col">
                  <span className="text-gray-700 font-bold text-[13px]">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                  <span className="text-gray-400 text-[9px] font-bold uppercase">Système</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="px-1">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Database className="text-gray-400" size={16} />
            <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Indicateurs clés</h2>
          </div>
          
          {/* KPI Cards Alignées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard 
              title="Adhérents" 
              value="1,284" 
              trend="+12.5%"
              icon={<Users size={18}/>} 
              theme="blue"
            />
            <KpiCard 
              title="Visites du Jour" 
              value="86" 
              trend="+5.2%"
              icon={<Activity size={18}/>} 
              theme="amber"
            />
            <KpiCard 
              title="Sessions Actives" 
              value="12" 
              trend="Stable"
              icon={<TrendingUp size={18}/>} 
              theme="slate"
            />
          </div>
        </section>

        {/* Content Containers */}
        <div className="grid grid-cols-1 gap-8 mt-12">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm relative group">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Users size={16} />
                  </div>
                  <h2 className="text-[13px] font-bold text-gray-700 uppercase">Gestion des Adhérents</h2>
               </div>
               <button className="text-blue-700 font-bold text-[11px] uppercase hover:underline">Détails</button>
             </div>
             <AdherentManagement />
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
             <UserManagement />
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
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
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:border-blue-300 group">
      <div className="flex justify-between items-center mb-4">
        <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.iconColor} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-100">
            <ArrowUpRight size={10} />
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-700 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};
