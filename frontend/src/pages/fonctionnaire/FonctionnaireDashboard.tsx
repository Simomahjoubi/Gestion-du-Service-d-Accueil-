import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, User } from 'lucide-react';
import { visiteService } from '../../services/visiteService';
import { useAuthStore } from '../../stores/authStore';

export const FonctionnaireDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  const { data: activeVisits, isLoading } = useQuery({
    queryKey: ['fonctionnaire-visits', user?.serviceId],
    queryFn: () => visiteService.getVisitesActiveByFonctionnaire(1), // Assuming ID 1 for test
    refetchInterval: 30000,
  });

  const mutation = useMutation({
    mutationFn: (id: number) => visiteService.recevoir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fonctionnaire-visits'] });
      alert("Visite mise à jour avec succès.");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ma File d'Attente</h2>
          <p className="text-gray-500">Gérez les visiteurs qui vous sont affectés aujourd'hui.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Chargement...</div>
        ) : activeVisits?.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">Aucun visiteur en attente.</p>
          </div>
        ) : (
          activeVisits?.map((visite: any) => (
            <div key={visite.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{visite.visiteurNom}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={12} /> Arrivé à {new Date(visite.heureArrivee).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase">
                  {visite.statut}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-600">Badge :</span>
                <span className="font-mono font-bold text-blue-900">{visite.badgeCode}</span>
              </div>

              {visite.statut === 'EN_ATTENTE' && (
                <button 
                  onClick={() => mutation.mutate(visite.id)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={20} /> Marquer comme Reçu
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
