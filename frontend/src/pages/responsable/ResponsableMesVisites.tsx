import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2, Clock, User, Tag, RefreshCw, X,
  FileText, ChevronRight, Users, UserCheck,
  Phone, MapPin, Shield, CreditCard, Hash, Briefcase,
  AlertCircle, CalendarCheck, LogOut, Star,
} from 'lucide-react';
import { visiteService } from '../../services/visiteService';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

interface Visite {
  id: number; visiteurId: number; visiteurNom: string;
  typeVisiteur: string; badgeCode: string; statut: string;
  heureArrivee: string; motifLibelle: string; serviceNom: string;
  fonctionnaireNom: string; grade?: string; typeAssurance?: string;
}

interface VisiteurInfo {
  id: number; nom: string; prenom: string; cin?: string; numAdhesion?: string;
  sexe?: string; telephone?: string; situationFamiliale?: string;
  type: string; statutAdherent?: string; lienParente?: string;
  typeAdherentDetail?: string; grade?: string;
  typeAssurance?: string; affectation?: string;
}

interface Dossier {
  visiteur: VisiteurInfo; adherent?: VisiteurInfo; famille?: VisiteurInfo[];
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const STATUT_BADGE: Record<string, { cls: string; label: string }> = {
  EN_ATTENTE: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',      label: 'En attente' },
  EN_COURS:   { cls: 'bg-blue-100  text-blue-700  border border-blue-200',       label: 'En cours'   },
  TERMINEE:   { cls: 'bg-gray-100  text-gray-500  border border-gray-200',       label: 'Terminée'   },
  CLOTUREE:   { cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Clôturée'  },
};

const TYPE_COLORS: Record<string, string> = {
  ADHERENT:   'bg-blue-100 text-blue-700',
  CONJOINT:   'bg-violet-100 text-violet-700',
  ENFANT:     'bg-pink-100 text-pink-700',
  EXTERNE:    'bg-gray-100 text-gray-600',
  VIP:        'bg-yellow-100 text-yellow-700',
  MEDECIN:    'bg-green-100 text-green-700',
  PARTENAIRE: 'bg-orange-100 text-orange-700',
};

const BADGE_COLORS = [
  'from-amber-500 to-yellow-400',
  'from-amber-600 to-orange-400',
  'from-yellow-600 to-amber-400',
  'from-orange-600 to-amber-500',
  'from-amber-700 to-yellow-500',
];

// ─── Dossier Modal ────────────────────────────────────────────────────────────
const DossierModal: React.FC<{ visiteurId: number; onClose: () => void }> = ({ visiteurId, onClose }) => {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<Dossier>(`/visiteurs/${visiteurId}/dossier`)
      .then(r => setDossier(r.data))
      .catch(() => setDossier(null))
      .finally(() => setLoading(false));
  }, [visiteurId]);

