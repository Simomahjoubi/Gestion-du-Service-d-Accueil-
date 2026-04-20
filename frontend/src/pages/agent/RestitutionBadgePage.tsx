import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Key, Search, RefreshCw, CheckCircle2, Clock,
  LogOut, User, BadgeCheck,
  BadgeX, Layers, Unlock, ChevronLeft
} from 'lucide-react';
import { badgeService, BadgeDetail, ServiceBadgeStat } from '../../services/badgeService';

function fmtDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export const RestitutionBadgePage: React.FC = () => {
  const navigate = useNavigate();
  const [badges, setBadges]     = useState<BadgeDetail[]>([]);
  const [stats, setStats]       = useState<ServiceBadgeStat[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterSvc, setFilterSvc] = useState<number | null>(null);
  const [filterStat, setFilterStat] = useState<'ALL' | 'PRET_A_RESTITUER' | 'OCCUPE' | 'DISPONIBLE'>('ALL');
  const [confirm, setConfirm]   = useState<BadgeDetail | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([badgeService.getAll(), badgeService.getStats()]);
      setBadges(b);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleRestituer = async () => {
    if (!confirm) return;
    setConfirming(true);
    try {
      await badgeService.liberer(confirm.id);
      setToast(`Badge ${confirm.code} libéré avec succès.`);
      setConfirm(null);
      load();
    } catch {
      setToast('Erreur lors de la restitution.');
    } finally {
      setConfirming(false);
    }
  };

  const filtered = badges.filter(b => {
    if (filterSvc != null && b.serviceId !== filterSvc) return false;
    if (filterStat !== 'ALL' && b.statut !== filterStat) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.code.toLowerCase().includes(q) &&
          !(b.visiteurNom ?? '').toLowerCase().includes(q) &&
          !(b.serviceNom ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const statsCounts = {
    total: badges.length,
    libres: badges.filter(b => b.statut === 'DISPONIBLE').length,
    occupes: badges.filter(b => b.statut === 'OCCUPE').length,
    prets: badges.filter(b => b.statut === 'PRET_A_RESTITUER').length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-8 right-8 z-50 bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 uppercase tracking-widest">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <button onClick={() => navigate('/agent')} className="flex items-center gap-2 text-gray-500 hover:text-blue-700 font-bold transition-all">
          <ChevronLeft size={20} />
          <span className="text-[13px] uppercase tracking-widest text-center flex flex-col items-start leading-none">
             <span>Retour au Dashboard</span>
             <span className="font-arabic text-[10px] mt-1">العودة إلى لوحة القيادة</span>
          </span>
        </button>
        <div className="flex items-center gap-4">
          <button onClick={load} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight flex justify-between items-center w-full">
           <span>Restitution des Badges</span>
           <span className="font-arabic text-xl">إرجاع الشارات</span>
        </h1>
        <p className="text-gray-400 text-sm font-medium tracking-wide">Gestion des flux de sortie et libération des accès | تسيير خروج الزوار</p>
      </div>

      {/* ── Stats Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <HeaderStat label="Total Badges" labelAr="إجمالي الشارات" value={statsCounts.total} icon={<Layers size={20}/>} color="bg-slate-800" />
        <HeaderStat label="Badges Libres" labelAr="شارات فارغة" value={statsCounts.libres} icon={<BadgeCheck size={20}/>} color="bg-emerald-600" />
        <HeaderStat label="En Visite" labelAr="في زيارة" value={statsCounts.occupes} icon={<BadgeX size={20}/>} color="bg-rose-600" />
        <HeaderStat label="Prêts à Sortir" labelAr="جاهز للخروج" value={statsCounts.prets} icon={<Unlock size={20}/>} color="bg-blue-600" pulse={statsCounts.prets > 0} />
      </div>

      {/* ── Toolbar ── */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher... | بحث عن شارة أو زائر"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <FilterBtn active={filterStat === 'ALL'} onClick={() => setFilterStat('ALL')}>Tous | الكل</FilterBtn>
            <FilterBtn active={filterStat === 'DISPONIBLE'} onClick={() => setFilterStat('DISPONIBLE')}>Libres</FilterBtn>
            <FilterBtn active={filterStat === 'OCCUPE'} onClick={() => setFilterStat('OCCUPE')}>Occupés</FilterBtn>
            <FilterBtn active={filterStat === 'PRET_A_RESTITUER'} onClick={() => setFilterStat('PRET_A_RESTITUER')}>Prêts</FilterBtn>
          </div>
        </div>

        {/* Service Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
          <button 
            onClick={() => setFilterSvc(null)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterSvc === null ? 'bg-slate-800 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          >
            Tous Services | المصالح
          </button>
          {stats.map((s) => (
            <button
              key={s.serviceId}
              onClick={() => setFilterSvc(filterSvc === s.serviceId ? null : s.serviceId)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${filterSvc === s.serviceId ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              {s.serviceNom}
            </button>
          ))}
        </div>
      </section>

      {/* ── Badges Grid ── */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw size={40} className="animate-spin text-blue-600 mx-auto opacity-20" />
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Mise à jour... | تحديث</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
          <Key size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aucun badge trouvé | لا توجد نتائج</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map(b => (
            <div 
              key={b.id} 
              className={`bg-white rounded-2xl border-2 transition-all group overflow-hidden ${
                b.statut === 'DISPONIBLE' ? 'border-gray-100 opacity-60' :
                b.statut === 'PRET_A_RESTITUER' ? 'border-emerald-500 shadow-xl shadow-emerald-100 ring-4 ring-emerald-50' :
                'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Header de carte */}
              <div className={`p-4 flex items-center justify-between border-b ${b.statut === 'PRET_A_RESTITUER' ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${b.statut === 'DISPONIBLE' ? 'bg-white text-gray-400' : 'bg-slate-900 text-white'}`}>
                    {b.code}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">Service | مصلحة</p>
                    <p className="text-[11px] font-bold text-gray-800 uppercase truncate max-w-[100px]">{b.serviceNom || 'Global'}</p>
                  </div>
                </div>
                {b.statut === 'PRET_A_RESTITUER' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
              </div>

              {/* Corps de carte */}
              <div className="p-5 space-y-4">
                {b.statut === 'DISPONIBLE' ? (
                  <div className="py-2 text-center flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disponible</span>
                    <span className="font-arabic text-[9px] text-gray-300">شارة فارغة</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><User size={14}/></div>
                        <p className="text-xs font-bold text-slate-700 truncate">{b.visiteurNom || 'Inconnu'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Clock size={14}/></div>
                        <p className="text-[11px] font-bold text-slate-500">{fmtDate(b.dateOccupation)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setConfirm(b)}
                      disabled={b.statut !== 'PRET_A_RESTITUER'}
                      className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-0.5 ${
                        b.statut === 'PRET_A_RESTITUER'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-2"><LogOut size={14} /> {b.statut === 'PRET_A_RESTITUER' ? 'Restituer' : 'En visite'}</span>
                      <span className="font-arabic text-[9px] font-normal opacity-80">{b.statut === 'PRET_A_RESTITUER' ? 'إرجاع الشارة' : 'قيد الزيارة'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center gap-5 bg-emerald-50 text-left">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Unlock size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">Restitution du Badge</h3>
                <h3 className="font-arabic text-lg text-emerald-700 leading-none mt-1">إرجاع الشارة</h3>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visiteur</span>
                       <span className="font-arabic text-[9px] text-gray-300">الزائر</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 uppercase">{confirm.visiteurNom}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</span>
                       <span className="font-arabic text-[9px] text-gray-300">المصلحة</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 uppercase">{confirm.serviceNom}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Heure Arrivée</span>
                       <span className="font-arabic text-[9px] text-gray-300">وقت الوصول</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{fmtDate(confirm.dateOccupation)}</span>
                 </div>
              </div>

              <p className="text-sm text-gray-500 font-medium text-center px-4 leading-relaxed">
                Veuillez confirmer la réception physique du badge <span className="font-bold text-slate-800">{confirm.code}</span> avant de libérer l'accès.
                <br/>
                <span className="font-arabic text-xs mt-2 block">يرجى التأكد من استلام الشارة ماديا قبل تأكيد الخروج من النظام</span>
              </p>

              <div className="flex gap-3">
                <button onClick={() => setConfirm(null)} disabled={confirming}
                  className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">
                  Annuler | إلغاء
                </button>
                <button onClick={handleRestituer} disabled={confirming}
                  className="flex-1 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black flex flex-col items-center justify-center gap-0.5 transition-all shadow-xl">
                  <span className="flex items-center gap-2">{confirming ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Confirmer</span>
                  <span className="font-arabic text-[10px] font-normal opacity-80">تأكيد الإرجاع</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- Helpers Components --- */

const HeaderStat: React.FC<{ label: string, labelAr: string, value: number, icon: React.ReactNode, color: string, pulse?: boolean }> = ({ label, labelAr, value, icon, color, pulse }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 relative text-left">
    <div className={`${color} text-white p-3.5 rounded-xl shadow-lg relative`}>
      {icon}
      {pulse && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="font-arabic text-[9px] text-gray-300 mt-1 leading-none">{labelAr}</p>
      <p className="text-2xl font-bold text-gray-800 leading-none mt-2">{value}</p>
    </div>
  </div>
);

const FilterBtn: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
      active ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {children}
  </button>
);
