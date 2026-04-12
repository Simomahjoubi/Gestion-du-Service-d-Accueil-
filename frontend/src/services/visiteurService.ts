import api from './api';

export interface Visitor {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  numAdhesion?: string;
  type: string;
  statutAdherent?: string;
  typeAdherentDetail?: string;
  grade?: string;
  typeAssurance?: string;
  affectation?: string;
  lienParente?: string;
  parentNom?: string;
  parentCin?: string;
}

export const visiteurService = {
  rechercherParCin: async (cin: string) => {
    const response = await api.get<Visitor>(`/visiteurs/recherche/cin/${cin}`);
    return response.data;
  },
  
  rechercherParNumAdhesion: async (numAdhesion: string) => {
    const response = await api.get<Visitor>(`/visiteurs/recherche/adhesion/${numAdhesion}`);
    return response.data;
  },

  rechercherParNom: async (query: string) => {
    const response = await api.get<Visitor[]>(`/visiteurs/recherche/nom?query=${query}`);
    return response.data;
  }
};
