import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from "html5-qrcode";
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
  MapPin,
  ArrowRight,
  X,
  QrCode,
  Keyboard,
  Camera,
  AlertCircle,
  Phone,
  Hash,
  User
} from 'lucide-react';

import { visiteurService, Visiteur as Visitor } from '../../services/visiteurService';
import { serviceService, Service, Motif } from '../../services/serviceService';
import { referenceService, ReferenceItem } from '../../services/referenceService';

export const NouvelleVisitePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchMode, setSearchTypeMode] = useState<'MANUAL' | 'QR'>('MANUAL');

  // References states
  const [refTypes, setRefTypes] = useState<ReferenceItem[]>([]);
  const [refGrades, setRefGrades] = useState<ReferenceItem[]>([]);
  const [refAffectations, setRefAffectations] = useState<ReferenceItem[]>([]);
  const [refAssurances, setRefAssurances] = useState<ReferenceItem[]>([]);
  const [refSituations, setRefSituations] = useState<ReferenceItem[]>([]);

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

  // QR Scanner Instance
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // New Visitor Form State
  const [newVisitor, setNewVisitor] = useState<Partial<Visitor>>({
    type: 'ADHERENT_NON_DECLARE',
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    sexe: 'MONSIEUR',
    situationFamiliale: '',
    typeAdherentDetail: '',
    grade: '',
    affectation: '',
    typeAssurance: ''
  });

  // Charger toutes les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcs, refs] = await Promise.all([
          serviceService.getAll(),
          referenceService.getAll()
        ]);
        setServices(svcs);
        setRefTypes(refs.TYPE_DETAIL || []);
        setRefGrades(refs.GRADE || []);
        setRefAffectations(refs.AFFECTATION || []);
        setRefAssurances(refs.TYPE_ASSURANCE || []);
        setRefSituations(refs.SITUATION_FAMILIALE || []);
        
        // Initialiser les valeurs par défaut
        if (refs.TYPE_DETAIL?.length) setNewVisitor(v => ({...v, typeAdherentDetail: refs.TYPE_DETAIL[0].valeur}));
        if (refs.GRADE?.length) setNewVisitor(v => ({...v, grade: refs.GRADE[0].valeur}));
        if (refs.AFFECTATION?.length) setNewVisitor(v => ({...v, affectation: refs.AFFECTATION[0].valeur}));
        if (refs.TYPE_ASSURANCE?.length) setNewVisitor(v => ({...v, typeAssurance: refs.TYPE_ASSURANCE[0].valeur}));
        if (refs.SITUATION_FAMILIALE?.length) setNewVisitor(v => ({...v, situationFamiliale: refs.SITUATION_FAMILIALE[0].valeur}));
      } catch (err) {
        console.error("Erreur chargement données", err);
      }
    };
    fetchData();
  }, []);

  // Gestion du scanner QR
  useEffect(() => {
    if (searchMode === 'QR' && step === 1) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scannerRef.current.render(onScanSuccess, onScanError);
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [searchMode, step]);

  const onScanSuccess = (decodedText: string) => {
    setSearchId(decodedText);
    setSearchType('CIN'); 
    handleSearch(decodedText, 'CIN');
  };

  const onScanError = () => {
    // Erreur silencieuse
  };

  // Charger les motifs quand le service change
  useEffect(() => {
    if (selectedServiceId) {
      serviceService.getMotifs(selectedServiceId).then(setMotifs);
      setSelectedMotifId(''); 
    } else {
      setMotifs([]);
    }
  }, [selectedServiceId]);
  
  const handleSearch = async (val: string = searchId, type: string = searchType) => {
    if (!val) return;
    setLoading(true);
    setError('');
    setSearchResults([]);
    try {
      let results: Visitor[] = [];
      if (type === 'CIN') {
        const v = await visiteurService.rechercherParCin(val);
        if (v) results = [v];
      } else if (type === 'ADHESION') {
        const v = await visiteurService.rechercherParNumAdhesion(val);
        if (v) results = [v];
      } else {
        results = await visiteurService.rechercherParNom(val);
      }

      if (results.length === 0) setError('Aucun résultat trouvé dans le registre.');
      else if (results.length === 1) { setFoundVisitor(results[0]); setStep(2); }
      else setSearchResults(results);
    } catch (err) {
      setError('Visiteur non répertorié ou erreur système.');
    } finally {
      setLoading(false);
    }
  };

  const selectVisitor = (v: Visitor) => {
    setFoundVisitor(v);
    setStep(2);
  };

  const handleCreateAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await visiteurService.creer(newVisitor as Visitor);
      setFoundVisitor(created);
      setShowAddModal(false);
      setStep(2);
    } catch (err) {
      alert("Erreur lors de la création du dossier.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return alert("Veuillez sélectionner un service de destination.");
    alert(`Visite enregistrée avec succès pour ${foundVisitor?.nom}.`);
    navigate('/agent');
  };

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
    <div className="space-y-10 max-w-7xl mx-auto pb-20 font-sans">
      {/* Header Harmonisé */}
      <div className="flex items-center justify-between border-b-2 border-gray-100 pb-6">
        <button onClick={() => step === 1 ? navigate('/agent') : setStep(1)} className="flex items-center gap-3 text-slate-500 hover:text-blue-700 font-bold transition-all bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm">
          <ChevronLeft size={20} />
          <span className="text-[12px] uppercase tracking-[0.1em]">{step === 1 ? 'Retour au Tableau de Bord' : 'Changer de Visiteur'}</span>
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>1</div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'} rounded-full`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>2</div>
        </div>
      </div>

      {step === 1 ? (
        /* ÉTAPE 1 : RECHERCHE MODERNE AVEC QR CODE (FULL SIZE) */
        <div className="space-y-10 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Identification du Visiteur</h1>
            <p className="text-slate-400 font-medium tracking-wide">Bureau d'accueil - Fondation Hassan II</p>
          </div>

          <section className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
            {/* Tabs Modes */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
               <button 
                onClick={() => setSearchTypeMode('MANUAL')}
                className={`flex-1 py-5 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest transition-all ${searchMode === 'MANUAL' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <Keyboard size={18} /> Saisie Manuelle
               </button>
               <button 
                onClick={() => setSearchTypeMode('QR')}
                className={`flex-1 py-5 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest transition-all ${searchMode === 'QR' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <QrCode size={18} /> Scan QR Code
               </button>
            </div>

            <div className="p-12">
              {searchMode === 'MANUAL' ? (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="md:w-1/3 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Type de document</label>
                      <select value={searchType} onChange={e => setSearchType(e.target.value)} className="w-full border-gray-200 rounded-xl py-3.5 px-4 font-bold text-slate-700 bg-white text-xs uppercase focus:ring-blue-500 transition-shadow shadow-sm">
                        <option value="CIN">Carte Nationale (CIN)</option>
                        <option value="ADHESION">N° Adhésion Fondation</option>
                        <option value="NOM">Nom du Visiteur</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Référence / Identifiant</label>
                      <div className="relative">
                        <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} placeholder="Saisir ici..." className="w-full border-gray-200 rounded-xl py-3.5 pl-10 pr-4 font-bold text-base focus:ring-blue-500 shadow-sm" />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </div>
                    <button onClick={() => handleSearch()} disabled={loading || !searchId} className="h-[54px] bg-slate-900 text-white px-10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-slate-200 flex items-center gap-3">
                      {loading ? 'Recherche...' : 'Vérifier'}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6 justify-center">
                    <div className="h-px flex-1 bg-slate-100"></div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Ou enregistrer un nouveau</p>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>

                  <div className="flex justify-center">
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-3 px-10 py-4 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm">
                      <UserPlus size={18} /> Nouveau Visiteur
                    </button>
                  </div>
                </div>
              ) : (
                /* Scanner QR */
                <div className="max-w-xl mx-auto text-center space-y-8">
                   <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden">
                      <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border-none shadow-inner bg-black min-h-[300px]"></div>
                      <div className="mt-6 flex items-center justify-center gap-3 text-slate-500">
                         <Camera size={20} className="animate-pulse" />
                         <p className="text-xs font-bold uppercase tracking-widest">Caméra d'accueil active</p>
                      </div>
                   </div>
                   <p className="text-sm font-medium text-slate-400">Présentez le QR Code de la carte d'adhésion ou du badge devant la caméra</p>
                </div>
              )}
              {error && <p className="mt-8 text-center text-red-500 font-bold text-xs uppercase animate-bounce">{error}</p>}
            </div>
          </section>

          {/* RÉSULTATS MULTIPLES STYLE ADMINISTRATIF */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500">
              {searchResults.map(v => (
                <div key={v.id} onClick={() => selectVisitor(v)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-2xl transition-all group flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black group-hover:bg-blue-600 transition-colors">
                      {v.nom.charAt(0)}{v.prenom.charAt(0)}
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded border border-blue-100 mb-1">{v.type}</span>
                      <h4 className="text-[17px] font-bold text-slate-800 uppercase leading-none mb-1">{v.nom} {v.prenom}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">CIN: {v.cin}</p>
                    </div>
                  </div>
                  <ArrowRight size={22} className="text-gray-200 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ÉTAPE 2 : FICHE VISITE RESTAURÉE (VERSION PHOTO GÉANTE) */
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* 1. LES 4 CARTES DÉDIÉES (Couleurs Bardin) */}
          {(foundVisitor?.type === 'ADHERENT' || foundVisitor?.type === 'ADHERENT_NON_DECLARE') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InfoCard title="Type Adhérent" value={foundVisitor.typeAdherentDetail || 'Budget Général'} icon={<Users size={28}/>} color="bg-slate-500" />
              <Card label="Grade actuel" value={foundVisitor.grade || 'Administrateur'} icon={<Briefcase size={28}/>} color="violet" />
              <Card label="Affectation" value={foundVisitor.affectation || 'Rabat'} icon={<MapPin size={28}/>} color="teal" />
              <Card label="Assurance" value={foundVisitor.typeAssurance || 'MI/FH2'} icon={<ShieldCheck size={28}/>} color="orange" />
            </div>
          )}

          {/* 2. SECTION PROFIL AVEC PHOTO GÉANTE */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* PHOTO GÉANTE */}
              <div className="shrink-0">
                <div className="w-56 h-56 bg-slate-800 text-white rounded-[3rem] flex items-center justify-center text-6xl font-black shadow-2xl border-8 border-slate-50 rotate-3">
                  {foundVisitor?.nom.charAt(0)}{foundVisitor?.prenom.charAt(0)}
                </div>
              </div>

              {/* AUTRES INFORMATIONS (STRUCTURE LISTE) */}
              <div className="flex-1 space-y-8">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2 leading-none">
                    {foundVisitor?.nom} {foundVisitor?.prenom}
                  </h2>
                  <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em]">
                    {foundVisitor?.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Hash size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CIN / Identifiant</p>
                        <p className="text-xl font-black text-slate-800">{foundVisitor?.cin || 'N/A'}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Téléphonique</p>
                        <p className="text-xl font-black text-slate-800">{foundVisitor?.telephone || 'Non renseigné'}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sexe / Genre</p>
                        <p className="text-xl font-black text-slate-800 uppercase">{foundVisitor?.sexe || 'N/A'}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Situation Familiale</p>
                        <p className="text-xl font-black text-slate-800 uppercase">{foundVisitor?.situationFamiliale || 'N/A'}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. FORMULAIRE DE VISITE STANDARD */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
            <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3 uppercase tracking-tight leading-none">
              <ClipboardList className="text-blue-600" size={32} />
              Enregistrer la Visite
            </h3>

            <form onSubmit={handleRegister} className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">1. Service Destinataire</label>
                  <div className="grid grid-cols-2 gap-4">
                    {services.map(s => (
                      <div key={s.id} onClick={() => setSelectedServiceId(s.id)} className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedServiceId === s.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}>
                        {getServiceIcon(s.nom)}
                        <span className="font-black text-sm uppercase truncate">{s.nom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">2. Motif de Présentation</label>
                    <select value={selectedMotifId} onChange={e => setSelectedMotifId(e.target.value)} required className="w-full border-2 border-slate-100 rounded-2xl py-4 px-6 font-black text-lg focus:ring-blue-500 bg-slate-50">
                      <option value="">CHOISIR UN MOTIF...</option>
                      {motifs.map(m => <option key={m.id} value={m.id}>{m.libelleFr.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-amber-50/50 rounded-2xl border-2 border-amber-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <Star size={32} className={isVip ? "text-amber-500 fill-amber-500" : "text-amber-200"} />
                      <div>
                        <p className="text-lg font-black text-amber-800 uppercase leading-none tracking-tight">Priorité VIP</p>
                        <p className="text-[10px] text-yellow-600 font-bold uppercase mt-1">Traitement prioritaire</p>
                      </div>
                    </div>
                    <input type="checkbox" checked={isVip} onChange={e => setIsVip(e.target.checked)} className="w-10 h-10 rounded-xl text-yellow-600 border-yellow-300 focus:ring-yellow-500" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">3. Observations</label>
                    <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-6 font-bold text-lg focus:ring-blue-500 bg-slate-50" placeholder="Notes complémentaires..."></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 flex justify-end">
                <button type="submit" className="bg-slate-900 text-white px-20 py-6 rounded-3xl font-black text-2xl hover:bg-black transition-all flex items-center gap-6 shadow-2xl uppercase tracking-widest">
                  <ClipboardList size={32} /> Valider l'Arrivée
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL AJOUT PROFESSIONNEL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Nouveau Dossier Visiteur</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2.5 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAndContinue} className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl max-w-md mx-auto shadow-inner">
                <button type="button" onClick={() => setNewVisitor({...newVisitor, type: 'ADHERENT_NON_DECLARE'})} className={`flex-1 py-3 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${newVisitor.type === 'ADHERENT_NON_DECLARE' ? 'bg-white text-blue-700 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Adhérent</button>
                <button type="button" onClick={() => setNewVisitor({...newVisitor, type: 'EXTERNE'})} className={`flex-1 py-3 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${newVisitor.type === 'EXTERNE' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Externe</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <FormField label="Nom Patronyme" value={newVisitor.nom} onChange={v => setNewVisitor({...newVisitor, nom: v})} required />
                <FormField label="Prénom" value={newVisitor.prenom} onChange={v => setNewVisitor({...newVisitor, prenom: v})} required />
                <FormField label="N° CIN / Passeport" value={newVisitor.cin} onChange={v => setNewVisitor({...newVisitor, cin: v})} />
                <FormField label="Contact Téléphonique" value={newVisitor.telephone} onChange={v => setNewVisitor({...newVisitor, telephone: v})} />
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sexe Civil</label>
                  <select value={newVisitor.sexe} onChange={e => setNewVisitor({...newVisitor, sexe: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl py-4 px-6 font-bold bg-slate-50 text-base focus:ring-blue-500 focus:bg-white transition-all">
                    <option value="MONSIEUR">MONSIEUR</option>
                    <option value="MADAME">MADAME</option>
                    <option value="MADEMOISELLE">MADEMOISELLE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{newVisitor.type === 'EXTERNE' ? "Type Externe" : "Situation Civile"}</label>
                  <select value={newVisitor.situationFamiliale || ''} onChange={e => setNewVisitor({...newVisitor, situationFamiliale: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl py-4 px-6 font-bold bg-slate-50 text-base focus:ring-blue-500 focus:bg-white transition-all uppercase">
                    {refSituations.map(opt => <option key={opt.id} value={opt.valeur}>{opt.valeur}</option>)}
                  </select>
                </div>
              </div>

              {newVisitor.type === 'ADHERENT_NON_DECLARE' && (
                <div className="pt-10 border-t border-slate-100 space-y-10 animate-in slide-in-from-top duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie Adhérent</label>
                      <select value={newVisitor.typeAdherentDetail || ''} onChange={e => setNewVisitor({...newVisitor, typeAdherentDetail: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl py-4 px-6 font-bold bg-slate-50 text-base focus:ring-blue-500 focus:bg-white transition-all uppercase">
                        {refTypes.map(opt => <option key={opt.id} value={opt.valeur}>{opt.valeur}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade / Échelle</label>
                      <select value={newVisitor.grade || ''} onChange={e => setNewVisitor({...newVisitor, grade: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl py-4 px-6 font-bold bg-slate-50 text-base focus:ring-blue-500 focus:bg-white transition-all uppercase">
                        {refGrades.map(opt => <option key={opt.id} value={opt.valeur}>{opt.valeur}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Lieu d'Affectation</label>
                      <select value={newVisitor.affectation || ''} onChange={e => setNewVisitor({...newVisitor, affectation: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl py-4 px-6 font-bold bg-slate-50 text-base focus:ring-blue-500 focus:bg-white transition-all uppercase">
                        {refAffectations.map(opt => <option key={opt.id} value={opt.valeur}>{opt.valeur}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Régime d'Assurance</label>
                      <select value={newVisitor.typeAssurance || ''} onChange={e => setNewVisitor({...newVisitor, typeAssurance: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl py-4 px-6 font-bold bg-slate-50 text-base focus:ring-blue-500 focus:bg-white transition-all uppercase">
                        {refAssurances.map(opt => <option key={opt.id} value={opt.valeur}>{opt.valeur}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-6 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-10 py-4 font-black text-slate-400 text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Annuler la Saisie</button>
                <button type="submit" disabled={loading} className="px-12 py-4 bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 flex items-center gap-4 hover:bg-blue-800 transition-all">
                  {loading ? 'Traitement...' : 'Générer la Fiche Visiteur'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* COMPOSANTS DÉDIÉS GÉANTS */

const InfoCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl transition-all">
    <div className={`${color} text-white p-5 rounded-2xl shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{title}</p>
      <p className="text-xl font-black text-slate-900 truncate uppercase leading-tight">{value}</p>
    </div>
  </div>
);

const Card: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => {
  const colors: Record<string, string> = {
    sky: "bg-sky-50 border-sky-100 text-sky-700",
    violet: "bg-violet-50 border-violet-100 text-violet-700",
    teal: "bg-teal-50 border-teal-100 text-teal-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
  };
  return (
    <div className={`${colors[color]} rounded-3xl p-8 border-2 flex items-center gap-6 shadow-sm group hover:shadow-xl transition-all`}>
      <div className="bg-white/70 p-4 rounded-2xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
        <p className="text-xl font-black text-slate-900 uppercase truncate leading-tight tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string, value?: string, onChange: (v: string) => void, required?: boolean }> = ({ label, value, onChange, required }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input required={required} type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full border-2 border-slate-100 rounded-xl py-4 px-6 font-bold bg-slate-50 text-base focus:ring-blue-500 focus:bg-white transition-all shadow-sm" />
  </div>
);

const InfoItem: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none">{label}</p>
    <p className="font-bold text-slate-800 text-xl leading-tight">{value || '---'}</p>
  </div>
);

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
  <div className={`${color} p-6 rounded-2xl shadow-xl border border-white/10 flex items-center gap-6 text-white transition-all hover:-translate-y-1`}>
    <div className="bg-white/20 w-14 h-14 rounded-xl shadow-inner flex items-center justify-center shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] text-white/70 uppercase font-black tracking-widest mb-1">{title}</p>
      <p className="text-[16px] font-bold text-white truncate uppercase leading-tight">{value}</p>
    </div>
  </div>
);
