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
  AlertCircle
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
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Header Harmonisé */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <button onClick={() => step === 1 ? navigate('/agent') : setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-700 font-bold transition-all">
          <ChevronLeft size={20} />
          <span className="text-[13px] uppercase tracking-widest">{step === 1 ? 'Retour | العودة' : 'Changer | تغيير'}</span>
        </button>
      </div>

      {step === 1 ? (
        /* ÉTAPE 1 : RECHERCHE HARMONISÉE */
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight leading-none flex flex-col gap-2">
                 <span>Identification du Visiteur</span>
                 <span className="font-arabic text-xl">تحديد هوية الزائر</span>
              </h1>
            </div>

            {/* Tabs de recherche */}
            <div className="flex bg-gray-50 p-1 rounded-xl mb-8 max-w-md mx-auto border border-gray-100">
               <button 
                onClick={() => setSearchTypeMode('MANUAL')}
                className={`flex-1 py-2 flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest rounded-lg transition-all ${searchMode === 'MANUAL' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400'}`}
               >
                 <Keyboard size={14} /> Manuel | يدوي
               </button>
               <button 
                onClick={() => setSearchTypeMode('QR')}
                className={`flex-1 py-2 flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest rounded-lg transition-all ${searchMode === 'QR' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400'}`}
               >
                 <QrCode size={14} /> Scan QR | مسح
               </button>
            </div>

            <div className="max-w-3xl mx-auto">
              {searchMode === 'MANUAL' ? (
                <div className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identification</label>
                       <label className="font-arabic text-[10px] text-gray-400 uppercase tracking-widest">تحديد الهوية</label>
                    </div>
                    <div className="flex bg-gray-50 rounded-xl border border-gray-200 overflow-hidden focus-within:border-blue-500 transition-all">
                      <select value={searchType} onChange={e => setSearchType(e.target.value)} className="bg-transparent border-r border-gray-200 py-3 px-4 font-bold text-gray-700 text-xs uppercase focus:ring-0">
                        <option value="CIN">CIN</option>
                        <option value="ADHESION">ADH</option>
                        <option value="NOM">NOM</option>
                      </select>
                      <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} placeholder="Saisir ici... | أدخل هنا" className="flex-1 bg-transparent py-3 px-4 font-bold text-sm focus:ring-0 border-none" />
                    </div>
                  </div>
                  <button onClick={() => handleSearch()} disabled={loading || !searchId} className="h-[46px] bg-blue-600 text-white px-8 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50">
                    {loading ? '...' : 'Chercher | بحث'}
                  </button>
                  <button onClick={() => setShowAddModal(true)} className="h-[46px] bg-emerald-600 text-white px-8 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2">
                    <UserPlus size={14} /> Ajouter | إضافة
                  </button>
                </div>
              ) : (
                /* Scanner QR */
                <div className="max-w-md mx-auto text-center space-y-4">
                   <div className="p-3 bg-slate-900 rounded-2xl border-4 border-slate-800 shadow-xl overflow-hidden relative">
                      <div id="qr-reader" className="w-full overflow-hidden rounded-xl border-none bg-black min-h-[250px]"></div>
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase">
                         <Camera size={10} /> Live | مباشر
                      </div>
                   </div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Scanner le code | امسح الرمز</p>
                </div>
              )}
              {error && (
                <div className="mt-6 flex flex-col items-center justify-center gap-1 text-red-500 bg-red-50 py-3 rounded-lg border border-red-100 font-bold text-xs uppercase animate-bounce">
                   <div className="flex items-center gap-2"><AlertCircle size={14} /> {error}</div>
                   <span className="font-arabic">لم يتم العثور على نتائج أو خطأ في النظام</span>
                </div>
              )}
            </div>
          </section>

          {/* Résultats de recherche harmonisés */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-500">
              {searchResults.map(v => (
                <div key={v.id} onClick={() => selectVisitor(v)} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-500 shadow-sm cursor-pointer flex items-center justify-between transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {v.nom.charAt(0)}{v.prenom.charAt(0)}
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded border border-blue-100 mb-0.5">{v.type}</span>
                      <h4 className="text-[14px] font-bold text-gray-800 uppercase leading-none mb-1">{v.nom} {v.prenom}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">CIN: {v.cin}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ÉTAPE 2 : FICHE VISITE HARMONISÉE */
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* 1. LES 4 CARTES DÉDIÉES (Couleurs Bardin/Froid - Style StatCard Harmonisé) */}
          {(foundVisitor?.type === 'ADHERENT' || foundVisitor?.type === 'ADHERENT_NON_DECLARE') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Type Adhérent" titleAr="نوع المنخرط" value={foundVisitor.typeAdherentDetail || '---'} icon={<Users size={20}/>} color="bg-slate-500" />
              <StatCard title="Grade actuel" titleAr="الرتبة الحالية" value={foundVisitor.grade || '---'} icon={<Briefcase size={20}/>} color="bg-indigo-500" />
              <StatCard title="Affectation" titleAr="التعيين" value={foundVisitor.affectation || '---'} icon={<MapPin size={20}/>} color="bg-sky-600" />
              <StatCard title="Assurance" titleAr="التأمين" value={foundVisitor.typeAssurance || '---'} icon={<ShieldCheck size={20}/>} color="bg-violet-600" />
            </div>
          )}

          {/* 2. SECTION PROFIL HARMONISÉE AVEC PHOTO LARGE */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              {/* PHOTO LARGE */}
              <div className="shrink-0">
                <div className="w-40 h-40 bg-slate-800 text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-xl border-4 border-white ring-1 ring-gray-100">
                  {foundVisitor?.nom.charAt(0)}{foundVisitor?.prenom.charAt(0)}
                </div>
              </div>

              {/* AUTRES INFORMATIONS */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">
                      {foundVisitor?.nom} {foundVisitor?.prenom}
                    </h2>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-slate-200">{foundVisitor?.type}</span>
                  </div>
                  <span className="font-arabic text-gray-400 text-sm">ملف الزائر النشط</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 uppercase">
                  <div className="space-y-1">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CIN</span>
                       <span className="font-arabic text-[9px] text-gray-300">رقم البطاقة الوطنية</span>
                    </div>
                    <p className="text-[15px] font-bold text-gray-700">{foundVisitor?.cin || '---'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Téléphone</span>
                       <span className="font-arabic text-[9px] text-gray-300">الهاتف</span>
                    </div>
                    <p className="text-[15px] font-bold text-gray-700">{foundVisitor?.telephone || '---'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sexe</span>
                       <span className="font-arabic text-[9px] text-gray-300">الجنس</span>
                    </div>
                    <p className="text-[15px] font-bold text-gray-700 uppercase">{foundVisitor?.sexe || '---'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Famille</span>
                       <span className="font-arabic text-[9px] text-gray-300">الحالة العائلية</span>
                    </div>
                    <p className="text-[15px] font-bold text-gray-700 uppercase">{foundVisitor?.situationFamiliale || '---'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. FORMULAIRE DE VISITE STANDARD HARMONISÉ */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2 uppercase tracking-tight flex justify-between items-center w-full">
               <span>Détails de la visite</span>
               <span className="font-arabic text-lg">تفاصيل الزيارة</span>
            </h2>

            <form onSubmit={handleRegister} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Services */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pl-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">1. Choisir le service</label>
                     <label className="font-arabic text-[10px] text-gray-400">1. اختر المصلحة</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map(s => (
                      <div key={s.id} onClick={() => setSelectedServiceId(s.id)} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedServiceId === s.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>
                        <div className={`${selectedServiceId === s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                          {getServiceIcon(s.nom)}
                        </div>
                        <span className="font-bold text-xs truncate uppercase tracking-tight">{s.nom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motifs & Options */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2 pl-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2. Motif de la visite</label>
                       <label className="font-arabic text-[10px] text-gray-400">2. سبب الزيارة</label>
                    </div>
                    <select 
                      value={selectedMotifId}
                      onChange={(e) => setSelectedMotifId(e.target.value)}
                      required
                      className="w-full border-gray-200 rounded-lg py-3 px-4 font-bold bg-gray-50 text-sm focus:ring-blue-500"
                    >
                      <option value="">Sélectionnez un motif... | اختر السبب</option>
                      {motifs.map(m => (
                        <option key={m.id} value={m.id}>{m.libelleFr.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3 text-yellow-800">
                      <Star size={22} className={isVip ? "fill-yellow-500" : ""} />
                      <div className="flex flex-col">
                         <p className="text-[11px] font-bold uppercase tracking-tight leading-none">Priorité VIP</p>
                         <p className="font-arabic text-[10px] mt-1">أولوية خاصة</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={isVip}
                      onChange={(e) => setIsVip(e.target.checked)}
                      className="w-6 h-6 rounded text-yellow-600 border-yellow-300 focus:ring-yellow-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2 pl-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3. Notes (Optionnel)</label>
                       <label className="font-arabic text-[10px] text-gray-400">3. ملاحظات</label>
                    </div>
                    <textarea 
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border-gray-200 rounded-lg p-4 font-medium bg-gray-50 text-sm focus:ring-blue-500"
                      placeholder="Commentaires... | تعليقات"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button 
                  type="submit"
                  className="bg-slate-800 text-white px-10 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-3 shadow-lg"
                >
                  <ClipboardList size={18} />
                  Valider l'arrivée | تأكيد الوصول
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL AJOUT PROFESSIONNEL HARMONISÉE */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight flex items-center gap-4">
                 <span>Nouveau Profil</span>
                 <span className="text-gray-300 font-normal">|</span>
                 <span className="font-arabic text-base">ملف جديد</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition-all">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAndContinue} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="flex gap-4 p-1 bg-gray-100 rounded-xl max-w-sm mx-auto">
                <button type="button" onClick={() => setNewVisitor({...newVisitor, type: 'ADHERENT_NON_DECLARE'})} className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${newVisitor.type === 'ADHERENT_NON_DECLARE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Adhérent | منخرط</button>
                <button type="button" onClick={() => setNewVisitor({...newVisitor, type: 'EXTERNE'})} className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${newVisitor.type === 'EXTERNE' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>Externe | خارجي</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField label="Nom" labelAr="النسب" value={newVisitor.nom} onChange={v => setNewVisitor({...newVisitor, nom: v})} required />
                <FormField label="Prénom" labelAr="الاسم" value={newVisitor.prenom} onChange={v => setNewVisitor({...newVisitor, prenom: v})} required />
                <FormField label="CIN / Identifiant" labelAr="رقم البطاقة الوطنية" value={newVisitor.cin} onChange={v => setNewVisitor({...newVisitor, cin: v})} />
                <FormField label="Téléphone" labelAr="الهاتف" value={newVisitor.telephone} onChange={v => setNewVisitor({...newVisitor, telephone: v})} />
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sexe</label>
                     <label className="font-arabic text-[10px] text-gray-400">الجنس</label>
                  </div>
                  <select value={newVisitor.sexe} onChange={e => setNewVisitor({...newVisitor, sexe: e.target.value})} className="w-full border-gray-200 rounded-xl py-3 px-4 font-bold bg-gray-50 text-sm focus:ring-blue-500">
                    <option value="MONSIEUR">Monsieur | سيد</option>
                    <option value="MADAME">Madame | سيدة</option>
                    <option value="MADEMOISELLE">Mademoiselle | آنسة</option>
                  </select>
                </div>
                <SelectField label={newVisitor.type === 'EXTERNE' ? "Type Externe" : "Situation"} labelAr={newVisitor.type === 'EXTERNE' ? "نوع الزائر" : "الحالة"} value={newVisitor.situationFamiliale} options={refSituations} onChange={v => setNewVisitor({...newVisitor, situationFamiliale: v})} />
              </div>

              {newVisitor.type === 'ADHERENT_NON_DECLARE' && (
                <div className="pt-6 border-t border-gray-100 space-y-6 animate-in slide-in-from-top">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <SelectField label="Type Adhérent" labelAr="فئة المنخرط" value={newVisitor.typeAdherentDetail} options={refTypes} onChange={v => setNewVisitor({...newVisitor, typeAdherentDetail: v})} />
                    <SelectField label="Grade" labelAr="الرتبة" value={newVisitor.grade} options={refGrades} onChange={v => setNewVisitor({...newVisitor, grade: v})} />
                    <SelectField label="Affectation" labelAr="التعيين" value={newVisitor.affectation} options={refAffectations} onChange={v => setNewVisitor({...newVisitor, affectation: v})} />
                    <SelectField label="Assurance" labelAr="التأمين" value={newVisitor.typeAssurance} options={refAssurances} onChange={v => setNewVisitor({...newVisitor, typeAssurance: v})} />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 font-bold text-gray-400 text-xs uppercase tracking-widest">Annuler | إلغاء</button>
                <button type="submit" disabled={loading} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2">
                  {loading ? '...' : 'Valider | تأكيد'} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* COMPOSANTS HARMONISÉS */

const FormField: React.FC<{ label: string, labelAr: string, value?: string, onChange: (v: string) => void, required?: boolean }> = ({ label, labelAr, value, onChange, required }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center px-1">
       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
       <label className="font-arabic text-[10px] text-gray-400">{labelAr}</label>
    </div>
    <input required={required} type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full border-gray-200 rounded-xl py-3 px-4 font-bold bg-gray-50 text-sm focus:ring-blue-500 focus:bg-white transition-all" />
  </div>
);

const SelectField: React.FC<{ label: string, labelAr: string, value?: string, options: ReferenceItem[], onChange: (v: string) => void }> = ({ label, labelAr, value, options, onChange }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center px-1">
       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
       <label className="font-arabic text-[10px] text-gray-400">{labelAr}</label>
    </div>
    <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full border-gray-200 rounded-xl py-3 px-4 font-bold bg-gray-50 text-sm focus:ring-blue-500 focus:bg-white transition-all">
      {options.map(opt => <option key={opt.id} value={opt.valeur}>{opt.valeur.toUpperCase()}</option>)}
    </select>
  </div>
);

const StatCard: React.FC<{ title: string, titleAr: string, value: string, icon: React.ReactNode, color: string }> = ({ title, titleAr, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md`}>
    <div className={`${color} text-white p-4 rounded-lg shadow-md shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <div className="flex flex-col">
         <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-tight">{title}</span>
         <span className="font-arabic text-[9px] text-gray-300 leading-tight mb-1">{titleAr}</span>
      </div>
      <p className="text-lg font-bold text-gray-800 truncate uppercase leading-none">{value}</p>
    </div>
  </div>
);
