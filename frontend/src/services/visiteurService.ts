import api from './api';

export interface Visiteur {
  id?: number;
  nom: string;
  prenom: string;
  cin?: string;
  numAdhesion?: string;
  telephone?: string;
  sexe?: string;
  situationFamiliale?: string;
  type: string;
  statutAdherent?: string;
  typeAdherentDetail?: string;
  grade?: string;
  typeAssurance?: string;
  affectation?: string;
  lienParente?: string;
  parentId?: number;
  parentNom?: string;
  parentCin?: string;
}

export const visiteurService = {
  getAll: async (filters?: {
    query?: string;
    type?: string;
    statut?: string;
    affectation?: string;
    typeDetail?: string;
    typeAssurance?: string;
  }): Promise<Visiteur[]> => {
    const p = new URLSearchParams();
    if (filters?.query)         p.set('query',         filters.query);
    if (filters?.type)          p.set('type',          filters.type);
    if (filters?.statut)        p.set('statut',        filters.statut);
    if (filters?.affectation)   p.set('affectation',   filters.affectation);
    if (filters?.typeDetail)    p.set('typeDetail',    filters.typeDetail);
    if (filters?.typeAssurance) p.set('typeAssurance', filters.typeAssurance);
    const qs = p.toString();
    const response = await api.get<Visiteur[]>(`/admin/visiteurs${qs ? '?' + qs : ''}`);
    return response.data;
  },

  create: async (data: Visiteur): Promise<Visiteur> => {
    const response = await api.post<Visiteur>('/admin/visiteurs', data);
    return response.data;
  },

  update: async (id: number, data: Visiteur): Promise<Visiteur> => {
    const response = await api.put<Visiteur>(`/admin/visiteurs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/visiteurs/${id}`);
  },

  importBulk: async (rows: Partial<Visiteur>[]): Promise<{ importes: number; ignores: number }> => {
    const response = await api.post('/admin/visiteurs/import', rows);
    return response.data;
  },

  // anciens endpoints de recherche (utilisés par l'agent d'accueil)
  rechercherParCin: async (cin: string) => {
    const response = await api.get<Visiteur>(`/visiteurs/recherche/cin/${cin}`);
    return response.data;
  },
  rechercherParNumAdhesion: async (numAdhesion: string) => {
    const response = await api.get<Visiteur>(`/visiteurs/recherche/adhesion/${numAdhesion}`);
    return response.data;
  },
  rechercherParNom: async (query: string) => {
    const response = await api.get<Visiteur[]>(`/visiteurs/recherche/nom?query=${query}`);
    return response.data;
  }
};
