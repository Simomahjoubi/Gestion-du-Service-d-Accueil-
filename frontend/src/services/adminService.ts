import api from './api';
import { Service, Motif } from './serviceService';

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
  createMotif: async (motifData: { code: string, libelleFr: string, serviceId: number }) => {
    const response = await api.post<Motif>('/admin/motifs', motifData);
    return response.data;
  }
};
