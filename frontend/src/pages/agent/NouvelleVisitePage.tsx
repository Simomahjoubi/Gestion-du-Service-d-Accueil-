import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Users,
  ArrowRight,
  ChevronLeft,
  Star,
  Building2,
  ClipboardList,
  AlertCircle,
  HeartPulse,
  ShieldCheck,
  CreditCard,
  UserPlus,
  CheckCircle2,
  Tag,
} from 'lucide-react';

import { visiteurService, Visiteur as Visitor } from '../../services/visiteurService';
import { serviceService, Service, Motif } from '../../services/serviceService';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

interface VisiteCreatedResult {
  id: number;
  visiteurNom: string;
  fonctionnaireNom: string;
  serviceNom: string;
  badgeCode: string;
  heureArrivee: string;
}

export const NouvelleVisitePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [services, setServices] = useState<Service[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedMotifId, setSelectedMotifId] = useState<string>('');

  const [searchType, setSearchType] = useState('CIN');
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState<Visitor[]>([]);
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);

  const [isVip, setIsVip] = useState(false);
  const [notes, setNotes] = useState('');

  const [confirmation, setConfirmation] = useState<VisiteCreatedResult | null>(null);

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
    setLoading(true);
    setError('');
    setSearchResults([]);
    setFoundVisitor(null);

    try {
      let results: Visitor[] = [];
      if (searchType === 'CIN') {
        try {
          const v = await visiteurService.rechercherParCin(searchId);
          if (v) results = [v];
        } catch (e: any) {
          if (e.response?.status !== 404) throw e;
        }
      } else if (searchType === 'ADHESION') {
        try {
          const v = await visiteurService.rechercherParNumAdhesion(searchId);
          if (v) results = [v];
        } catch (e: any) {
          if (e.response?.status !== 404) throw e;
        }
      } else {
        results = await visiteurService.rechercherParNom(searchId);
      }

      if (results.length === 0) {
        setError('Aucun visiteur trouvé.');
      } else if (results.length === 1) {
        setFoundVisitor(results[0]);
        setStep(2);
      } else {
        setSearchResults(results);
      }
    } catch {
      setError('Erreur lors de la recherche du visiteur.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) { alert('Veuillez sélectionner un service.'); return; }
    if (!selectedMotifId)   { alert('Veuillez sélectionner un motif.'); return; }
    if (!foundVisitor)      return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/visites/enregistrer', {
        visiteurId:    foundVisitor.id,
        objetVisiteId: Number(selectedMotifId),
        notes,
        isVip,
        agentId:       user?.id,
      });
      const data = response.data;
      setConfirmation({
        id:               data.id,
        visiteurNom:      data.visiteurNom,
        fonctionnaireNom: data.fonctionnaireNom,
        serviceNom:       data.serviceNom,
        badgeCode:        data.badgeCode,
        heureArrivee:     data.heureArrivee,
      });
    } catch (err: any) {
      const d = err.response?.data;
      const msg = d?.message || d?.error || (typeof d === 'string' ? d : null) || err.message || 'Erreur lors de la création de la visite.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('estivage')) return <Star size={16}/>;
    if (n.includes('ordre'))    return <ClipboardList size={16}/>;
    if (n.includes('adhésion')) return <UserPlus size={16}/>;
    if (n.includes('médical'))  return <HeartPulse size={16}/>;
    if (n.includes('info'))     return <Search size={16}/>;
    if (n.includes('assurance')) return <ShieldCheck size={16}/>;
    if (n.includes('finance'))  return <CreditCard size={16}/>;
    if (n.includes('tech'))     return <Building2 size={16}/>;
    return <Users size={16}/>;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => step === 1 ? navigate('/agent') : setStep(1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>{step === 1 ? 'Retour au tableau de bord' : 'Changer de visiteur'}</span>
        </button>
      </div>

      {step === 1 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-800">Identifier le visiteur</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <select value={searchType} onChange={e => setSearchType(e.target.value)} className="w-full border-gray-200 rounded-lg py-3">
              <option value="CIN">CIN</option>
              <option value="ADHESION">N° Adhésion</option>
              <option value="NOM">Nom / Prénom</option>
            </select>
            <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} className="col-span-2 w-full border-gray-200 rounded-lg py-3" placeholder="Recherche..." />
          </div>
          <button onClick={handleSearch} className="mt-8 bg-blue-600 text-white w-full py-3 rounded-lg font-bold hover:bg-blue-700">Rechercher</button>
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
              <InfoRow label="Lien Parenté" value={foundVisitor?.lienParente || 'N/A'} />
            </div>
          </div>
          <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Enregistrement de la visite</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select value={selectedServiceId || ''} onChange={e => setSelectedServiceId(Number(e.target.value))} className="w-full border-gray-200 rounded-lg py-3">
                <option value="">Service...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
              <select value={selectedMotifId} onChange={e => setSelectedMotifId(e.target.value)} className="w-full border-gray-200 rounded-lg py-3">
                <option value="">Motif...</option>
                {motifs.map(m => <option key={m.id} value={m.id}>{m.libelleFr}</option>)}
              </select>
            </div>
            <button type="submit" className="mt-8 w-full bg-blue-700 text-white py-4 rounded-lg font-bold">Valider</button>
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
