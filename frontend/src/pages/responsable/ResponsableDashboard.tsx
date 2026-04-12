import React from 'react';
import { Users, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export const ResponsableDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Supervision du Service</h2>
        <span className="px-4 py-2 bg-blue-100 text-primary font-bold rounded-lg">Service Social</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
          <div className="flex items-center gap-3 text-orange-600 mb-2">
             <AlertTriangle size={20} />
             <h3 className="text-sm font-bold uppercase">Visites en Retard</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center gap-3 text-green-600 mb-2">
             <CheckCircle size={20} />
             <h3 className="text-sm font-bold uppercase">Traitées aujourd'hui</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">24</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center gap-3 text-primary mb-2">
             <Users size={20} />
             <h3 className="text-sm font-bold uppercase">Effectif présent</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">5 / 6</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Flux de Visite en Temps Réel</h2>
          <button className="text-sm text-primary flex items-center gap-1 hover:underline"><RefreshCw size={14}/> Actualiser</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Fonctionnaire</th>
              <th className="px-6 py-4">Visiteur Actuel</th>
              <th className="px-6 py-4">Temps d'attente</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-6 py-4 font-medium">Dr. Bennani</td>
              <td className="px-6 py-4">Ahmed Alami</td>
              <td className="px-6 py-4 text-orange-600 font-bold">42 min</td>
              <td className="px-6 py-4">
                <button className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-blue-700">Réaffecter</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
