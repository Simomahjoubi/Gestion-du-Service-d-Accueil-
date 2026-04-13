import api from './api';
import { Service, Motif } from './serviceService';

export type TypeAffectationMotif = 'ALEATOIRE' | 'SPECIFIQUE';

export interface MotifDetail {
  id: number;
  code: string;
  libelleFr: string;
  libelleAr?: string;
  serviceId: number;
  serviceNom: string;
  typeAffectation: TypeAffectationMotif;
  utilisateurs: { priorite: number; userId: number; nomComplet: string; role: string }[];
}

export interface CreateMotifPayload {
  code: string;
  libelleFr: string;
  libelleAr?: string;
  serviceId: number;
  typeAffectation: TypeAffectationMotif;
  user1Id?: number;  // si SPECIFIQUE (obligatoire)
  user2Id?: number;  // optionnel
  user3Id?: number;  // optionnel
}

export interface UserDetail {
  id?: number;
  username: string;
  nomComplet: string;
  email?: string;
  role: 'AGENT' | 'FONCTIONNAIRE' | 'RESPONSABLE' | 'ADMIN' | 'DIRECTEUR';
  service?: Service;
  serviceId?: number;
  actif: boolean;
  motifsGeres?: Motif[];
}

export const adminService = {
  // Utilisateurs
  getUsers: async () => {
    const response = await api.get<UserDetail[]>('/admin/users');
    return response.data;
  },
  createUser: async (userData: Partial<UserDetail>) => {
    const response = await api.post<UserDetail>('/admin/users', userData);
    return response.data;
  },
  updateUser: async (id: number, userData: Partial<UserDetail>) => {
    const response = await api.put<UserDetail>(`/admin/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: number) => {
    await api.delete(`/admin/users/${id}`);
  },
  deleteMotif: async (id: number) => {
    await api.delete(`/admin/motifs/${id}`);
  },
  deleteService: async (id: number) => {
    await api.delete(`/admin/services/${id}`);
  },

  // Services
  createService: async (serviceData: Partial<Service>) => {
    const response = await api.post<Service>('/admin/services', serviceData);
    return response.data;
  },

  // Motifs
  createMotif: async (motifData: CreateMotifPayload) => {
    const response = await api.post<Motif>('/admin/motifs', motifData);
    return response.data;
  },
  getMotifDetail: async (id: number): Promise<MotifDetail> => {
    const response = await api.get<MotifDetail>(`/admin/motifs/${id}`);
    return response.data;
  },
  updateMotif: async (id: number, motifData: CreateMotifPayload): Promise<MotifDetail> => {
    const response = await api.put<MotifDetail>(`/admin/motifs/${id}`, motifData);
    return response.data;
  },

  // Fonctionnaires d'un service (pour les selects du formulaire motif)
  getServiceFonctionnaires: async (serviceId: number): Promise<UserDetail[]> => {
    const response = await api.get<UserDetail[]>(`/admin/services/${serviceId}/fonctionnaires`);
    return response.data;
  }
};
