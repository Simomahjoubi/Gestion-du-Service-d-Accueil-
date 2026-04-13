import React, { useState, useEffect, useRef } from 'react';
import { visiteurService, Visiteur } from '../../services/visiteurService';
import {
  Plus, Search, Pencil, Trash2, Upload, X, Check,
  Download, ChevronDown, UserSearch, Users, UserPlus, Save, SlidersHorizontal,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── Référentiels ────────────────────────────────────────────────────────────
const TYPES       = ['ADHERENT','CONJOINT','ENFANT','PARTENAIRE','MEDECIN','VIP','EXTERNE'];
const STATUTS     = ['ACTIF','RETRAITE','RADIE'];
const SEXES       = ['MONSIEUR','MADAME','MADEMOISELLE'];
const SITUATIONS  = ['CELIBATAIRE','MARIE','VEUF'];
const TYPE_DETAIL = ['Budget Général','Budget Communal','Protection Civile','DGST','Agent d\'autorité','Auxiliaire d\'autorité'];
const GRADES      = ['Echelle 6-9','Administrateur Adjoint','Administrateur 2ème grade','Caïd','Khalifa','Bacha','Gouverneur','Wali'];
const ASSURANCES  = ['MI','MI/FH2','Non assuré'];

const VILLES_MAROC = [
  'Rabat','Salé','Témara','Casablanca','Mohammedia','Berrechid','Settat','Médiouna',
  'Marrakech','Agadir','Inezgane','Aït Melloul','Tiznit','Taroudant','Ouarzazate','Zagora',
  'Fès','Meknès','Ifrane','Sefrou','Azrou','Khénifra',
  'Tanger','Tétouan','Chefchaouen','Al Hoceima','Larache','Ksar El Kebir','Asilah',
  'Oujda','Nador','Berkane','Taourirt','Guercif','Jerada',
  'Kénitra','Khémisset','Sidi Kacem','Sidi Slimane',
  'El Jadida','Safi','Essaouira','Azemmour',
  'Béni Mellal','Khouribga','Fquih Ben Salah','Azilal',
  'Guelmim','Tan Tan','Sidi Ifni','Assa',
  'Laâyoune','Boujdour','Smara',
  'Dakhla','Aousserd',
  'Errachidia','Midelt','Rich',
  'Taza','Taounate','Guercif',
].sort();

const IS_ADHERENT = (t: string) => t === 'ADHERENT';
const IS_FAMILY   = (t: string) => t === 'CONJOINT' || t === 'ENFANT';
const MAX_CONJOINT = 4;

// ─── Validation ──────────────────────────────────────────────────────────────
const CIN_PATTERN      = '^[A-Za-z]{1,2}[0-9]+$';
const NAME_PATTERN     = '^[A-Za-zÀ-ÿ\\s\\-\']+$';
const ADHESION_PATTERN = '^[0-9]+$';

const typeColor: Record<string,string> = {
  ADHERENT:'bg-blue-100 text-blue-700',  CONJOINT:'bg-purple-100 text-purple-700',
  ENFANT:'bg-pink-100 text-pink-700',    PARTENAIRE:'bg-amber-100 text-amber-700',
  MEDECIN:'bg-green-100 text-green-700', VIP:'bg-yellow-100 text-yellow-700',
  EXTERNE:'bg-gray-100 text-gray-600',
};
const statutColor: Record<string,string> = {
  ACTIF:   'bg-emerald-100 text-emerald-700',
  RETRAITE:'bg-orange-100 text-orange-600',
  RADIE:   'bg-red-100 text-red-600',
};
const assuranceColor = (val: string) => {
  if (val==='MI'||val==='MI/FH2') return 'bg-emerald-100 text-emerald-700';
  if (val==='Non assuré')         return 'bg-red-100 text-red-600';
  return 'bg-gray-100 text-gray-500';
};

const emptyForm = (): Visiteur => ({
  nom:'', prenom:'', cin:'', numAdhesion:'', telephone:'',
  sexe:'MONSIEUR', situationFamiliale:'CELIBATAIRE',
  type:'ADHERENT', statutAdherent:'ACTIF',
  typeAdherentDetail:'', grade:'', typeAssurance:'', affectation:'',
  parentId:undefined, lienParente:'',
});

interface NewMember { key:string; type:'CONJOINT'|'ENFANT'; nom:string; prenom:string; cin:string; sexe:string; telephone:string; }
const emptyMember = (t:'CONJOINT'|'ENFANT'): NewMember =>
  ({ key:Math.random().toString(36).slice(2), type:t, nom:'', prenom:'', cin:'', sexe:'MONSIEUR', telephone:'' });

interface Filters { query:string; type:string; statut:string; affectation:string; typeDetail:string; typeAssurance:string; }
const emptyFilters = (): Filters => ({ query:'', type:'', statut:'', affectation:'', typeDetail:'', typeAssurance:'' });

// ─── Utilitaires UI ──────────────────────────────────────────────────────────
const inputCls = "w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-400";
const filterSelectCls = "w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:border-blue-400 appearance-none";

const Field: React.FC<{label:string; required?:boolean; note?:string; children:React.ReactNode}> = ({label,required,note,children}) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      {note && <span className="ml-1 text-gray-300 text-[10px]">({note})</span>}
    </label>
    {children}
  </div>
);

