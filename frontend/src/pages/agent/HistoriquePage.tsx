import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  Clock, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Timer,
  AlertCircle,
  Download,
  RefreshCcw,
  Briefcase,
  Award,
  MapPin,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export const HistoriquePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('TOUS');

  const { data: visites, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['visites-today'],
    queryFn: () => visiteService.getVisitesToday(),
    refetchInterval: 60000,
  });

  const filteredVisites = useMemo(() => {
    if (!visites) return [];
    
    return visites.filter((v: any) => {
      const matchesSearch = 
        v.visiteurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.badgeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.motifLibelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.serviceNom.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatut = statutFilter === 'TOUS' || v.statut === statutFilter;
      
      return matchesSearch && matchesStatut;
    });
  }, [visites, searchTerm, statutFilter]);

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

  const exportToExcel = () => {
    if (!filteredVisites || filteredVisites.length === 0) return;

    const exportData = filteredVisites.map((v: any) => ({
      Arrivée: new Date(v.heureArrivee).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      Clôture: v.heureCloture ? new Date(v.heureCloture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      Visiteur: v.visiteurNom,
      Type: v.typeVisiteur,
      Badge: v.badgeCode,
      Service: v.serviceNom,
      Motif: v.motifLibelle,
      Fonctionnaire: v.fonctionnaireNom,
      Statut: v.statut
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visites du jour");
    
    const fileName = `historique_visites_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header avec Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/agent')}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all font-bold group"
        >
          <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={20} />
          </div>
          Retour au tableau de bord
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-blue-600 shadow-sm transition-all"
            title="Actualiser"
          >
            <RefreshCcw size={20} className={isRefetching ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={exportToExcel} 
            disabled={!filteredVisites || filteredVisites.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-lg shadow-green-100 disabled:opacity-50"
          >
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un visiteur ou un badge..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
        </div>
        <select 
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="px-6 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-600 cursor-pointer appearance-none"
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINEE">Terminée</option>
          <option value="CLOTUREE">Clôturée</option>
        </select>
      </div>

      {/* Liste de Visites en mode "Fiches Riches" */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-20 text-gray-400 font-medium">Chargement de l'historique...</div>
        ) : filteredVisites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
            Aucune visite trouvée pour aujourd'hui.
          </div>
        ) : (
          filteredVisites.map((visite: any) => (
            <div key={visite.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              {/* Top Bar : Badge & Temps */}
              <div className="px-8 py-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-black tracking-widest shadow-sm">
                    BADGE {visite.badgeCode}
                  </span>
                  <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span className="text-xs font-bold">{new Date(visite.heureArrivee).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {visite.heureCloture && (
                      <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase">Clôturé à {new Date(visite.heureCloture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(visite.statut)}`}>
                  {getStatusIcon(visite.statut)}
                  {visite.statut.replace('_', ' ')}
                </span>
              </div>

              {/* Contenu Principal */}
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Gauche : Identité */}
                  <div className="lg:w-1/4 space-y-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Visiteur</span>
                      <h3 className="text-xl font-black text-gray-900 leading-tight">{visite.visiteurNom}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-blue-100">
                         {visite.typeVisiteur}
                       </span>
                       {visite.statutAdherent && (
                         <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-green-100 flex items-center gap-1">
                           <UserCheck size={12} /> {visite.statutAdherent}
                         </span>
                       )}
                    </div>
                  </div>

                  {/* Droite : LES 4 GRANDES CARTES INLINE (EXCELLENT DESIGN) */}
                  <div className="lg:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard 
                      icon={<Briefcase className="text-indigo-600" size={20} />} 
                      label="Type Adhérent" 
                      value={visite.typeAdherentDetail || "—"} 
                      bgColor="bg-indigo-50"
                    />
                    <InfoCard 
                      icon={<Award className="text-amber-600" size={20} />} 
                      label="Grade" 
                      value={visite.grade || "—"} 
                      bgColor="bg-amber-50"
                    />
                    <InfoCard 
                      icon={<MapPin className="text-rose-600" size={20} />} 
                      label="Affectation" 
                      value={visite.affectation || "Rabat"} 
                      bgColor="bg-rose-50"
                    />
                    <InfoCard 
                      icon={<ShieldCheck className="text-emerald-600" size={20} />} 
                      label="Assurance" 
                      value={visite.typeAssurance || "MI/FH2"} 
                      bgColor="bg-emerald-50"
                    />
                  </div>
                </div>

                {/* Footer : Motif et Service */}
                <div className="mt-8 pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Motif de visite</span>
                      <span className="text-sm font-bold text-gray-700">{visite.motifLibelle}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-100"></div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Service ciblé</span>
                      <span className="text-sm font-bold text-blue-600 uppercase">{visite.serviceNom}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-xs font-black text-blue-600 border border-blue-50">
                      {visite.fonctionnaireNom.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Assigné à</span>
                      <span className="text-xs font-bold text-gray-700">{visite.fonctionnaireNom}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// COMPOSANT DES GRANDES CARTES INLINE
const InfoCard: React.FC<{ icon: React.ReactNode, label: string, value: string, bgColor: string }> = ({ icon, label, value, bgColor }) => (
  <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group/card">
    <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover/card:scale-110`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</span>
      <span className="text-[13px] font-black text-gray-800 leading-tight">{value}</span>
    </div>
  </div>
);
