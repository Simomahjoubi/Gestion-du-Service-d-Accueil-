import api from './api';

export type PeriodeDirecteur = 'JOUR' | 'SEMAINE' | 'MOIS' | 'ANNEE';

export interface DirecteurGlobalStats {
  periode: string;
  totalVisites: number;
  visitesTerminees: number;
  visitesEnCours: number;
  visitesEnAttente: number;
  visiteursUniques: number;
  totalServices: number;
  totalFonctionnaires: number;
  tempsAttenteMoyen: number;
  tempsTraitementMoyen: number;
  tauxTraitement: number;
}

export interface ServiceStatItem {
  serviceId: number;
  serviceNom: string;
  totalVisites: number;
  visitesTerminees: number;
  visitesEnCours: number;
  visitesEnAttente: number;
  tempsTraitementMoyen: number;
  tauxTraitement: number;
  fonctionnairesCount: number;
}

export interface MotifStatItem {
  motif: string;
  serviceNom: string;
  count: number;
}

export interface AdherentRecurrentItem {
  visiteurId: number;
  nomComplet: string;
  cin: string;
  typeVisiteur: string;
  totalVisites: number;
  services: string[];
  motifs: string[];
}

export interface EvolutionPoint {
  label: string;
  count: number;
}

export interface TypeVisiteurStat {
  type: string;
  count: number;
}

export const directeurService = {
  getGlobalStats: (periode: PeriodeDirecteur = 'MOIS') =>
    api.get<DirecteurGlobalStats>('/directeur/stats', { params: { periode } }).then(r => r.data),

  getServicesStats: (periode: PeriodeDirecteur = 'MOIS') =>
    api.get<ServiceStatItem[]>('/directeur/services-stats', { params: { periode } }).then(r => r.data),

  getTopMotifs: (periode: PeriodeDirecteur = 'MOIS', limit = 10) =>
    api.get<MotifStatItem[]>('/directeur/top-motifs', { params: { periode, limit } }).then(r => r.data),

  getAdherentsRecurrents: (periode: PeriodeDirecteur = 'MOIS', limit = 10) =>
    api.get<AdherentRecurrentItem[]>('/directeur/adherents-recurrents', { params: { periode, limit } }).then(r => r.data),

  getEvolution: () =>
    api.get<EvolutionPoint[]>('/directeur/evolution').then(r => r.data),

  getRepartitionVisiteurs: (periode: PeriodeDirecteur = 'MOIS') =>
    api.get<TypeVisiteurStat[]>('/directeur/repartition-visiteurs', { params: { periode } }).then(r => r.data),
};