  const v = dossier?.visiteur;
  const adh = dossier?.adherent;
  const main = v?.type === 'ADHERENT' ? v : adh;
  const famille = dossier?.famille ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-10 px-4 pb-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Star size={24} className="text-white" />
            </div>
            <div>
              {loading ? (
                <p className="text-white font-bold text-lg">Chargement…</p>
              ) : (
                <>
                  <p className="text-white font-bold text-lg leading-tight">{v?.nom ?? '—'} {v?.prenom ?? ''}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">VIP</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[v?.type ?? 'EXTERNE'] ?? 'bg-gray-100 text-gray-600'}`}>
                      {v?.type}
                    </span>
                    {v?.statutAdherent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {v.statutAdherent}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-xl">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw size={28} className="animate-spin" />
          </div>
        ) : !dossier ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <AlertCircle size={20} /> Dossier introuvable.
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {v?.type !== 'ADHERENT' && adh && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Shield size={16} className="text-blue-500 shrink-0" />
                <div className="text-sm">
                  <span className="text-blue-500 font-medium">Adhérent principal : </span>
                  <span className="font-bold text-blue-800">{adh.nom} {adh.prenom}</span>
                  {adh.numAdhesion && <span className="text-blue-500 ml-2 text-xs">N° {adh.numAdhesion}</span>}
                </div>
              </div>
            )}
            <Section title="Informations personnelles" icon={<User size={15} />}>
              <Grid2>
                <InfoItem icon={<CreditCard size={13} />} label="CIN"            value={main?.cin} />
                <InfoItem icon={<Hash size={13} />}       label="N° Adhésion"    value={main?.numAdhesion} />
                <InfoItem icon={<User size={13} />}       label="Civilité"       value={main?.sexe} />
                <InfoItem icon={<Users size={13} />}      label="Sit. familiale" value={main?.situationFamiliale} />
                <InfoItem icon={<Phone size={13} />}      label="Téléphone"      value={main?.telephone} />
              </Grid2>
            </Section>
            {main && (main.grade || main.typeAdherentDetail || main.typeAssurance || main.affectation) && (
              <Section title="Informations professionnelles" icon={<Briefcase size={15} />}>
                <Grid2>
                  <InfoItem icon={<Shield size={13} />}    label="Grade"         value={main.grade} />
                  <InfoItem icon={<Briefcase size={13} />} label="Type adhérent" value={main.typeAdherentDetail} />
                  <InfoItem icon={<FileText size={13} />}  label="Assurance"     value={main.typeAssurance} />
                  <InfoItem icon={<MapPin size={13} />}    label="Affectation"   value={main.affectation} />
                </Grid2>
              </Section>
            )}
            {v?.type === 'ADHERENT' && (
              <Section title={`Membres de la famille (${famille.length})`} icon={<Users size={15} />}>
                {famille.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Aucun membre de famille enregistré.</p>
                ) : (
                  <div className="space-y-2">
                    {famille.map(m => (
                      <div key={m.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold ${TYPE_COLORS[m.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {m.type === 'CONJOINT' ? '♥' : m.type === 'ENFANT' ? '★' : '•'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800">{m.nom} {m.prenom}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span className={`px-1.5 py-0.5 rounded-full font-semibold ${TYPE_COLORS[m.type] ?? ''}`}>{m.type}</span>
                            {m.lienParente && <span>{m.lienParente}</span>}
                            {m.cin && <span>CIN: {m.cin}</span>}
                          </div>
                        </div>
                        {m.telephone && <span className="text-xs text-gray-400 hidden sm:block">{m.telephone}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Visit Card ───────────────────────────────────────────────────────────────
const VisiteCard: React.FC<{
  visite: Visite; idx: number;
  onAccepter: (id: number) => void;
  onCloturer: (id: number) => void;
  onDossier:  (visiteurId: number) => void;
  loading: boolean;
}> = ({ visite, idx, onAccepter, onCloturer, onDossier, loading }) => {
  const enAttente = visite.statut === 'EN_ATTENTE';
  const enCours   = visite.statut === 'EN_COURS';
  const grad      = BADGE_COLORS[idx % BADGE_COLORS.length];
  const sb        = STATUT_BADGE[visite.statut];

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all hover:shadow-lg ${enAttente ? 'border-amber-200 hover:border-amber-300' : enCours ? 'border-blue-200 hover:border-blue-300' : 'border-gray-100'}`}>
      <div className={`h-1.5 rounded-t-xl bg-gradient-to-r ${grad}`} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm`}>
              <Tag size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xl font-black text-gray-800 leading-tight">{visite.badgeCode}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">VIP</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">{visite.serviceNom}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${sb?.cls ?? ''}`}>
            {sb?.label ?? visite.statut}
          </span>
        </div>

        {/* Visitor */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
            <User size={15} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{visite.visiteurNom}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[visite.typeVisiteur] ?? 'bg-gray-100 text-gray-500'}`}>
              {visite.typeVisiteur}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <Clock size={11} className="text-gray-400 shrink-0" />
            <span>Arrivée : <span className="font-semibold text-gray-700">{fmtTime(visite.heureArrivee)}</span></span>
          </div>
          {visite.motifLibelle && (
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <FileText size={11} className="text-gray-400 shrink-0" />
              <span className="truncate">{visite.motifLibelle}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onDossier(visite.visiteurId)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
          >
            <FileText size={12} /> Dossier
          </button>
          {enAttente && (
            <button
              onClick={() => onAccepter(visite.id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {loading ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Accepter
            </button>
          )}
          {enCours && (
            <button
              onClick={() => onCloturer(visite.id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {loading ? <RefreshCw size={12} className="animate-spin" /> : <LogOut size={12} />}
              Clôturer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const ResponsableMesVisites: React.FC = () => {
  const qc   = useQueryClient();
  const user = useAuthStore(s => s.user);
  const userId = user?.id ?? 0;

  const [dossierVisiteurId, setDossierVisiteurId] = useState<number | null>(null);
  const [actionLoading, setActionLoading]         = useState(false);

  const { data: activeVisits = [], isLoading: loadingActive } = useQuery<Visite[]>({
    queryKey: ['responsable-active', userId],
    queryFn: () => visiteService.getVisitesActiveByFonctionnaire(userId),
    refetchInterval: 15000,
  });

  const { data: todayVisits = [], isLoading: loadingToday } = useQuery<Visite[]>({
    queryKey: ['responsable-today', userId],
    queryFn: () => visiteService.getVisitesTodayByFonctionnaire(userId),
    refetchInterval: 30000,
  });

  const refetch = () => {
    qc.invalidateQueries({ queryKey: ['responsable-active', userId] });
    qc.invalidateQueries({ queryKey: ['responsable-today',  userId] });
  };

  const accepter = useMutation({
    mutationFn: (id: number) => visiteService.recevoir(id),
    onMutate:   () => setActionLoading(true),
    onSettled:  () => { setActionLoading(false); refetch(); },
  });

  const cloturer = useMutation({
    mutationFn: (id: number) => visiteService.cloturer(id),
    onMutate:   () => setActionLoading(true),
    onSettled:  () => { setActionLoading(false); refetch(); },
  });

  const enAttente = activeVisits.filter(v => v.statut === 'EN_ATTENTE');
  const enCours   = activeVisits.filter(v => v.statut === 'EN_COURS');

  return (
    <div className="p-6 min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Star size={18} className="text-amber-500" /> Mes visites VIP
          </h1>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StatPill icon={<Clock size={12} />}         label="En attente"  value={enAttente.length}    color="amber" />
            <StatPill icon={<UserCheck size={12} />}     label="En cours"    value={enCours.length}      color="blue"  />
            <StatPill icon={<CalendarCheck size={12} />} label="Aujourd'hui" value={todayVisits.length}  color="gray"  />
          </div>
          <button onClick={refetch}
            className="w-9 h-9 flex items-center justify-center border-2 border-gray-200 bg-white rounded-xl text-gray-400 hover:text-amber-600 hover:border-amber-300 transition-colors">
            <RefreshCw size={15} className={(loadingActive || loadingToday) ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left: Active queue */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">File d'attente VIP</h2>
              {activeVisits.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeVisits.length}
                </span>
              )}
            </div>
          </div>

          {loadingActive ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <RefreshCw size={28} className="animate-spin mr-3" /> Chargement…
            </div>
          ) : activeVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              <Star size={40} className="mb-3 opacity-20" />
              <p className="font-medium">Aucune visite VIP en attente</p>
              <p className="text-sm mt-1">Les visiteurs VIP vous seront assignés automatiquement.</p>
            </div>
          ) : (
            <>
              {enAttente.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock size={11} /> En attente ({enAttente.length})
                  </p>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {enAttente.map((v, i) => (
                      <VisiteCard key={v.id} visite={v} idx={i}
                        onAccepter={id => accepter.mutate(id)}
                        onCloturer={id => cloturer.mutate(id)}
                        onDossier={setDossierVisiteurId}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}
              {enCours.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <UserCheck size={11} /> En cours ({enCours.length})
                  </p>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {enCours.map((v, i) => (
                      <VisiteCard key={v.id} visite={v} idx={i + 10}
                        onAccepter={id => accepter.mutate(id)}
                        onCloturer={id => cloturer.mutate(id)}
                        onDossier={setDossierVisiteurId}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Today's history */}
        <div className="w-80 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <CalendarCheck size={14} /> Aujourd'hui
              {todayVisits.length > 0 && (
                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {todayVisits.length}
                </span>
              )}
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {loadingToday ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <RefreshCw size={20} className="animate-spin" />
              </div>
            ) : todayVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CalendarCheck size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Aucune visite VIP aujourd'hui</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-220px)] overflow-y-auto">
                {todayVisits.map(v => {
                  const sb = STATUT_BADGE[v.statut];
                  return (
                    <div key={v.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors cursor-pointer group"
                      onClick={() => setDossierVisiteurId(v.visiteurId)}
                    >
                      <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                        <Tag size={14} className="text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{v.visiteurNom}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-mono text-gray-400">{v.badgeCode}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-[9px] text-gray-400">{fmtTime(v.heureArrivee)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sb?.cls ?? ''}`}>
                          {sb?.label ?? v.statut}
                        </span>
                        <ChevronRight size={11} className="text-gray-300 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {dossierVisiteurId != null && (
        <DossierModal visiteurId={dossierVisiteurId} onClose={() => setDossierVisiteurId(null)} />
      )}
    </div>
  );
};

// ─── UI helpers ───────────────────────────────────────────────────────────────
const PILL_COLORS: Record<string, string> = {
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  blue:  'bg-blue-50  border-blue-200  text-blue-700',
  gray:  'bg-gray-50  border-gray-200  text-gray-600',
};

const StatPill: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${PILL_COLORS[color] ?? PILL_COLORS.gray}`}>
    {icon} {value} <span className="font-normal hidden sm:inline">{label}</span>
  </div>
);

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">{icon}</div>
      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">{children}</div>
  </div>
);

const Grid2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-2 gap-3">{children}</div>
);

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | null }> = ({ icon, label, value }) => (
  value ? (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-xs font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  ) : null
);
