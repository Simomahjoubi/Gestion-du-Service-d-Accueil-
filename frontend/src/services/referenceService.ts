import api from './api';

export type ReferenceCategorie =
  | 'TYPE_ADHERENT'
  | 'SITUATION_FAMILIALE'
  | 'STATUT'
  | 'TYPE_DETAIL'
  | 'GRADE'
  | 'TYPE_ASSURANCE'
  | 'AFFECTATION'
  | 'ROLE';

export interface ReferenceItem {
  id: number;
  categorie: ReferenceCategorie;
  valeur: string;
  description?: string;
  ordre: number;
}

export const CATEGORIE_LABELS: Record<ReferenceCategorie, string> = {
  TYPE_ADHERENT:       "Type de l'adhérent",
  SITUATION_FAMILIALE: 'Situation familiale',
  STATUT:              'Statut',
  TYPE_DETAIL:         'Type adhérent détail',
  GRADE:               'Grade',
  TYPE_ASSURANCE:      'Type assurance',
  AFFECTATION:         'Affectation',
  ROLE:                'Rôle',
};

export const ALL_CATEGORIES: ReferenceCategorie[] = [
  'TYPE_ADHERENT',
  'SITUATION_FAMILIALE',
  'STATUT',
  'TYPE_DETAIL',
  'GRADE',
  'TYPE_ASSURANCE',
  'AFFECTATION',
  'ROLE',
];

export const referenceService = {
  getAll: async (): Promise<Record<ReferenceCategorie, ReferenceItem[]>> => {
    const res = await api.get<Record<ReferenceCategorie, ReferenceItem[]>>('/admin/references/all');
    return res.data;
  },

  getByCategorie: async (categorie: ReferenceCategorie): Promise<ReferenceItem[]> => {
    const res = await api.get<ReferenceItem[]>('/admin/references', { params: { categorie } });
    return res.data;
  },

  create: async (categorie: ReferenceCategorie, valeur: string, description?: string): Promise<ReferenceItem> => {
    const res = await api.post<ReferenceItem>('/admin/references', { categorie, valeur, description });
    return res.data;
  },

  update: async (id: number, valeur: string, description?: string): Promise<ReferenceItem> => {
    const res = await api.put<ReferenceItem>(`/admin/references/${id}`, { valeur, description });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/references/${id}`);
  },
};
