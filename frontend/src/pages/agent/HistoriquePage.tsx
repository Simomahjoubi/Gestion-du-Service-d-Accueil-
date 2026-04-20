import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  Users, 
  Clock, 
  ChevronLeft,
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
    refetchInterval: 60000, 
  });

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return { fr: 'En attente', ar: 'في الانتظار' };
      case 'EN_COURS': return { fr: 'En cours', ar: 'قيد الإجراء' };
      case 'TERMINEE': return { fr: 'Terminée', ar: 'تمت' };
      case 'CLOTUREE': return { fr: 'Clôturée', ar: 'مغلقة' };
      default: return { fr: statut, ar: '' };
    }
  };

  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'EN_COURS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TERMINEE': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CLOTUREE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return <Clock size={12} />;
      case 'EN_COURS': return <Timer size={12} />;
      case 'TERMINEE': return <AlertCircle size={12} />;
      case 'CLOTUREE': return <CheckCircle2 size={12} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* ── Header Harmonisé ── */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <button onClick={() => navigate('/agent')} className="flex items-center gap-2 text-gray-500 hover:text-blue-700 font-bold transition-all">
          <ChevronLeft size={20} />
          <span className="text-[13px] uppercase tracking-widest text-center flex flex-col items-start leading-none">
             <span>Retour au Dashboard</span>
             <span className="font-arabic text-[10px] mt-1">العودة إلى لوحة القيادة</span>
          </span>
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher... | بحث" 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 text-sm font-medium transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight flex justify-between items-center w-full">
           <span>Historique des Visites</span>
           <span className="font-arabic text-xl">سجل الزيارات</span>
        </h1>
        <p className="text-gray-400 text-sm font-medium tracking-wide italic">Registre quotidien des flux d'accueil | السجل اليومي للاستقبال</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-3">
            <Users className="text-blue-600" size={18} /> Journal du jour | يومية اليوم
          </h2>
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-100 uppercase">
            {visites?.length || 0} Activités | عمليات
          </span>
        </div>

        <div className="overflow-x-auto text-left">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                <th className="px-6 py-4">Heure | وقت</th>
                <th className="px-6 py-4">Visiteur | زائر</th>
                <th className="px-6 py-4">Badge | شارة</th>
                <th className="px-6 py-4">Destination | وجهة</th>
                <th className="px-6 py-4">Statut | حالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">
                    Synchronisation des données... | جاري التحميل
                  </td>
                </tr>
              ) : !visites || visites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-[11px] italic">
                    Aucune activité enregistrée aujourd'hui | لا توجد بيانات
                  </td>
                </tr>
              ) : (
                visites.map((visite: any) => {
                  const status = getStatusLabel(visite.statut);
                  return (
                    <tr key={visite.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-indigo-600 tabular-nums">
                          {new Date(visite.heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-gray-800 uppercase tracking-tight leading-tight">{visite.visiteurNom}</span>
                          <span className="text-[10px] text-blue-600 font-semibold uppercase">{visite.typeVisiteur}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-slate-800 text-white shadow-sm">
                          {visite.badgeCode || '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[12px] text-gray-700 font-bold leading-tight">{visite.motifLibelle?.toUpperCase()}</span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-tighter italic">{visite.serviceNom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(visite.statut)}`}>
                            {getStatusIcon(visite.statut)}
                            {status.fr.toUpperCase()}
                          </span>
                          <span className="font-arabic text-[10px] text-gray-400 px-1">{status.ar}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
