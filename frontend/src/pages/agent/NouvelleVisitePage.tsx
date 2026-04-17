import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users,
  ChevronLeft, 
  Star, 
  Building2, 
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  CreditCard,
  UserPlus,
  Briefcase,
  MapPin
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
    if (n.includes('estivage')) return <Star size={20}/>;
    if (n.includes('ordre')) return <ClipboardList size={20}/>;
    if (n.includes('adhésion')) return <UserPlus size={20}/>;
    if (n.includes('médical')) return <HeartPulse size={20}/>;
    if (n.includes('info')) return <Search size={20}/>;
    if (n.includes('assurance')) return <ShieldCheck size={20}/>;
    if (n.includes('finance')) return <CreditCard size={20}/>;
    if (n.includes('tech')) return <Building2 size={20}/>;
    return <Users size={20}/>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <button 
          onClick={() => step === 1 ? navigate('/agent') : setStep(1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="font-bold">{step === 1 ? 'Retour au tableau de bord' : 'Changer de visiteur'}</span>
        </button>
      </div>

      {step === 1 ? (
        /* ÉTAPE 1 : RECHERCHE NORMALE */
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Identifier le visiteur</h1>
            <p className="text-gray-500 text-sm mt-1">Veuillez entrer les informations d'identification</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rechercher par</label>
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full border-gray-200 rounded-lg py-3 bg-gray-50 font-medium"
                >
                  <option value="CIN">CIN</option>
                  <option value="ADHESION">N° Adhésion</option>
                  <option value="NOM">Nom / Prénom</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Valeur</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Entrez l'identifiant..."
                    className="w-full border-gray-200 rounded-lg py-3 pl-10 font-medium"
                  />
                  <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Résultats trouvés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map(v => (
                    <div key={v.id} onClick={() => selectVisitor(v)} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-transparent hover:border-blue-500 cursor-pointer transition-all">
                      <span className="font-bold text-gray-700">{v.nom} {v.prenom}</span>
                      <span className="text-xs text-gray-400 font-bold uppercase">CIN: {v.cin}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-center text-red-500 text-sm font-bold">{error}</p>}

            <div className="flex justify-center pt-4">
              <button 
                onClick={handleSearch} 
                disabled={loading || !searchId}
                className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md"
              >
                {loading ? 'Recherche...' : 'Rechercher le visiteur'}
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ÉTAPE 2 : FORMULAIRE NORMAL AVEC PERSONNALISATIONS */
        <div className="space-y-8">
          
          {/* 1. LES 4 CARTES DÉDIÉES (Style StatCard) */}
          {foundVisitor?.type === 'ADHERENT' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Type Adhérent" value={foundVisitor.typeAdherentDetail || 'Budget Général'} icon={<Users size={24}/>} color="bg-sky-500" />
              <StatCard title="Grade actuel" value={foundVisitor.grade || 'Administrateur'} icon={<Briefcase size={24}/>} color="bg-violet-500" />
              <StatCard title="Affectation" value={foundVisitor.affectation || 'Rabat'} icon={<MapPin size={24}/>} color="bg-teal-500" />
              <StatCard title="Assurance" value={foundVisitor.typeAssurance || 'MI/FH2'} icon={<ShieldCheck size={24}/>} color="bg-amber-500" />
            </div>
          )}

          {/* 2. SECTION PROFIL NORMALE AVEC PHOTO LARGE */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* PHOTO LARGE */}
              <div className="shrink-0">
                <div className="w-32 h-32 bg-slate-800 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
                  {foundVisitor?.nom.charAt(0)}{foundVisitor?.prenom.charAt(0)}
                </div>
              </div>

              {/* AUTRES INFORMATIONS */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {foundVisitor?.nom} {foundVisitor?.prenom}
                  </h2>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">{foundVisitor?.type}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CIN</p>
                    <p className="font-bold text-gray-700">{foundVisitor?.cin || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Téléphone</p>
                    <p className="font-bold text-gray-700">{foundVisitor?.telephone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sexe</p>
                    <p className="font-bold text-gray-700 uppercase">{foundVisitor?.sexe || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Famille</p>
                    <p className="font-bold text-gray-700 uppercase">{foundVisitor?.situationFamiliale || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. FORMULAIRE DE VISITE STANDARD */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Détails de la visite</h2>

            <form onSubmit={handleRegister} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Services */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Choisir le service</label>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedServiceId === s.id 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                            : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        <div className={`${selectedServiceId === s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                          {getServiceIcon(s.nom)}
                        </div>
                        <span className="font-bold text-xs truncate uppercase">{s.nom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motifs & Options */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Motif de la visite</label>
                    <select 
                      value={selectedMotifId}
                      onChange={(e) => setSelectedMotifId(e.target.value)}
                      required
                      className="w-full border-gray-200 rounded-lg py-3 bg-gray-50 font-bold"
                    >
                      <option value="">Sélectionnez un motif...</option>
                      {motifs.map(m => (
                        <option key={m.id} value={m.id}>{m.libelleFr.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <Star size={24} className={isVip ? "text-yellow-500 fill-yellow-500" : "text-yellow-200"} />
                      <p className="text-sm font-bold text-yellow-800 uppercase">Priorité VIP</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={isVip}
                      onChange={(e) => setIsVip(e.target.checked)}
                      className="w-6 h-6 rounded text-yellow-600 border-yellow-300 focus:ring-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Notes (Optionnel)</label>
                    <textarea 
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border-gray-200 rounded-lg p-4 font-medium bg-gray-50"
                      placeholder="Précisions..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button 
                  type="submit"
                  className="bg-slate-800 text-white px-10 py-3 rounded-lg font-bold hover:bg-slate-900 transition-all flex items-center gap-3 shadow-lg"
                >
                  <ClipboardList size={20} />
                  Valider l'arrivée
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
    <div className={`${color} text-white p-4 rounded-lg shadow-md shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{title}</p>
      <p className="text-lg font-bold text-gray-800 truncate uppercase">{value}</p>
    </div>
  </div>
);
