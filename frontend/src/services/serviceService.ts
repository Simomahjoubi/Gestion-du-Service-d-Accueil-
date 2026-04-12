import api from './api';

export interface Service {
  id: number;
  nom: string;
  description: string;
}

export interface Motif {
  id: number;
  libelleFr: string;
  code: string;
}

export const serviceService = {
  getAll: async () => {
    const response = await api.get<Service[]>('/services');
    return response.data;
  },
  
  getMotifs: async (serviceId: number) => {
    const response = await api.get<Motif[]>(`/services/${serviceId}/motifs`);
    return response.data;
  },
  getServiceDetails: async (id: number) => {
    const response = await api.get(`/admin/services/${id}/details`);
    return response.data;
  }
};
