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

  // Services & Motifs states
  const [services, setServices] = useState<Service[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedMotifId, setSelectedMotifId] = useState<string>('');

  // Form states
  const [searchType, setSearchType] = useState('CIN');
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState<Visitor[]>([]);
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);

  const [isVip, setIsVip] = useState(false);
  const [notes, setNotes] = useState('');

  // Confirmation modal
  const [confirmation, setConfirmation] = useState<VisiteCreatedResult | null>(null);

  // Charger les services au démarrage
  useEffect(() => {
    serviceService.getAll().then(setServices).catch(() => {});
  }, []);

  // Charger les motifs quand le service change
  useEffect(() => {
    if (selectedServiceId) {
      serviceService.getMotifs(selectedServiceId)
        .then(data => { setMotifs(data); setSelectedMotifId(''); })
        .catch(() => {});
    } else {
      setMotifs([]);
    }
  }, [selectedServiceId]);

  // Recherche via API
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

  const selectVisitor = (v: Visitor) => {
    setFoundVisitor(v);
    setStep(2);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => step === 1 ? navigate('/agent') : setStep(1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>{step === 1 ? 'Retour au tableau de bord' : 'Changer de visiteur'}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}/>
          <div className="w-10 h-0.5 bg-gray-200"/>
          <span className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}/>
        </div>
      </div>

      {step === 1 ? (
        /* ── ÉTAPE 1 : RECHERCHE ── */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Identifier le visiteur</h1>
            <p className="text-gray-500 mt-2">Recherchez l'adhérent ou le visiteur dans la base de données</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rechercher par</label>
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-3 bg-gray-50"
              >
                <option value="CIN">CIN</option>
                <option value="ADHESION">N° Adhésion</option>
                <option value="NOM">Nom / Prénom</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Valeur à rechercher</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchId && handleSearch()}
                  placeholder={searchType === 'NOM' ? 'Ex: Alami' : "Entrez l'identifiant"}
                  className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-3 pl-10"
                />
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {searchResults.length > 1 && (
            <div className="mt-8 w-full">
              <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                <Users size={16} /> {searchResults.length} résultats trouvés
              </h3>
              <div className="space-y-3">
                {searchResults.map(v => (
                  <div
                    key={v.id}
                    onClick={() => selectVisitor(v)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
                  >
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-blue-700">{v.nom} {v.prenom}</p>
                      <p className="text-xs text-gray-500">CIN: {v.cin} | Type: {v.type}</p>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-2 text-red-600 justify-center text-sm font-medium">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={loading || !searchId}
              className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'Recherche en cours...' : 'Rechercher'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>
        </div>
      ) : (
        {/* ── ÉTAPE 2 : FORMULAIRE REDESIGN ── */}
        <div className="space-y-6">
          
          {/* Row 1: Informations d'Adhésion (4 cartes) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InfoCard title="Type Adhérent" value={foundVisitor?.typeAdherentDetail || 'N/A'} />
            <InfoCard title="Grade / Echelle" value={foundVisitor?.grade || 'N/A'} />
            <InfoCard title="Affectation" value={foundVisitor?.affectation || 'N/A'} />
            <InfoCard title="Assurance" value={foundVisitor?.typeAssurance || 'N/A'} />
          </div>

          {/* Row 2: Photo et infos personnelles */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex gap-8">
            <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-bold">PHOTO</div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 flex-1">
              <InfoRow label="Nom / Prénom" value={`${foundVisitor?.nom} ${foundVisitor?.prenom}`} />
              <InfoRow label="CIN" value={foundVisitor?.cin || 'N/A'} />
              <InfoRow label="Téléphone" value={foundVisitor?.telephone || 'N/A'} />
              <InfoRow label="Sexe" value={foundVisitor?.sexe || 'N/A'} />
              <InfoRow label="Situation Familiale" value={foundVisitor?.situationFamiliale || 'N/A'} />
              <InfoRow label="Lien Parenté" value={foundVisitor?.lienParente || 'N/A'} />
            </div>
          </div>

          {/* Row 3: Enregistrement Visite */}
          <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Enregistrement de la visite</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Service</label>
                <select value={selectedServiceId || ''} onChange={e => setSelectedServiceId(Number(e.target.value))} className="w-full border-gray-200 rounded-lg py-3">
                  <option value="">Choisir un service...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Motif</label>
                <select value={selectedMotifId} onChange={e => setSelectedMotifId(e.target.value)} className="w-full border-gray-200 rounded-lg py-3">
                  <option value="">Choisir un motif...</option>
                  {motifs.map(m => <option key={m.id} value={m.id}>{m.libelleFr}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="mt-8 w-full bg-blue-700 text-white py-4 rounded-lg font-bold hover:bg-blue-800 transition">Valider et Affecter Badge</button>
          </form>
        </div>
      )}
    </div>
  );
};

const InfoCard: React.FC<{ title: string, value: string }> = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
    <p className="text-sm font-bold text-gray-800 mt-1">{value}</p>
  </div>
);
      )}

      {/* ── Modal de confirmation ── */}
      {confirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Visite enregistrée</p>
                  <p className="text-emerald-100 text-xs">Notification envoyée au fonctionnaire</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <ConfirmRow icon={<User size={16}/>}     label="Visiteur"       value={confirmation.visiteurNom} />
              <ConfirmRow icon={<Tag size={16}/>}      label="Badge assigné"  value={confirmation.badgeCode} highlight />
              <ConfirmRow icon={<Users size={16}/>}    label="Fonctionnaire"  value={confirmation.fonctionnaireNom} />
              <ConfirmRow icon={<Building2 size={16}/>} label="Service"       value={confirmation.serviceNom} />
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  setConfirmation(null);
                  navigate('/agent');
                }}
                className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
              >
                Retour au tableau de bord
              </button>
              <button
                onClick={() => {
                  setConfirmation(null);
                  setStep(1);
                  setFoundVisitor(null);
                  setSearchId('');
                  setSelectedServiceId(null);
                  setSelectedMotifId('');
                  setIsVip(false);
                  setNotes('');
                }}
                className="flex-1 py-3 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
              >
                Nouvelle visite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-400 font-medium">{label}</span>
    <span className={`font-bold ${color || 'text-gray-700'}`}>{value}</span>
  </div>
);

const ServiceToggle: React.FC<{ label: string; icon: React.ReactNode; selected: boolean; onClick: () => void }> = ({ label, icon, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
      selected
        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
    }`}
  >
    {icon} {label}
  </button>
);

const ConfirmRow: React.FC<{ icon: React.ReactNode; label: string; value: string; highlight?: boolean }> = ({ icon, label, value, highlight }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-emerald-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  </div>
);
