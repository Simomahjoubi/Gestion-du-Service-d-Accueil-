import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import { RefreshCw, AlertTriangle, CheckCircle, ArrowRightLeft, X } from 'lucide-react';

interface Visite {
  id: number; visiteurNom: string; typeVisiteur: string;
  fonctionnaireId: number; fonctionnaireNom: string; badgeCode: string;
  statut: string; heureArrivee: string; motifLibelle: string;
}

interface Fonctionnaire {
  fonctionnaireId: number; nomComplet: string;
  visitesEnAttente: number; visitesEnCours: number;
}

const STATUT_CFG: Record<string, { label: string; cls: string }> = {
  EN_ATTENTE: { label: 'En attente',  cls: 'bg-amber-100 text-amber-700' },
  EN_COURS:   { label: 'En cours',    cls: 'bg-blue-100 text-blue-700' },
  REAFFECTEE: { label: 'Réaffectée', cls: 'bg-purple-100 text-purple-700' },
};

export const ResponsableFileDAttente: React.FC = () => {
  const { user } = useAuthStore();
  const serviceId = user?.serviceId;

  const [visites, setVisites]         = useState<Visite[]>([]);
  const [fonctionnaires, setFonctionnaires] = useState<Fonctionnaire[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filtre, setFiltre]           = useState<string>('TOUS');
  const [modal, setModal]             = useState<Visite | null>(null);
  const [selectedFct, setSelectedFct] = useState<string>('');
  const [submitting, setSubmitting]   = useState(false);

  const fetchData = useCallback(async () => {
    if (!serviceId) { setLoading(false); return; }
    try {
      const [vr, fr] = await Promise.all([
        api.get<Visite[]>(`/responsable/service/${serviceId}/file-attente`),
        api.get<Fonctionnaire[]>(`/responsable/service/${serviceId}/rendement`),
      ]);
      setVisites(vr.data);
      setFonctionnaires(fr.data);
    } finally { setLoading(false); }
  }, [serviceId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleReaffecter = async () => {
    if (!modal || !selectedFct) return;
    setSubmitting(true);
    try {
      await api.post(`/responsable/visites/${modal.id}/reaffecter?fonctionnaireId=${selectedFct}`);
      setModal(null);
      setSelectedFct('');
      fetchData();
    } finally { setSubmitting(false); }
  };

  const now = new Date();
  const minutesAttente = (h: string) => Math.floor((now.getTime() - new Date(h).getTime()) / 60000);
  const fmtMin = (m: number) => m < 60 ? `${m} min` : `${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`;

  const filtered = filtre === 'TOUS' ? visites : visites.filter(v => v.statut === filtre);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">File d'attente du service</h1>
          <p className="text-xs text-gray-400 mt-0.5">{visites.length} visite{visites.length !== 1 ? 's' : ''} active{visites.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {['TOUS', 'EN_ATTENTE', 'EN_COURS', 'REAFFECTEE'].map(f => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              filtre === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'TOUS' ? 'Tous' : STATUT_CFG[f]?.label}
            <span className="ml-1.5 opacity-70">
              ({f === 'TOUS' ? visites.length : visites.filter(v => v.statut === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle className="mx-auto text-emerald-300 mb-3" size={40} />
            <p className="text-gray-400 text-sm">Aucune visite active</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Visiteur</th>
                <th className="px-5 py-3">Motif</th>
                <th className="px-5 py-3">Fonctionnaire</th>
                <th className="px-5 py-3">Badge</th>
                <th className="px-5 py-3">Attente</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(v => {
                const mins = minutesAttente(v.heureArrivee);
                const alerte = v.statut === 'EN_ATTENTE' && mins >= 45;
                return (
                  <tr key={v.id} className={`hover:bg-gray-50 ${alerte ? 'bg-red-50' : ''}`}>
                    <td className="px-5 py-3 text-gray-400 text-xs">#{v.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{v.visiteurNom}</p>
                      <p className="text-[11px] text-gray-400">{v.typeVisiteur}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{v.motifLibelle}</td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{v.fonctionnaireNom}</td>
                    <td className="px-5 py-3">
                      <span className="bg-blue-50 text-blue-700 text-xs font-mono px-2 py-0.5 rounded">{v.badgeCode}</span>
                    </td>
                    <td className={`px-5 py-3 font-bold text-sm ${alerte ? 'text-red-600' : mins > 20 ? 'text-amber-600' : 'text-gray-600'}`}>
                      {alerte && <AlertTriangle size={12} className="inline mr-1" />}
                      {fmtMin(mins)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUT_CFG[v.statut]?.cls ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUT_CFG[v.statut]?.label ?? v.statut}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => { setModal(v); setSelectedFct(''); }}
                        className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                      >
                        <ArrowRightLeft size={11} /> Réaffecter
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal réaffectation */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-800">Réaffecter la visite</p>
                <p className="text-xs text-gray-400 mt-0.5">{modal.visiteurNom}</p>
              </div>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                Fonctionnaire actuel : <span className="font-semibold text-gray-700">{modal.fonctionnaireNom}</span>
              </p>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nouveau fonctionnaire</label>
                <select
                  value={selectedFct}
                  onChange={e => setSelectedFct(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">— Sélectionner —</option>
                  {fonctionnaires
                    .filter(f => f.fonctionnaireId !== modal.fonctionnaireId)
                    .map(f => (
                      <option key={f.fonctionnaireId} value={f.fonctionnaireId}>
                        {f.nomComplet} ({f.visitesEnAttente + f.visitesEnCours} visites)
                      </option>
                    ))}
                </select>
              </div>
              <button
                onClick={handleReaffecter}
                disabled={!selectedFct || submitting}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <RefreshCw size={13} className="animate-spin" />}
                Confirmer la réaffectation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
