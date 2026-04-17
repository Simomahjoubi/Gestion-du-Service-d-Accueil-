import api from './api';

export type StatutBadge = 'DISPONIBLE' | 'OCCUPE' | 'PRET_A_RESTITUER' | 'RESTITUE';

export interface BadgeDetail {
  id: number;
  code: string;
  statut: StatutBadge;
  serviceId: number | null;
  serviceNom: string;
  servicePrefix: string;
  // Occupied details
  visiteId?: number;
  visiteurNom?: string;
  staffNom?: string;
  dateOccupation?: string;
}

export interface ServiceBadgeStat {
  serviceId: number;
  serviceNom: string;
  prefix: string;
  total: number;
  libres: number;
  occupes: number;
}

export const badgeService = {
  getAll: async (serviceId?: number, statut?: StatutBadge): Promise<BadgeDetail[]> => {
    const params: Record<string, string | number> = {};
    if (serviceId != null) params.serviceId = serviceId;
    if (statut)           params.statut     = statut;
    const res = await api.get<BadgeDetail[]>('/badges', { params });
    return res.data;
  },

  getStats: async (): Promise<ServiceBadgeStat[]> => {
    const res = await api.get<ServiceBadgeStat[]>('/badges/stats');
    return res.data;
  },

  generate: async (serviceId: number, count: number): Promise<BadgeDetail[]> => {
    const res = await api.post<BadgeDetail[]>('/badges/generate', { serviceId, count });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/badges/${id}`);
  },

  liberer: async (id: number): Promise<void> => {
    await api.put(`/badges/${id}/liberer`);
  },
};