const Sel: React.FC<{value:string; onChange:(v:string)=>void; options:string[]; required?:boolean; placeholder?:string; cls?:string}> =
  ({value,onChange,options,required,placeholder,cls}) => (
  <div className="relative">
    <select required={required} value={value} onChange={e=>onChange(e.target.value)} className={(cls||inputCls)+" appearance-none"}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
  </div>
);

// ─── Composant principal ─────────────────────────────────────────────────────
export const AdherentManagement: React.FC = () => {
  const [visiteurs, setVisiteurs]       = useState<Visiteur[]>([]);
  const [filters, setFilters]           = useState<Filters>(emptyFilters());
  const [loading, setLoading]           = useState(false);
  const [showFilters, setShowFilters]   = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState<Visiteur|null>(null);
  const [form, setForm]                 = useState<Visiteur>(emptyForm());
  const [newFamily, setNewFamily]       = useState<NewMember[]>([]);
  const [importResult, setImportResult] = useState<{importes:number;ignores:number}|null>(null);
  const [parentError, setParentError]   = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [editMemberId, setEditMemberId] = useState<number|null>(null);
  const [memberForm, setMemberForm]     = useState<Visiteur|null>(null);
  const [parentCinSearch, setParentCinSearch]     = useState('');
  const [parentFound, setParentFound]             = useState<Visiteur|null>(null);
  const [parentSearchError, setParentSearchError] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { load(); }, []);

  const load = async (f?: Filters) => {
    setLoading(true);
    const active = f || filters;
    try {
      setVisiteurs(await visiteurService.getAll({
        query:         active.query         || undefined,
        type:          active.type          || undefined,
        statut:        active.statut        || undefined,
        affectation:   active.affectation   || undefined,
        typeDetail:    active.typeDetail    || undefined,
        typeAssurance: active.typeAssurance || undefined,
      }));
    } finally { setLoading(false); }
  };

  const handleSearch = (e:React.FormEvent) => { e.preventDefault(); load(); };
  const resetFilters = () => { const f=emptyFilters(); setFilters(f); load(f); };
  const activeFilterCount = Object.values(filters).filter(v=>v!=='').length;

  // ── Formulaire principal ──────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm()); setEditTarget(null); setNewFamily([]);
    resetParentSearch(); setEditMemberId(null); setMemberForm(null);
    setParentError(''); setDuplicateError(''); setShowForm(true);
  };
  const openEdit = (v:Visiteur) => {
    setForm({...v}); setEditTarget(v); setNewFamily([]);
    resetParentSearch(); setEditMemberId(null); setMemberForm(null); setParentError(''); setDuplicateError('');
    if (IS_FAMILY(v.type) && v.parentId) {
      const par=visiteurs.find(x=>x.id===v.parentId);
      if (par) { setParentFound(par); setParentCinSearch(par.cin||''); }
    }
    setShowForm(true);
  };
  const resetParentSearch = () => { setParentCinSearch(''); setParentFound(null); setParentSearchError(''); };
  const handleTypeChange = (t:string) => {
    setForm(prev=>({...prev,type:t}));
    if (!IS_FAMILY(t)) { resetParentSearch(); setParentError(''); }
    if (!IS_ADHERENT(t)) setNewFamily([]);
  };
  const searchParent = async () => {
    if (!parentCinSearch.trim()) return;
    setParentSearchError(''); setParentFound(null);
    try {
      const found = await visiteurService.rechercherParCin(parentCinSearch.trim());
      if (found?.type==='ADHERENT') {
        setParentFound(found); setForm(prev=>({...prev,parentId:found.id})); setParentError('');
      } else setParentSearchError('Aucun adhérent principal trouvé avec ce CIN.');
    } catch { setParentSearchError('Aucun adhérent principal trouvé avec ce CIN.'); }
  };

  // ── Famille ──────────────────────────────────────────────────────────────────
  const existingFamily = editTarget?.id ? visiteurs.filter(v=>v.parentId===editTarget.id) : [];
  const conjointCount  = existingFamily.filter(v=>v.type==='CONJOINT').length + newFamily.filter(m=>m.type==='CONJOINT').length;
  const canAddConjoint = conjointCount < MAX_CONJOINT;
  const addConjoint = () => { if (canAddConjoint) setNewFamily(prev=>[emptyMember('CONJOINT'),...prev]); };
  const addEnfant   = () => setNewFamily(prev=>[...prev, emptyMember('ENFANT')]);
  const removeNew   = (key:string) => setNewFamily(prev=>prev.filter(m=>m.key!==key));
  const updateNew   = (key:string, field:keyof NewMember, val:string) =>
    setNewFamily(prev=>prev.map(m=>m.key===key?{...m,[field]:val}:m));

  const startEditMember  = (v:Visiteur) => { setEditMemberId(v.id!); setMemberForm({...v}); };
  const cancelEditMember = () => { setEditMemberId(null); setMemberForm(null); };
  const mf = (key:keyof Visiteur, val:string) => setMemberForm(prev=>prev?{...prev,[key]:val}:prev);
  const saveMember = async () => {
    if (!memberForm?.id) return;
    await visiteurService.update(memberForm.id, memberForm);
    setEditMemberId(null); setMemberForm(null);
    await load();
    if (editTarget?.id) {
      const refreshed=(await visiteurService.getAll()).find(v=>v.id===editTarget.id);
      if (refreshed) { setEditTarget(refreshed); setForm({...refreshed}); }
    }
  };
  const deleteMember = async (v:Visiteur) => {
    if (!v.id||!window.confirm(`Supprimer ${v.nom} ${v.prenom} ?`)) return;
    await visiteurService.delete(v.id); load();
  };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    setDuplicateError('');
    if (IS_FAMILY(form.type) && !parentFound && !form.parentId) {
      setParentError('L\'adhérent principal est obligatoire pour un conjoint ou un enfant.');
      return;
    }
    const payload:Visiteur = {...form};
    if (IS_FAMILY(form.type) && parentFound?.id) payload.parentId=parentFound.id;
    if (!IS_FAMILY(form.type)) payload.parentId=undefined;
    try {
      let saved:Visiteur;
      if (editTarget?.id) saved=await visiteurService.update(editTarget.id,payload);
      else                saved=await visiteurService.create(payload);
      if (IS_ADHERENT(form.type)&&newFamily.length>0&&saved.id) {
        for (const m of newFamily) {
          if (!m.nom||!m.prenom) continue;
          await visiteurService.create({nom:m.nom,prenom:m.prenom,cin:m.cin||undefined,sexe:m.sexe,telephone:m.telephone||undefined,type:m.type,parentId:saved.id});
        }
      }
      setShowForm(false); load();
    } catch (err: unknown) {
      const axiosErr = err as {response?:{status?:number;data?:{error?:string}}};
      if (axiosErr?.response?.status===409) {
        setDuplicateError(axiosErr.response.data?.error || 'CIN ou numéro d\'adhésion déjà existant.');
      } else {
        setDuplicateError('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  };

  const handleDelete = async (v:Visiteur) => {
    if (!v.id||!window.confirm(`Supprimer ${v.nom} ${v.prenom} ?`)) return;
    await visiteurService.delete(v.id); load();
  };

  // ── Import XLS ───────────────────────────────────────────────────────────────
  const handleFileImport = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; if (!file) return;
    const wb=XLSX.read(await file.arrayBuffer());
    const rows=XLSX.utils.sheet_to_json<Record<string,string>>(wb.Sheets[wb.SheetNames[0]]);
    const dataRows=rows.filter(r=>{ const n=(r['nom']||'').toString().trim(); return n!==''&&!n.startsWith('*'); });
    const payload=dataRows.map(r=>({
      nom:               (r['nom']||'').toString().trim(),
      prenom:            (r['prenom']||'').toString().trim(),
      cin:               (r['cin']||'').toString().trim()||undefined,
      numAdhesion:       (r['numAdhesion']||'').toString().trim()||undefined,
      telephone:         (r['telephone']||'').toString().trim()||undefined,
      sexe:              ((r['sexe']||'MONSIEUR').toString().trim()).toUpperCase(),
      situationFamiliale:((r['situationFamiliale']||'').toString().trim()).toUpperCase()||undefined,
      type:              ((r['type']||'ADHERENT').toString().trim()).toUpperCase(),
      statutAdherent:    ((r['statutAdherent']||'').toString().trim()).toUpperCase()||undefined,
      affectation:       (r['affectation']||'').toString().trim()||undefined,
      grade:             (r['grade']||'').toString().trim()||undefined,
      typeAdherentDetail:(r['typeAdherentDetail']||'').toString().trim()||undefined,
      typeAssurance:     (r['typeAssurance']||'').toString().trim()||undefined,
      parentCin:         (r['parentCin']||'').toString().trim()||undefined,
    }));
    const result=await visiteurService.importBulk(payload as Parameters<typeof visiteurService.importBulk>[0]);
    setImportResult(result); load(); e.target.value='';
  };

  const downloadTemplate = () => {
    const headers=['nom','prenom','cin','sexe','situationFamiliale','telephone','type','numAdhesion','statutAdherent','typeAdherentDetail','grade','typeAssurance','affectation','parentCin'];
    const notes=['* Lettres uniquement','* Lettres uniquement','1-2 lettres+chiffres ex:AB123456 (facultatif ENFANT)','MONSIEUR|MADAME|MADEMOISELLE','CELIBATAIRE|MARIE|VEUF (si ADHERENT)','Optionnel','ADHERENT|CONJOINT|ENFANT|…','* Chiffres seuls (si ADHERENT)','* si ADHERENT: ACTIF|RETRAITE|RADIE','* si ADHERENT: Budget Général|Budget Communal|Protection Civile|DGST|Agent d\'autorité|Auxiliaire d\'autorité','* si ADHERENT: Echelle 6-9|Admin. Adjoint|…','* si ADHERENT: MI|MI/FH2|Non assuré','* si ADHERENT: ville du Maroc','* CIN adhérent principal (CONJOINT/ENFANT)'];
    const ex1=['Ben Ali','Mohamed','AB123456','MONSIEUR','MARIE','0600000000','ADHERENT','1001','ACTIF','Budget Général','Echelle 6-9','MI/FH2','Rabat',''];
    const ex2=['Ben Ali','Fatima','CD789012','MADAME','','0611111111','CONJOINT','','','','','','','AB123456'];
    const ex3=['Ben Ali','Yassine','','MONSIEUR','','','ENFANT','','','','','','','AB123456'];
    const ws=XLSX.utils.aoa_to_sheet([headers,notes,ex1,ex2,ex3]);
    ws['!cols']=headers.map(()=>({wch:26}));
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Adherents');
    XLSX.writeFile(wb,'template_adherents.xlsx');
  };

  const f=(key:keyof Visiteur,val:string)=>setForm(prev=>({...prev,[key]:val}));
  const isAdherent=IS_ADHERENT(form.type);
  const isFamily=IS_FAMILY(form.type);
  const showFamily=isAdherent&&form.situationFamiliale==='MARIE';

  return (
    <div className="space-y-5">

      {/* ── Barre recherche + filtres ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
              placeholder="Nom, prénom ou CIN…"
              value={filters.query} onChange={e=>setFilters(prev=>({...prev,query:e.target.value}))}/>
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Chercher</button>
          <button type="button" onClick={()=>setShowFilters(v=>!v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-bold border transition-all ${showFilters||activeFilterCount>0?'bg-indigo-50 border-indigo-300 text-indigo-700':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <SlidersHorizontal size={15}/>
            Filtres {activeFilterCount>0&&<span className="bg-indigo-600 text-white text-[10px] rounded-full px-1.5 py-0.5 ml-0.5">{activeFilterCount}</span>}
          </button>
          {activeFilterCount>0&&<button type="button" onClick={resetFilters} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-gray-50 flex items-center gap-1"><X size={13}/>Réinitialiser</button>}
          <div className="flex gap-2 ml-auto">
            <button type="button" onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><Download size={15}/> Modèle</button>
            <button type="button" onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2.5 border border-green-300 bg-green-50 rounded-lg text-sm text-green-700 font-bold hover:bg-green-100"><Upload size={15}/> Import XLS</button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileImport}/>
            <button type="button" onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"><Plus size={15}/> Ajouter</button>
          </div>
        </form>

        {/* Panneau filtres */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Type</p>
              <Sel value={filters.type} onChange={v=>{const f={...filters,type:v};setFilters(f);load(f);}} options={TYPES} placeholder="Tous" cls={filterSelectCls}/>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Statut</p>
              <Sel value={filters.statut} onChange={v=>{const f={...filters,statut:v};setFilters(f);load(f);}} options={STATUTS} placeholder="Tous" cls={filterSelectCls}/>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Type adhérent détail</p>
              <Sel value={filters.typeDetail} onChange={v=>{const f={...filters,typeDetail:v};setFilters(f);load(f);}} options={TYPE_DETAIL} placeholder="Tous" cls={filterSelectCls}/>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Type assurance</p>
              <Sel value={filters.typeAssurance} onChange={v=>{const f={...filters,typeAssurance:v};setFilters(f);load(f);}} options={ASSURANCES} placeholder="Tous" cls={filterSelectCls}/>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Affectation</p>
              <Sel value={filters.affectation} onChange={v=>{const f={...filters,affectation:v};setFilters(f);load(f);}} options={VILLES_MAROC} placeholder="Toutes les villes" cls={filterSelectCls}/>
            </div>
          </div>
        )}
      </div>

      {importResult&&(
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <span className="text-green-700 font-semibold">Import terminé — <strong>{importResult.importes}</strong> importés, <strong>{importResult.ignores}</strong> ignorés</span>
          <button onClick={()=>setImportResult(null)}><X size={16} className="text-green-500"/></button>
        </div>
      )}

      {/* ── Tableau ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Adhérents &amp; Visiteurs <span className="ml-2 text-sm font-normal text-gray-400">({visiteurs.length} entrées)</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Civilité / Nom</th>
                <th className="px-4 py-3">CIN</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Type détail</th>
                <th className="px-4 py-3">Assurance</th>
                <th className="px-4 py-3">Adhérent principal</th>
                <th className="px-4 py-3">Affectation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading&&<tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">Chargement…</td></tr>}
              {!loading&&visiteurs.length===0&&<tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400 italic">Aucun résultat.</td></tr>}
              {!loading&&visiteurs.map(v=>{
                const parent=v.parentId?visiteurs.find(x=>x.id===v.parentId):null;
                return (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      {v.parentId&&<span className="text-gray-300 text-xs mr-1">↳</span>}
                      <span className="font-semibold text-gray-900">{v.nom} {v.prenom}</span>
                      {v.sexe&&<span className="ml-1.5 text-[10px] text-gray-400">{v.sexe==='MONSIEUR'?'M.':v.sexe==='MADAME'?'Mme':'Mlle'}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 text-xs">{v.cin||'—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor[v.type]||'bg-gray-100 text-gray-600'}`}>{v.type}</span></td>
                    <td className="px-4 py-3">
                      {IS_ADHERENT(v.type)&&v.statutAdherent
                        ?<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statutColor[v.statutAdherent]||''}`}>{v.statutAdherent}</span>
                        :<span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[130px] truncate">
                      {IS_ADHERENT(v.type)&&v.typeAdherentDetail?v.typeAdherentDetail:<span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {IS_ADHERENT(v.type)&&v.typeAssurance
                        ?<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${assuranceColor(v.typeAssurance)}`}>{v.typeAssurance}</span>
                        :<span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {IS_FAMILY(v.type)&&parent
                        ?<div><p className="text-xs font-semibold text-gray-700">{parent.nom} {parent.prenom}</p>
                          <p className="text-[10px] text-gray-400 font-mono">PID:{parent.id}{v.lienParente?` · ${v.lienParente}`:''}</p></div>
                        :<span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[100px]">{v.affectation||'—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={()=>openEdit(v)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={14}/></button>
                        <button onClick={()=>handleDelete(v)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal formulaire ─────────────────────────────────────────────────── */}
      {showForm&&(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-800 text-lg">{editTarget?'Modifier':'Ajouter un visiteur'}</h3>
              <button type="button" onClick={()=>setShowForm(false)}><X size={20} className="text-gray-400"/></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">

              {/* Bannière erreur doublon */}
              {duplicateError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="p-1.5 bg-red-100 rounded-lg shrink-0"><X size={14} className="text-red-600"/></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-700">Doublon détecté</p>
                    <p className="text-xs text-red-600 mt-0.5">{duplicateError}</p>
                  </div>
                  <button type="button" onClick={()=>setDuplicateError('')}><X size={14} className="text-red-400"/></button>
                </div>
              )}

              {/* Civilité */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Civilité <span className="text-red-400">*</span></p>
                <div className="flex gap-2">
                  {SEXES.map(s=>(
                    <button key={s} type="button" onClick={()=>f('sexe',s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${form.sexe===s?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                      {s==='MONSIEUR'?'M.':s==='MADAME'?'Mme':'Mlle'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Identité */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Identité</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nom" required note="lettres uniquement">
                    <input required pattern={NAME_PATTERN} title="Lettres uniquement" className={inputCls} value={form.nom} onChange={e=>f('nom',e.target.value)}/>
                  </Field>
                  <Field label="Prénom" required note="lettres uniquement">
                    <input required pattern={NAME_PATTERN} title="Lettres uniquement" className={inputCls} value={form.prenom} onChange={e=>f('prenom',e.target.value)}/>
                  </Field>
                  <Field label="CIN" required={form.type!=='ENFANT'} note={form.type==='ENFANT'?'facultatif':'ex: AB123456'}>
                    <input required={form.type!=='ENFANT'} pattern={CIN_PATTERN} title="1-2 lettres puis chiffres"
                      className={inputCls+' font-mono'} value={form.cin||''} onChange={e=>f('cin',e.target.value.toUpperCase())}/>
                  </Field>
                  <Field label="Téléphone">
                    <input className={inputCls} value={form.telephone||''} onChange={e=>f('telephone',e.target.value)}/>
                  </Field>
                </div>
              </div>

              {/* Classification */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Classification</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type" required><Sel required value={form.type} onChange={handleTypeChange} options={TYPES}/></Field>
                  {isAdherent&&<Field label="Situation familiale"><Sel value={form.situationFamiliale||''} onChange={v=>f('situationFamiliale',v)} options={SITUATIONS}/></Field>}
                  {isAdherent&&(
                    <Field label="N° Adhésion" required note="chiffres uniquement">
                      <input required pattern={ADHESION_PATTERN} title="Chiffres uniquement" className={inputCls} value={form.numAdhesion||''} onChange={e=>f('numAdhesion',e.target.value)}/>
                    </Field>
                  )}
                  {isAdherent&&<Field label="Statut" required><Sel required value={form.statutAdherent||''} onChange={v=>f('statutAdherent',v)} options={STATUTS} placeholder="— Choisir —"/></Field>}
                  {isFamily&&(
                    <Field label="Lien de parenté">
                      <input className={inputCls} placeholder="Ex: CONJOINT, ENFANT_1…" value={form.lienParente||''} onChange={e=>f('lienParente',e.target.value)}/>
                    </Field>
                  )}
                </div>
              </div>

              {/* Infos admin */}
              {isAdherent&&(
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Informations administratives</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Type adhérent détail" required><Sel required value={form.typeAdherentDetail||''} onChange={v=>f('typeAdherentDetail',v)} options={TYPE_DETAIL} placeholder="— Choisir —"/></Field>
                    <Field label="Grade" required><Sel required value={form.grade||''} onChange={v=>f('grade',v)} options={GRADES} placeholder="— Choisir —"/></Field>
                    <Field label="Type assurance" required><Sel required value={form.typeAssurance||''} onChange={v=>f('typeAssurance',v)} options={ASSURANCES} placeholder="— Choisir —"/></Field>
                    <Field label="Affectation" required>
                      <Sel required value={form.affectation||''} onChange={v=>f('affectation',v)} options={VILLES_MAROC} placeholder="— Choisir une ville —"/>
                    </Field>
                  </div>
                </div>
              )}

              {/* Parent — CONJOINT/ENFANT */}
              {isFamily&&(
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Adhérent principal (PID) <span className="text-red-400">*</span>
                  </p>
                  {parentError&&<p className="text-xs text-red-500 mb-2 flex items-center gap-1"><X size={12}/>{parentError}</p>}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input className={inputCls+' flex-1 font-mono'} placeholder="CIN de l'adhérent principal…"
                        value={parentCinSearch}
                        onChange={e=>{setParentCinSearch(e.target.value.toUpperCase());setParentFound(null);setParentSearchError('');setParentError('');}}
                        onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();searchParent();}}}/>
                      <button type="button" onClick={searchParent}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-bold hover:bg-gray-800">
                        <UserSearch size={15}/> Rechercher
                      </button>
                    </div>
                    {parentFound&&(
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <p className="text-xs font-bold text-blue-800">{parentFound.nom} {parentFound.prenom}</p>
                          <p className="text-[10px] text-blue-500 font-mono mt-0.5">CIN: {parentFound.cin} — PID: {parentFound.id}</p>
                        </div>
                        <Check size={16} className="text-blue-500"/>
                      </div>
                    )}
                    {parentSearchError&&<p className="text-xs text-red-500 flex items-center gap-1"><X size={12}/>{parentSearchError}</p>}
                    {!parentFound&&!parentSearchError&&<p className="text-[10px] text-gray-400">Obligatoire — recherchez l'adhérent principal par son CIN.</p>}
                  </div>
                </div>
              )}

              {/* ── Section Famille ─── */}
              {showFamily&&(
                <div className="border border-indigo-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-indigo-500"/>
                      <p className="text-xs font-bold text-indigo-700 uppercase">Famille</p>
                      <span className="text-[10px] text-indigo-400">({existingFamily.length+newFamily.length} membre{existingFamily.length+newFamily.length!==1?'s':''})</span>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={addConjoint} disabled={!canAddConjoint}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${canAddConjoint?'bg-purple-100 text-purple-700 hover:bg-purple-200':'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        title={!canAddConjoint?`Maximum ${MAX_CONJOINT} conjoints`:''}>
                        <UserPlus size={13}/> Conjoint {conjointCount>0&&`(${conjointCount}/${MAX_CONJOINT})`}
                      </button>
                      <button type="button" onClick={addEnfant}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-xs font-bold hover:bg-pink-200">
                        <UserPlus size={13}/> Enfant
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {existingFamily.length===0&&newFamily.length===0&&(
                      <p className="text-xs text-gray-400 text-center italic py-2">Ajoutez conjoint(s) ou enfants ci-dessus.</p>
                    )}

                    {existingFamily.map(v=>(
                      <div key={v.id}>
                        {editMemberId===v.id&&memberForm?(
                          <div className="p-3 bg-white rounded-xl border-2 border-indigo-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor[v.type]}`}>{v.type}</span>
                              <button type="button" onClick={cancelEditMember} className="p-1 text-gray-400 hover:text-gray-600"><X size={14}/></button>
                            </div>
                            <div className="flex gap-2">
                              {SEXES.map(s=>(
                                <button key={s} type="button" onClick={()=>mf('sexe',s)}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${memberForm.sexe===s?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                                  {s==='MONSIEUR'?'M.':s==='MADAME'?'Mme':'Mlle'}
                                </button>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><p className="text-[10px] text-gray-400 mb-1">Nom <span className="text-red-400">*</span></p>
                                <input required pattern={NAME_PATTERN} className={inputCls} value={memberForm.nom} onChange={e=>mf('nom',e.target.value)}/></div>
                              <div><p className="text-[10px] text-gray-400 mb-1">Prénom <span className="text-red-400">*</span></p>
                                <input required pattern={NAME_PATTERN} className={inputCls} value={memberForm.prenom} onChange={e=>mf('prenom',e.target.value)}/></div>
                              <div><p className="text-[10px] text-gray-400 mb-1">CIN {v.type!=='ENFANT'&&<span className="text-red-400">*</span>}</p>
                                <input required={v.type!=='ENFANT'} pattern={CIN_PATTERN} className={inputCls+' font-mono'} value={memberForm.cin||''} onChange={e=>mf('cin',e.target.value.toUpperCase())}/></div>
                              <div><p className="text-[10px] text-gray-400 mb-1">Téléphone</p>
                                <input className={inputCls} value={memberForm.telephone||''} onChange={e=>mf('telephone',e.target.value)}/></div>
                              <div className="col-span-2"><p className="text-[10px] text-gray-400 mb-1">Lien de parenté</p>
                                <input className={inputCls} placeholder="Ex: ENFANT_1…" value={memberForm.lienParente||''} onChange={e=>mf('lienParente',e.target.value)}/></div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button type="button" onClick={cancelEditMember} className="flex-1 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
                              <button type="button" onClick={saveMember} className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-1">
                                <Save size={13}/> Sauvegarder
                              </button>
                            </div>
                          </div>
                        ):(
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor[v.type]}`}>{v.type}</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">{v.sexe==='MONSIEUR'?'M.':v.sexe==='MADAME'?'Mme':'Mlle'} {v.nom} {v.prenom}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{v.cin||'—'}{v.lienParente?` · ${v.lienParente}`:''}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button type="button" onClick={()=>startEditMember(v)} className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={13}/></button>
                              <button type="button" onClick={()=>deleteMember(v)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {newFamily.map(m=>(
                      <div key={m.key} className="p-3 bg-white rounded-lg border border-dashed border-indigo-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor[m.type]}`}>{m.type}</span>
                            <span className="text-[10px] text-gray-400 italic">nouveau</span>
                          </div>
                          <button type="button" onClick={()=>removeNew(m.key)} className="p-1 text-gray-400 hover:text-red-500"><X size={14}/></button>
                        </div>
                        <div className="flex gap-2">
                          {SEXES.map(s=>(
                            <button key={s} type="button" onClick={()=>updateNew(m.key,'sexe',s)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${m.sexe===s?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                              {s==='MONSIEUR'?'M.':s==='MADAME'?'Mme':'Mlle'}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><p className="text-[10px] text-gray-400 mb-1">Nom <span className="text-red-400">*</span></p>
                            <input required pattern={NAME_PATTERN} className={inputCls} value={m.nom} onChange={e=>updateNew(m.key,'nom',e.target.value)}/></div>
                          <div><p className="text-[10px] text-gray-400 mb-1">Prénom <span className="text-red-400">*</span></p>
                            <input required pattern={NAME_PATTERN} className={inputCls} value={m.prenom} onChange={e=>updateNew(m.key,'prenom',e.target.value)}/></div>
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">CIN {m.type!=='ENFANT'?<span className="text-red-400">*</span>:<span className="text-gray-300">(facultatif)</span>}</p>
                            <input required={m.type!=='ENFANT'} pattern={CIN_PATTERN} title="1-2 lettres puis chiffres"
                              className={inputCls+' font-mono'} value={m.cin} onChange={e=>updateNew(m.key,'cin',e.target.value.toUpperCase())}/>
                          </div>
                          <div><p className="text-[10px] text-gray-400 mb-1">Téléphone</p>
                            <input className={inputCls} value={m.telephone} onChange={e=>updateNew(m.key,'telephone',e.target.value)}/></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
              <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-2.5 font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">Annuler</button>
              <button type="submit" className="flex-1 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Check size={16}/> {editTarget?'Enregistrer':'Créer'}
                {newFamily.length>0&&<span className="text-xs opacity-80">+ {newFamily.length} membre{newFamily.length>1?'s':''}</span>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
