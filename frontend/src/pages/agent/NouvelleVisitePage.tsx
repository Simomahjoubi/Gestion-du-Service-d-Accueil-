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
  MapPin,
  ArrowRight,
  X
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

  // Charger les motifs quand le service change
  useEffect(() => {
    if (selectedServiceId) {
      serviceService.getMotifs(selectedServiceId).then(setMotifs);
      setSelectedMotifId(''); 
    } else {
      setMotifs([]);
    }
  }, [selectedServiceId]);
  
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearchResults([]);
    try {
      let results: Visitor[] = [];
      if (searchType === 'CIN') {
        const v = await visiteurService.rechercherParCin(searchId);
        if (v) results = [v];
      } else if (searchType === 'ADHESION') {
        const v = await visiteurService.rechercherParNumAdhesion(searchId);
        if (v) results = [v];
      } else {
        results = await visiteurService.rechercherParNom(searchId);
      }

      if (results.length === 0) setError('Aucun résultat trouvé.');
      else if (results.length === 1) { setFoundVisitor(results[0]); setStep(2); }
      else setSearchResults(results);
    } catch (err) {
      setError('Visiteur introuvable.');
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
      alert("Erreur création visiteur.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return alert("Choisir un service.");
    alert(`Visite enregistrée pour ${foundVisitor?.nom}.`);
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <button onClick={() => step === 1 ? navigate('/agent') : setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-700 font-bold transition-all">
          <ChevronLeft size={20} />
          <span className="text-[13px] uppercase tracking-widest">{step === 1 ? 'Retour' : 'Changer de visiteur'}</span>
        </button>
      </div>

      {step === 1 ? (
        /* RECHERCHE */
        <div className="space-y-6">
          <section className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Identification</h1>
              <p className="text-gray-500 text-sm">Entrer les informations du visiteur</p>
            </div>

            <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type & Valeur</label>
                <div className="flex bg-gray-50 rounded-xl border border-gray-200 overflow-hidden focus-within:border-blue-500 transition-all">
                  <select value={searchType} onChange={e => setSearchType(e.target.value)} className="bg-transparent border-r border-gray-200 py-3 px-4 font-bold text-gray-700 text-xs uppercase focus:ring-0">
                    <option value="CIN">CIN</option>
                    <option value="ADHESION">ADH</option>
                    <option value="NOM">NOM</option>
                  </select>
                  <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} placeholder="Saisir ici..." className="flex-1 bg-transparent py-3 px-4 font-bold text-sm focus:ring-0 border-none" />
                </div>
              </div>
              <button onClick={handleSearch} disabled={loading || !searchId} className="h-[50px] bg-blue-600 text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50">
                {loading ? '...' : 'Chercher'}
              </button>
              <button onClick={() => setShowAddModal(true)} className="h-[50px] bg-emerald-600 text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2">
                <UserPlus size={16} /> Nouveau
              </button>
            </div>
            {error && <p className="mt-4 text-center text-red-500 font-bold text-xs uppercase">{error}</p>}
          </section>

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map(v => (
                <div key={v.id} onClick={() => selectVisitor(v)} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-500 shadow-sm cursor-pointer flex items-center justify-between transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {v.nom.charAt(0)}{v.prenom.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-blue-600 uppercase">{v.type}</p>
                      <h4 className="text-sm font-bold text-gray-800 uppercase">{v.nom} {v.prenom}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">CIN: {v.cin}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* FORMULAIRE ETAPE 2 */
        <div className="space-y-8">
          {(foundVisitor?.type === 'ADHERENT' || foundVisitor?.type === 'ADHERENT_NON_DECLARE') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Type Adhérent" value={foundVisitor.typeAdherentDetail || '---'} icon={<Users size={24}/>} color="bg-slate-500" />
              <StatCard title="Grade" value={foundVisitor.grade || '---'} icon={<Briefcase size={24}/>} color="bg-indigo-500" />
              <StatCard title="Affectation" value={foundVisitor.affectation || '---'} icon={<MapPin size={24}/>} color="bg-sky-600" />
              <StatCard title="Assurance" value={foundVisitor.typeAssurance || '---'} icon={<ShieldCheck size={24}/>} color="bg-violet-600" />
            </div>
          )}

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0 w-32 h-32 bg-slate-800 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
                {foundVisitor?.nom.charAt(0)}{foundVisitor?.prenom.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 uppercase mb-4">{foundVisitor?.nom} {foundVisitor?.prenom}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 uppercase">
                  <InfoItem label="CIN" value={foundVisitor?.cin} />
                  <InfoItem label="Téléphone" value={foundVisitor?.telephone} />
                  <InfoItem label="Sexe" value={foundVisitor?.sexe} />
                  <InfoItem label="Famille" value={foundVisitor?.situationFamiliale} />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight border-b border-gray-100 pb-2">Enregistrement Visite</h2>
            <form onSubmit={handleRegister} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Destination</label>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map(s => (
                      <div key={s.id} onClick={() => setSelectedServiceId(s.id)} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedServiceId === s.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>
                        {getServiceIcon(s.nom)}
                        <span className="font-bold text-[11px] uppercase truncate">{s.nom}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Motif</label>
                    <select value={selectedMotifId} onChange={e => setSelectedMotifId(e.target.value)} required className="w-full border-gray-200 rounded-lg py-3 px-4 font-bold bg-gray-50 text-sm focus:ring-blue-500">
                      <option value="">CHOISIR UN MOTIF...</option>
                      {motifs.map(m => <option key={m.id} value={m.id}>{m.libelleFr.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <Star size={24} className={isVip ? "text-yellow-500 fill-yellow-500" : "text-yellow-200"} />
                      <p className="text-xs font-black text-yellow-800 uppercase">Priorité VIP</p>
                    </div>
                    <input type="checkbox" checked={isVip} onChange={e => setIsVip(e.target.checked)} className="w-5 h-5 rounded text-yellow-600 border-yellow-300" />
                  </div>
                  <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full border-gray-200 rounded-lg p-4 font-medium bg-gray-50 text-sm" placeholder="Notes (Optionnel)..."></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-50">
                <button type="submit" className="bg-slate-800 text-white px-12 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 shadow-lg flex items-center gap-3 transition-all">
                  <ClipboardList size={20} /> Valider l'arrivée
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL AJOUT PROFESSIONNEL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Nouveau Profil</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition-all">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAndContinue} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                <button type="button" onClick={() => setNewVisitor({...newVisitor, type: 'ADHERENT_NON_DECLARE'})} className={`flex-1 py-3 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${newVisitor.type === 'ADHERENT_NON_DECLARE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Adhérent</button>
                <button type="button" onClick={() => setNewVisitor({...newVisitor, type: 'EXTERNE'})} className={`flex-1 py-3 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${newVisitor.type === 'EXTERNE' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>Externe</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField label="Nom" value={newVisitor.nom} onChange={v => setNewVisitor({...newVisitor, nom: v})} required />
                <FormField label="Prénom" value={newVisitor.prenom} onChange={v => setNewVisitor({...newVisitor, prenom: v})} required />
                <FormField label="CIN" value={newVisitor.cin} onChange={v => setNewVisitor({...newVisitor, cin: v})} />
                <FormField label="Téléphone" value={newVisitor.telephone} onChange={v => setNewVisitor({...newVisitor, telephone: v})} />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sexe</label>
                  <select value={newVisitor.sexe} onChange={e => setNewVisitor({...newVisitor, sexe: e.target.value})} className="w-full border-gray-200 rounded-xl py-3 px-4 font-bold bg-gray-50 text-sm">
                    <option value="MONSIEUR">Monsieur</option>
                    <option value="MADAME">Madame</option>
                    <option value="MADEMOISELLE">Mademoiselle</option>
                  </select>
                </div>
                <SelectField label={newVisitor.type === 'EXTERNE' ? "Type Externe" : "Situation"} value={newVisitor.situationFamiliale} options={refSituations} onChange={v => setNewVisitor({...newVisitor, situationFamiliale: v})} />
              </div>

              {newVisitor.type === 'ADHERENT_NON_DECLARE' && (
                <div className="pt-6 border-t border-gray-100 space-y-6 animate-in slide-in-from-top">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <SelectField label="Type Adhérent" value={newVisitor.typeAdherentDetail} options={refTypes} onChange={v => setNewVisitor({...newVisitor, typeAdherentDetail: v})} />
                    <SelectField label="Grade" value={newVisitor.grade} options={refGrades} onChange={v => setNewVisitor({...newVisitor, grade: v})} />
                    <SelectField label="Affectation" value={newVisitor.affectation} options={refAffectations} onChange={v => setNewVisitor({...newVisitor, affectation: v})} />
                    <SelectField label="Assurance" value={newVisitor.typeAssurance} options={refAssurances} onChange={v => setNewVisitor({...newVisitor, typeAssurance: v})} />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 font-bold text-gray-400 text-xs uppercase">Annuler</button>
                <button type="submit" disabled={loading} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2">
                  {loading ? '...' : 'Valider le profil'} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* COMPOSANTS FORMULAIRE */
const FormField: React.FC<{ label: string, value?: string, onChange: (v: string) => void, required?: boolean }> = ({ label, value, onChange, required }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input required={required} type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full border-gray-200 rounded-xl py-3 px-4 font-bold bg-gray-50 text-sm focus:ring-blue-500 focus:bg-white transition-all" />
  </div>
);

const SelectField: React.FC<{ label: string, value?: string, options: ReferenceItem[], onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full border-gray-200 rounded-xl py-3 px-4 font-bold bg-gray-50 text-sm focus:ring-blue-500 focus:bg-white transition-all">
      {options.map(opt => <option key={opt.id} value={opt.valeur}>{opt.valeur.toUpperCase()}</option>)}
    </select>
  </div>
);

const InfoItem: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-gray-400 tracking-widest">{label}</p>
    <p className="font-bold text-gray-700 text-sm">{value || '---'}</p>
  </div>
);

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
  <div className={`${color} p-6 rounded-xl shadow-md border border-white/10 flex items-center gap-5 text-white transition-transform hover:scale-[1.02]`}>
    <div className="bg-white/20 p-4 rounded-lg shadow-inner flex items-center justify-center shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] text-white/80 uppercase font-black tracking-widest mb-1">{title}</p>
      <p className="text-base font-bold text-white truncate uppercase">{value}</p>
    </div>
  </div>
);
