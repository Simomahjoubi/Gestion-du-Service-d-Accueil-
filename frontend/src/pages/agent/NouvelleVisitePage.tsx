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
  UserPlus
} from 'lucide-react';

import { visiteurService, Visiteur as Visitor } from '../../services/visiteurService';
import { serviceService, Service, Motif } from '../../services/serviceService';

export const NouvelleVisitePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Services & Motifs states
  const [services, setServices] = useState<Service[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedMotifId, setSelectedMotifId] = useState<string>('');

  // Form states
  const [searchType, setSearchType] = useState('CIN'); // CIN, ADHESION, NOM
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState<Visitor[]>([]);
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);
  
  const [isVip, setIsVip] = useState(false);
  const [notes, setNotes] = useState('');

  // Charger les services au démarrage
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceService.getAll();
        setServices(data);
      } catch (err) {
        console.error("Erreur chargement services", err);
      }
    };
    fetchServices();
  }, []);

  // Charger les motifs quand le service change
  useEffect(() => {
    if (selectedServiceId) {
      const fetchMotifs = async () => {
        try {
          const data = await serviceService.getMotifs(selectedServiceId);
          setMotifs(data);
          setSelectedMotifId(''); // Reset motif selection
        } catch (err) {
          console.error("Erreur chargement motifs", err);
        }
      };
      fetchMotifs();
    } else {
      setMotifs([]);
    }
  }, [selectedServiceId]);
  
  // Recherche réelle via API
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
    } catch (err) {
      setError('Erreur lors de la recherche du visiteur.');
    } finally {
      setLoading(false);
    }
  };

  const selectVisitor = (v: Visitor) => {
    setFoundVisitor(v);
    setStep(2);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) {
      alert("Veuillez sélectionner un service.");
      return;
    }
    alert(`Visite enregistrée ! Badge B001 attribué à ${foundVisitor?.nom}. Notification envoyée au staff.`);
    navigate('/agent');
  };

  // Helper pour les icônes
  const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('estivage')) return <Star size={16}/>;
    if (n.includes('ordre')) return <ClipboardList size={16}/>;
    if (n.includes('adhésion')) return <UserPlus size={16}/>;
    if (n.includes('médical')) return <HeartPulse size={16}/>;
    if (n.includes('info')) return <Search size={16}/>;
    if (n.includes('assurance')) return <ShieldCheck size={16}/>;
    if (n.includes('finance')) return <CreditCard size={16}/>;
    if (n.includes('tech')) return <Building2 size={16}/>;
    return <Users size={16}/>;
  };

  return (
    <div className="w-full">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => step === 1 ? navigate('/agent') : setStep(1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>{step === 1 ? 'Retour au tableau de bord' : 'Changer de visiteur'}</span>
        </button>
        <div className="flex items-center gap-2">
           <span className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></span>
           <div className="w-10 h-0.5 bg-gray-200"></div>
           <span className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></span>
        </div>
      </div>

      {step === 1 ? (
        /* ÉTAPE 1 : RECHERCHE */
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
                onChange={(e) => setSearchType(e.target.value)}
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
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder={searchType === 'NOM' ? "Ex: Alami" : "Entrez l'identifiant"}
                  className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-3 pl-10"
                />
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Affichage des résultats multiples */}
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
        /* ÉTAPE 2 : FORMULAIRE D'ENREGISTREMENT */
        <form onSubmit={handleRegister} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Visiteur (Gauche) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {foundVisitor?.nom.charAt(0)}{foundVisitor?.prenom.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{foundVisitor?.nom} {foundVisitor?.prenom}</h2>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {foundVisitor?.type}
                  </span>
                  {foundVisitor?.statutAdherent && (
                    <span className={`${foundVisitor.statutAdherent === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest`}>
                      {foundVisitor.statutAdherent}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-4 border-t border-gray-50 pt-6">
                {/* Règle Adhérent : Affiche CIN, N° Adhésion et détails pro */}
                {foundVisitor?.type === 'ADHERENT' && (
                  <>
                    <InfoRow label="CIN" value={foundVisitor.cin || 'N/A'} />
                    <InfoRow label="N° Adhérent" value={foundVisitor.numAdhesion || 'N/A'} color="text-blue-600" />
                    <div className="pt-2 mt-2 border-t border-dashed border-gray-100 space-y-3">
                      <InfoRow label="Type Adhérent" value={foundVisitor.typeAdherentDetail || 'N/A'} />
                      <InfoRow label="Grade" value={foundVisitor.grade || 'N/A'} />
                      <InfoRow label="Affectation" value={foundVisitor.affectation || 'N/A'} color="text-slate-900" />
                      <InfoRow 
                        label="Assurance" 
                        value={foundVisitor.typeAssurance || 'N/A'} 
                        color={foundVisitor.typeAssurance?.toLowerCase().includes('non') ? 'text-red-600' : 'text-green-600'} 
                      />
                    </div>
                  </>
                )}

                {/* Règle Conjoint : Affiche son CIN, Lien et infos de l'Adhérent */}
                {foundVisitor?.type === 'CONJOINT' && (
                  <>
                    <InfoRow label="CIN Conjoint" value={foundVisitor.cin || 'N/A'} />
                    <InfoRow label="Lien" value={foundVisitor.lienParente || 'ÉPOUSE'} color="text-purple-600" />
                    <div className="pt-2 mt-2 border-t border-dashed border-gray-100">
                      <InfoRow label="Adhérent" value={foundVisitor.parentNom || 'N/A'} color="text-slate-900" />
                      <InfoRow label="CIN Adhérent" value={foundVisitor.parentCin || 'N/A'} />
                    </div>
                  </>
                )}

                {/* Règle Enfant : Affiche son CIN, Lien et infos du Parent (Adhérent) */}
                {foundVisitor?.type === 'ENFANT' && (
                  <>
                    <InfoRow label="CIN Enfant" value={foundVisitor.cin || 'N/A'} />
                    <InfoRow label="Lien" value={foundVisitor.lienParente || 'ENFANT'} color="text-purple-600" />
                    <div className="pt-2 mt-2 border-t border-dashed border-gray-100">
                      <InfoRow label="Adhérent (Parent)" value={foundVisitor.parentNom || 'N/A'} color="text-slate-900" />
                      <InfoRow label="CIN Adhérent" value={foundVisitor.parentCin || 'N/A'} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire Visite (Droite) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ClipboardList className="text-blue-600" size={20} />
                Détails de la visite
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Service cible</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {services.map(s => (
                      <ServiceToggle 
                        key={s.id}
                        label={s.nom} 
                        icon={getServiceIcon(s.nom)} 
                        selected={selectedServiceId === s.id} 
                        onClick={() => setSelectedServiceId(s.id)} 
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Motif de la visite</label>
                  <select 
                    value={selectedMotifId}
                    onChange={(e) => setSelectedMotifId(e.target.value)}
                    required
                    className="w-full border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 py-3"
                  >
                    <option value="">Sélectionnez un motif...</option>
                    {motifs.map(m => (
                      <option key={m.id} value={m.id}>{m.libelleFr}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                   <div className="flex-1">
                      <p className="text-sm font-bold text-yellow-800">Priorité VIP</p>
                      <p className="text-xs text-yellow-700">Placer ce visiteur en haut de la file d'attente</p>
                   </div>
                   <input 
                    type="checkbox"
                    checked={isVip}
                    onChange={(e) => setIsVip(e.target.checked)}
                    className="w-6 h-6 rounded text-yellow-600 focus:ring-yellow-500 border-yellow-300"
                   />
                   <Star size={20} className={isVip ? "text-yellow-500 fill-yellow-500" : "text-yellow-300"} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optionnel)</label>
                  <textarea 
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 p-3"
                    placeholder="Informations complémentaires..."
                  ></textarea>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              Valider l'arrivée et assigner un badge
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const InfoRow: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-400 font-medium">{label}</span>
    <span className={`font-bold ${color || 'text-gray-700'}`}>{value}</span>
  </div>
);

const ServiceToggle: React.FC<{ label: string, icon: React.ReactNode, selected: boolean, onClick: () => void }> = ({ label, icon, selected, onClick }) => (
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
