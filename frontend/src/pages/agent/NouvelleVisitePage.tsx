import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Star, 
  ClipboardList, 
  ArrowRight, 
  AlertCircle, 
  Search, 
  User, 
  ShieldCheck, 
  MapPin, 
  Briefcase,
  Phone,
  CreditCard,
  Heart,
  UserCheck,
  CheckCircle2,
  X,
  Clock,
  UserCog
} from 'lucide-react';
import { visiteurService, Visiteur as Visitor } from '../../services/visiteurService';
import { serviceService, Service, Motif } from '../../services/serviceService';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

interface SavedVisite {
  visiteurNom: string;
  serviceNom: string;
  motifLibelle: string;
  fonctionnaireNom: string;
  badgeCode: string;
}

export const NouvelleVisitePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [services, setServices] = useState<Service[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedMotifId, setSelectedMotifId] = useState<string>('');

  const [searchType, setSearchType] = useState('CIN');
  const [searchId, setSearchId] = useState('');
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);

  const [isVip, setIsVip] = useState(false);
  const [notes, setNotes] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [savedVisite, setSavedVisite] = useState<SavedVisite | null>(null);

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
    if (!searchId) {
      setError('Veuillez saisir un identifiant.');
      return;
    }
    setLoading(true); setError('');
    try {
      let v: Visitor | null = null;
      if (searchType === 'CIN') v = await visiteurService.rechercherParCin(searchId);
      else if (searchType === 'ADHESION') v = await visiteurService.rechercherParNumAdhesion(searchId);
      
      if (v) { 
        setFoundVisitor(v); 
        setStep(2); 
      } else {
        setError('Visiteur non trouvé dans la base de données.');
      }
    } catch (err: any) { 
      setError(err?.response?.data?.error || 'Erreur lors de la recherche du visiteur.'); 
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedMotifId || !foundVisitor) {
      setError('Veuillez sélectionner un service et un motif.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/visites/enregistrer', {
        visiteurId: foundVisitor.id,
        objetVisiteId: Number(selectedMotifId),
        notes, 
        isVip, 
        agentId: user?.id,
      });
      setSavedVisite(response.data);
      setShowModal(true);
    } catch (err: any) { 
      setError(err?.response?.data?.error || "Erreur lors de l'enregistrement de la visite."); 
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full pb-12">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => step === 1 ? navigate('/agent') : setStep(1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium group"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="text-[13px]">Retour {step === 2 && "à l'identification"}</span>
        </button>
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary' : 'bg-green-500'}`}></div>
            <div className={`w-20 h-1 rounded-full ${step === 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-[13px] font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
            <AlertCircle size={18} />
          </div>
          {error}
        </div>
      )}

      {step === 1 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all max-w-4xl mx-auto">
          <div className="p-8 border-b border-gray-50 flex flex-col items-center text-center bg-gray-50/30">
            <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm text-primary rounded-2xl flex items-center justify-center mb-4">
              <UserCheck size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Identification du Visiteur</h1>
            <p className="text-gray-500 text-[13px] mt-1 font-medium">Rechercher par CIN ou numéro d'adhésion pour commencer</p>
          </div>
          
          <div className="p-10">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-shrink-0 w-full md:w-48">
                <select 
                  value={searchType} 
                  onChange={e => setSearchType(e.target.value)} 
                  className="w-full appearance-none bg-gray-50 border-gray-200 rounded-xl py-4 pl-4 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-gray-700 text-[13px]"
                >
                  <option value="CIN">CIN</option>
                  <option value="ADHESION">N° Adhésion</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronLeft size={16} className="-rotate-90" />
                </div>
              </div>
              
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  value={searchId} 
                  onChange={e => setSearchId(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-[13px] uppercase" 
                  placeholder={searchType === 'CIN' ? "Ex: AB123456" : "Ex: 12345678"} 
                />
              </div>
            </div>
            
            <button 
              onClick={handleSearch} 
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-800 text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-blue-700/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Rechercher <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InfoCard 
              title="Type Adhérent" 
              value={foundVisitor?.typeAdherentDetail || 'N/A'} 
              icon={<User className="text-blue-600" size={20} />}
              colorClass="bg-blue-50 border-blue-100 text-blue-900"
            />
            <InfoCard 
              title="Grade / Echelle" 
              value={foundVisitor?.grade || 'N/A'} 
              icon={<Briefcase className="text-emerald-600" size={20} />}
              colorClass="bg-emerald-50 border-emerald-100 text-emerald-900"
            />
            <InfoCard 
              title="Affectation" 
              value={foundVisitor?.affectation || 'N/A'} 
              icon={<MapPin className="text-amber-600" size={20} />}
              colorClass="bg-amber-50 border-amber-100 text-amber-900"
            />
            <InfoCard 
              title="Assurance" 
              value={foundVisitor?.typeAssurance || 'N/A'} 
              icon={<ShieldCheck className="text-indigo-600" size={20} />}
              colorClass="bg-indigo-50 border-indigo-100 text-indigo-900"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-50 bg-gray-50/50 px-8 py-4">
              <h3 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <User size={16} /> Profil du Visiteur
              </h3>
            </div>
            <div className="p-8 flex flex-col md:flex-row gap-10">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center border-4 border-white shadow-inner flex-shrink-0 self-center md:self-start">
                <User size={48} className="text-gray-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 flex-1">
                <InfoRow label="Nom complet" value={`${foundVisitor?.nom} ${foundVisitor?.prenom}`} icon={<User size={16} />} />
                <InfoRow label="CIN / Identifiant" value={foundVisitor?.cin || 'N/A'} icon={<CreditCard size={16} />} />
                <InfoRow label="Téléphone" value={foundVisitor?.telephone || 'N/A'} icon={<Phone size={16} />} />
                <InfoRow label="Sexe" value={foundVisitor?.sexe || 'N/A'} icon={<User size={16} />} />
                <InfoRow label="Situation Familiale" value={foundVisitor?.situationFamiliale || 'N/A'} icon={<Heart size={16} />} />
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-50 bg-gray-50/50 px-8 py-5">
              <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <ClipboardList size={20} />
                </div>
                Détails de la visite
              </h3>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">Service sollicité</label>
                  <select 
                    value={selectedServiceId || ''} 
                    onChange={e => setSelectedServiceId(Number(e.target.value))} 
                    className="w-full bg-gray-50 border-gray-200 rounded-xl py-3.5 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-[13px] font-bold uppercase"
                  >
                    <option value="" className="normal-case">Sélectionner un service...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.nom.toUpperCase()}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">Motif de la visite</label>
                  <select 
                    value={selectedMotifId} 
                    onChange={e => setSelectedMotifId(e.target.value)} 
                    disabled={!selectedServiceId}
                    className="w-full bg-gray-50 border-gray-200 rounded-xl py-3.5 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 text-[13px] font-bold uppercase"
                  >
                    <option value="" className="normal-case">Sélectionner un motif...</option>
                    {motifs.map(m => <option key={m.id} value={m.id}>{m.libelleFr.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${isVip ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    id="vip-toggle"
                    checked={isVip} 
                    onChange={e => setIsVip(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <label htmlFor="vip-toggle" className="w-12 h-6 bg-gray-300 peer-checked:bg-amber-500 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-300">
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isVip ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </label>
                </div>
                <div className="flex-1">
                  <label htmlFor="vip-toggle" className={`text-[13px] font-bold cursor-pointer ${isVip ? 'text-amber-800' : 'text-gray-600'}`}>Priorité VIP / Cas Spécial</label>
                  <p className="text-[11px] text-gray-500 mt-0.5">Activer pour accorder une priorité immédiate à cette visite.</p>
                </div>
                <Star size={24} className={`${isVip ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-gray-300'}`} />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 ml-1">Notes ou observations (facultatif)</label>
                <textarea 
                  rows={4} 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-[13px]" 
                  placeholder="Informations complémentaires utiles..." 
                />
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-[15px] shadow-xl shadow-slate-200 transition-all active:scale-[0.99] flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Valider et Enregistrer la visite <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {showModal && savedVisite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-500 p-6 text-white text-center relative">
              <button 
                onClick={() => navigate('/agent')}
                className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold">Visite Enregistrée !</h2>
              <p className="text-emerald-50 opacity-90 mt-1">La visite a été créée avec succès</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <ModalRow label="Visiteur" value={savedVisite.visiteurNom} icon={<User size={18} />} />
                <ModalRow label="Service" value={savedVisite.serviceNom} icon={<ShieldCheck size={18} />} />
                <ModalRow label="Motif" value={savedVisite.motifLibelle} icon={<ClipboardList size={18} />} />
                <div className="pt-4 border-t border-gray-100">
                  <ModalRow 
                    label="Fonctionnaire affecté" 
                    value={savedVisite.fonctionnaireNom} 
                    icon={<UserCog size={18} />} 
                    highlight 
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-4 border border-blue-100 mt-6">
                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Statut</p>
                  <p className="text-sm font-medium text-blue-600">En attente de réception</p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/agent')}
                className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg transition-all mt-4"
              >
                Terminer et Retourner au Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalRow: React.FC<{ label: string; value: string; icon: React.ReactNode; highlight?: boolean }> = ({ label, value, icon, highlight }) => (
  <div className="flex items-start gap-4">
    <div className={`p-2 rounded-lg ${highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-[15px] font-extrabold uppercase mt-0.5 ${highlight ? 'text-emerald-700' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  </div>
);

interface InfoCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, colorClass }) => (
  <div className={`p-5 rounded-2xl border shadow-sm ${colorClass} transition-all hover:translate-y-[-2px] hover:shadow-md duration-300`}>
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm">
        {icon}
      </div>
      <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">{title}</p>
    </div>
    <p className="text-[15px] font-extrabold truncate uppercase" title={value}>{value}</p>
  </div>
);

interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
      {icon && <span className="opacity-50">{icon}</span>}
      {label}
    </span>
    <span className="font-extrabold text-gray-800 border-b border-gray-50 pb-2 text-[15px] uppercase">{value}</span>
  </div>
);
