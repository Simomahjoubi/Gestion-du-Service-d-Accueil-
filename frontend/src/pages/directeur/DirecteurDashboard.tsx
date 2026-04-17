import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download } from 'lucide-react';

export const DirecteurDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytique Globale Fondation</h2>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-all">
          <Download size={18} /> Exporter Rapport Mensuel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col justify-between">
           <h3 className="font-bold text-gray-700 flex items-center gap-2"><BarChart3 size={20}/> Volume de Visites par Service</h3>
           <div className="flex-1 flex items-end justify-between gap-2 px-4 py-8">
              <div className="w-12 bg-blue-400 rounded-t-lg" style={{height: '60%'}}></div>
              <div className="w-12 bg-blue-600 rounded-t-lg" style={{height: '90%'}}></div>
              <div className="w-12 bg-blue-300 rounded-t-lg" style={{height: '40%'}}></div>
              <div className="w-12 bg-blue-500 rounded-t-lg" style={{height: '75%'}}></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
           <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-8"><PieChart size={20}/> Répartition par Type de Visiteur</h3>
           <div className="flex-1 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-[16px] border-blue-600 border-l-blue-200 border-b-blue-400 relative flex items-center justify-center">
                 <span className="text-xl font-bold text-gray-800">842</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4"><TrendingUp size={20}/> Évolution Mensuelle</h3>
        <p className="text-sm text-gray-500 italic">Graphique d'évolution des flux (Données simulées)</p>
        <div className="h-40 w-full mt-4 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-dashed">
           Aperçu du Graphique de Tendance
        </div>
      </div>
    </div>
  );
};
