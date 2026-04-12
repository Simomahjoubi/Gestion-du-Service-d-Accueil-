import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  Users, 
  Clock, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Timer,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HistoriquePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: visites, isLoading } = useQuery({
    queryKey: ['visites-today'],
    queryFn: () => visiteService.getVisitesToday(),
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'EN_COURS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TERMINEE': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CLOTUREE': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return <Clock size={14} />;
      case 'EN_COURS': return <Timer size={14} />;
      case 'TERMINEE': return <AlertCircle size={14} />;
      case 'CLOTUREE': return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/agent')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Retour au tableau de bord
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une visite..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="text-blue-600" /> Historique des visites du jour
          </h2>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            {visites?.length || 0} Visites
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Heure</th>
                <th className="px-6 py-4">Visiteur</th>
                <th className="px-6 py-4">Badge</th>
                <th className="px-6 py-4">Service / Motif</th>
                <th className="px-6 py-4">Fonctionnaire</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Chargement des données...
                  </td>
                </tr>
              ) : visites?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Aucune visite enregistrée aujourd'hui.
                  </td>
                </tr>
              ) : (
                visites?.map((visite: any) => (
                  <tr key={visite.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-700">
                        {new Date(visite.heureArrivee).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{visite.visiteurNom}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase">{visite.typeVisiteur}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                        {visite.badgeCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 font-medium">{visite.motifLibelle}</span>
                        <span className="text-[10px] text-blue-600 font-bold">{visite.serviceNom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">{visite.fonctionnaireNom}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(visite.statut)}`}>
                        {getStatusIcon(visite.statut)}
                        {visite.statut}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
