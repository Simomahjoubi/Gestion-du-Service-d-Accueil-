import React from 'react';
import { Clock, PlusCircle, Settings, FileBarChart } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { ServiceManagement } from './ServiceManagement';
import { AdherentManagement } from './AdherentManagement';

/**
 * Palette "Cold Professional" :
 * - Gamme de bleus froids, ardoise et teal
 * - Design sobre, statique (sans animation hover)
 */

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f1f5f9] space-y-8 pb-20 -m-8 p-8 font-sans">
      
      {/* Header Froid & Pro */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-[15px] font-bold text-slate-800 tracking-tight uppercase">Administration <span className="text-blue-600">Système</span></h1>
            <p className="text-slate-500 mt-2 text-[13px]">Supervision globale des ressources.</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <Clock className="text-slate-500" size={14} />
                <span className="text-slate-700 font-bold text-[13px]">{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Action Cards - Couleurs Froides, Statiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        <ColdActionButton title="Ajouter Adhérent" icon={<PlusCircle size={18} />} theme="blue" />
        <ColdActionButton title="Configurer Services" icon={<Settings size={18} />} theme="teal" />
        <ColdActionButton title="Rapports Globaux" icon={<FileBarChart size={18} />} theme="slate" />
      </div>

      <div className="px-1 pt-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ColdKpiCard title="Adhérents" value="1,284" theme="blue" />
            <ColdKpiCard title="Visites" value="86" theme="teal" />
            <ColdKpiCard title="Sessions" value="12" theme="slate" />
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 gap-8 mt-12">
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
             <h2 className="text-[13px] font-bold text-slate-700 uppercase mb-8">Gestion des Adhérents</h2>
             <AdherentManagement />
          </div>
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
             <UserManagement />
          </div>
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
             <ServiceManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

const ColdKpiCard: React.FC<{ title: string, value: string, theme: 'blue' | 'teal' | 'slate' }> = ({ title, value, theme }) => {
  const styles = {
    blue:   { border: 'border-blue-200', text: 'text-blue-700' },
    teal:   { border: 'border-teal-200', text: 'text-teal-700' },
    slate:  { border: 'border-slate-300', text: 'text-slate-700' },
  };
  const s = styles[theme];
  return (
    <div className={`bg-white p-6 rounded-xl border-l-4 ${s.border} shadow-sm`}>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${s.text}`}>{value}</h3>
    </div>
  );
};

const ColdActionButton: React.FC<{ title: string, icon: React.ReactNode, theme: 'blue' | 'teal' | 'slate' }> = ({ title, icon, theme }) => {
  const styles = {
    blue:   { bg: 'bg-blue-50', text: 'text-blue-700' },
    teal:   { bg: 'bg-teal-50', text: 'text-teal-700' },
    slate:  { bg: 'bg-slate-100', text: 'text-slate-700' },
  };
  const s = styles[theme];
  return (
    <button className={`p-5 rounded-lg border border-slate-200 flex items-center gap-4 text-left ${s.bg}`}>
      <div className={s.text}>{icon}</div>
      <span className={`text-[13px] font-bold ${s.text}`}>{title}</span>
    </button>
  );
};
