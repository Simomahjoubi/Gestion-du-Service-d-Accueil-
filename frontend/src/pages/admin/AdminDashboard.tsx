import React from 'react';
import { Users, TrendingUp, Activity } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { ServiceManagement } from './ServiceManagement';
import { AdherentManagement } from './AdherentManagement';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8 pb-20">
      
      {/* Content */}
      <div className="transition-all duration-300">
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-xl font-bold text-gray-800 text-left">Vue d'ensemble système</h2>
          
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard title="Adhérents totaux" value="1,284" icon={<Users className="text-indigo-600"/>} />
            <KpiCard title="Visites aujourd'hui" value="86" icon={<Activity className="text-emerald-600"/>} />
            <KpiCard title="Utilisateurs actifs" value="12" icon={<TrendingUp className="text-blue-600"/>} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-left">Gestion des adhérents</h2>
          <AdherentManagement />
        </section>
        
        <div className="mt-12">
          <UserManagement />
        </div>
        
        <div className="mt-12">
          <ServiceManagement />
        </div>
      </div>

    </div>
  );
};

const KpiCard: React.FC<{ title: string, value: string, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 mt-2">{value}</h3>
    </div>
    <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
  </div>
);
