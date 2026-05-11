import React from 'react';
import { Users, TrendingUp, Activity, ShieldCheck, Globe, Database, Clock } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { ServiceManagement } from './ServiceManagement';
import { AdherentManagement } from './AdherentManagement';

/**
 * Palette de couleurs basée sur le logo :
 * - Bleu Foncé (Primaire) : #1e40af
 * - Jaune/Or (Accent)     : #fbbf24
 * - Bleu Clair            : #3b82f6
 */

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 space-y-8 pb-20 -m-8 p-8">
      
      {/* Header Créatif */}
      <div className="relative overflow-hidden bg-[#1e40af] rounded-3xl p-8 mb-10 shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbf24] opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-[#fbbf24]" size={20} />
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Console d'administration</span>
            </div>
            <h1 className="text-3xl font-black text-white">Tableau de Bord Système</h1>
            <p className="text-blue-100/80 mt-2 max-w-md text-sm leading-relaxed">
              Supervision globale du Service d'Accueil de la Fondation Hassan II. Gérez les accès, les services et suivez les indicateurs clés en temps réel.
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                <Globe className="text-[#fbbf24] mb-1" size={18} />
                <span className="text-white font-bold text-lg">Online</span>
                <span className="text-blue-200 text-[10px] uppercase">Status</span>
             </div>
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                <Clock className="text-[#fbbf24] mb-1" size={18} />
                <span className="text-white font-bold text-lg">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="text-blue-200 text-[10px] uppercase">Système</span>
             </div>
          </div>
        </div>
      </div>

      <div className="transition-all duration-300 px-2">
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <Database className="text-[#1e40af]" size={22} />
              Indicateurs de Performance
            </h2>
            <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-gray-200 to-transparent hidden md:block"></div>
          </div>
          
          {/* KPI Metrics - Plus créatifs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <KpiCard 
              title="Adhérents" 
              value="1,284" 
              subValue="+12 cette semaine"
              icon={<Users size={24}/>} 
              color="blue"
            />
            <KpiCard 
              title="Visites du Jour" 
              value="86" 
              subValue="Pic à 10h30"
              icon={<Activity size={24}/>} 
              color="amber"
            />
            <KpiCard 
              title="Session Actives" 
              value="12" 
              subValue="Tous services"
              icon={<TrendingUp size={24}/>} 
              color="indigo"
            />
          </div>
        </section>

        {/* Sections de gestion avec séparation stylisée */}
        <div className="grid grid-cols-1 gap-12 mt-16">
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1e40af]">
                  <Users size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-800">Gestion des Adhérents</h2>
              </div>
              <AdherentManagement />
            </div>
          </section>
          
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
            <UserManagement />
          </section>
          
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
            <ServiceManagement />
          </section>
        </div>
      </div>

    </div>
  );
};

const KpiCard: React.FC<{ 
  title: string, 
  value: string, 
  subValue?: string,
  icon: React.ReactNode, 
  color: 'blue' | 'amber' | 'indigo' 
}> = ({ title, value, subValue, icon, color }) => {
  const themes = {
    blue:   { bg: 'bg-blue-50',   iconBg: 'bg-[#1e40af]', iconColor: 'text-white',     shadow: 'shadow-blue-100', accent: 'bg-[#1e40af]' },
    amber:  { bg: 'bg-amber-50',  iconBg: 'bg-[#fbbf24]', iconColor: 'text-gray-900', shadow: 'shadow-amber-100', accent: 'bg-[#fbbf24]' },
    indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-600', iconColor: 'text-white',     shadow: 'shadow-indigo-100', accent: 'bg-indigo-600' },
  };
  
  const theme = themes[color];

  return (
    <div className={`group bg-white p-1 rounded-[2rem] border border-gray-100 ${theme.shadow} shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl`}>
      <div className="bg-white p-6 rounded-[1.8rem] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className={`${theme.iconBg} ${theme.iconColor} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
            {icon}
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
            <div className={`h-1 w-8 ml-auto mt-1 ${theme.accent} rounded-full`}></div>
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className="text-4xl font-black text-gray-900 tracking-tight">{value}</h3>
          {subValue && (
            <p className="text-xs text-gray-400 mt-1 font-medium italic">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
};
