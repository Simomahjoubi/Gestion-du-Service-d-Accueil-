import api from './api';

export const visiteService = {
  enregistrer: async (data: { visiteurId: number; serviceId: number; algorithme: string; notes?: string }) => {
    const response = await api.post('/visites/enregistrer', data);
    return response.data;
  },
  
  cloturer: async (id: number) => {
    const response = await api.post(`/visites/${id}/cloturer`);
    return response.data;
  },
  
  restituerBadge: async (code: string) => {
    const response = await api.post(`/visites/restituer-badge?code=${code}`);
    return response.data;
  },

  getStatsToday: async () => {
    const response = await api.get('/visites/stats/today');
    return response.data;
  },

  getVisitesToday: async () => {
    const response = await api.get('/visites/today');
    return response.data;
  },

  getVisitesActiveByFonctionnaire: async (id: number) => {
    const response = await api.get(`/visites/fonctionnaire/${id}/active`);
    return response.data;
  },

  recevoir: async (id: number) => {
    const response = await api.post(`/visites/${id}/recevoir`);
    return response.data;
  }
};
