import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { visiteurService, Visiteur as Visitor } from '../../services/visiteurService';
import { serviceService, Service, Motif } from '../../services/serviceService';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export const NouvelleVisitePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedMotifId, setSelectedMotifId] = useState<string>('');
  const [searchType, setSearchType] = useState('CIN');
  const [searchId, setSearchId] = useState('');
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    serviceService.getAll().then(setServices).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      serviceService.getMotifs(selectedServiceId)
        .then(data => { setMotifs(data); setSelectedMotifId(''); })
        .catch(() => {});
    } else {
      setMotifs([]);
    }
  }, [selectedServiceId]);

  const handleSearch = async () => {
    try {
      let v: Visitor | null = null;
      if (searchType === 'CIN') v = await visiteurService.rechercherParCin(searchId);
      else if (searchType === 'ADHESION') v = await visiteurService.rechercherParNumAdhesion(searchId);
      if (v) { setFoundVisitor(v); setStep(2); }
    } catch {}
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedMotifId || !foundVisitor) return;
    try {
      await api.post('/visites/enregistrer', {
        visiteurId:    foundVisitor.id,
        objetVisiteId: Number(selectedMotifId),
        agentId:       user?.id,
      });
      navigate('/agent');
    } catch {}
  };

  return (
    <div className="w-full">
      {step === 1 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-10">Identifier le visiteur</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <select value={searchType} onChange={e => setSearchType(e.target.value)} className="w-full border-gray-200 rounded-lg py-3">
              <option value="CIN">CIN</option>
              <option value="ADHESION">N° Adhésion</option>
            </select>
            <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} className="col-span-2 w-full border-gray-200 rounded-lg py-3" placeholder="Recherche..." />
          </div>
          <button onClick={handleSearch} className="mt-8 bg-blue-600 text-white w-full py-3 rounded-lg font-bold">Rechercher</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InfoCard title="Type Adhérent" value={foundVisitor?.typeAdherentDetail || 'N/A'} />
            <InfoCard title="Grade / Echelle" value={foundVisitor?.grade || 'N/A'} />
            <InfoCard title="Affectation" value={foundVisitor?.affectation || 'N/A'} />
            <InfoCard title="Assurance" value={foundVisitor?.typeAssurance || 'N/A'} />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex gap-8">
            <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center">PHOTO</div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 flex-1">
              <InfoRow label="Nom / Prénom" value={`${foundVisitor?.nom} ${foundVisitor?.prenom}`} />
              <InfoRow label="CIN" value={foundVisitor?.cin || 'N/A'} />
              <InfoRow label="Téléphone" value={foundVisitor?.telephone || 'N/A'} />
              <InfoRow label="Sexe" value={foundVisitor?.sexe || 'N/A'} />
              <InfoRow label="Situation Familiale" value={foundVisitor?.situationFamiliale || 'N/A'} />
            </div>
          </div>
          <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><ClipboardList size={20} /> Détails de la visite</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <select value={selectedServiceId || ''} onChange={e => setSelectedServiceId(Number(e.target.value))} className="w-full border-gray-200 rounded-lg py-3">
                  <option value="">Service...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                <select value={selectedMotifId} onChange={e => setSelectedMotifId(e.target.value)} className="w-full border-gray-200 rounded-lg py-3">
                  <option value="">Motif...</option>
                  {motifs.map(m => <option key={m.id} value={m.id}>{m.libelleFr}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <input type="checkbox" checked={isVip} onChange={e => setIsVip(e.target.checked)} className="w-5 h-5" />
                <label className="text-sm font-bold text-yellow-800">Priorité VIP</label>
                <Star size={18} className={isVip ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-300'} />
              </div>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full border-gray-200 rounded-lg p-3" placeholder="Notes..." />
            </div>
            <button type="submit" disabled={loading} className="mt-8 w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition flex items-center justify-center gap-3">
              {loading ? '...' : 'Valider l\'arrivée et assigner un badge'} {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const InfoCard: React.FC<{ title: string, value: string }> = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p><p className="text-sm font-bold text-gray-800 mt-1">{value}</p></div>
);
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between text-sm"><span className="text-gray-400">{label}</span><span className="font-bold text-gray-700">{value}</span></div>
);
