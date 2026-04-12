import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { serviceService, Service, Motif } from '../../services/serviceService';
import api from '../../services/api';
import { Plus, X, LayoutGrid, ClipboardList, ArrowRight } from 'lucide-react';

export const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMotifModal, setShowMotifModal] = useState(false);

  const [newService, setNewService] = useState({ nom: '', description: '' });
  const [newMotif, setNewMotif] = useState({ code: '', libelleFr: '' });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadMotifs(selectedService.id);
      loadServiceDetails(selectedService.id);
    }
  }, [selectedService]);

  const loadServices = async () => {
    const data = await serviceService.getAll();
    setServices(data);
    if (data.length > 0 && !selectedService) setSelectedService(data[0]);
  };

  const loadMotifs = async (id: number) => {
    const data = await serviceService.getMotifs(id);
    setMotifs(data);
  };

  const loadServiceDetails = async (id: number) => {
    try {
      const response = await api.get(`/admin/services/${id}/details`);
      setStaff(response.data.staff);
    } catch (error) {
      console.error("Erreur lors du chargement des détails du service", error);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createService(newService);
    setShowServiceModal(false);
    setNewService({ nom: '', description: '' });
    loadServices();
  };

  const handleCreateMotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    await adminService.createMotif({ ...newMotif, serviceId: selectedService.id });
    setShowMotifModal(false);
    setNewMotif({ code: '', libelleFr: '' });
    loadMotifs(selectedService.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Liste des Services */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><LayoutGrid size={18} className="text-blue-600"/> Services</h3>
          <button onClick={() => setShowServiceModal(true)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"><Plus size={18}/></button>
        </div>
        <div className="divide-y divide-gray-50">
          {services.map(s => (
            <div 
              key={s.id} 
              onClick={() => setSelectedService(s)}
              className={`p-4 cursor-pointer flex justify-between items-center transition-all ${selectedService?.id === s.id ? 'bg-blue-50 border-l-4 border-blue-600 pl-3' : 'hover:bg-gray-50'}`}
            >
              <div>
                <p className={`font-bold ${selectedService?.id === s.id ? 'text-blue-700' : 'text-gray-700'}`}>{s.nom}</p>
                <p className="text-xs text-gray-400">{s.description}</p>
              </div>
              {selectedService?.id === s.id && <ArrowRight size={16} className="text-blue-600" />}
            </div>
          ))}
        </div>
      </div>

      {/* Liste des Motifs et Staff du service sélectionné */}
      <div className="lg:col-span-2 space-y-8">
        {/* Motifs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><ClipboardList size={18} className="text-blue-600"/> Motifs de visite</h3>
              <p className="text-xs text-gray-500">Pour le service : <span className="font-bold text-blue-600">{selectedService?.nom}</span></p>
            </div>
            <button 
              disabled={!selectedService}
              onClick={() => setShowMotifModal(true)} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
            >
              <Plus size={18} /> Nouveau motif
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {motifs.map(m => (
              <div key={m.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col gap-1 hover:border-blue-200 transition-all">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{m.code}</span>
                <p className="font-bold text-gray-800">{m.libelleFr}</p>
              </div>
            ))}
            {motifs.length === 0 && <p className="col-span-full text-center text-gray-400 italic text-sm">Aucun motif configuré.</p>}
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Personnel du service</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Nom complet</th>
                <th className="px-6 py-3">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((member: any) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{member.nomComplet}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span>{member.role}</span>
                      {member.isChef && (
                        <span className="w-fit px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                          Chef de service
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-gray-400 italic">Aucun personnel assigné.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouveau Service */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateService} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Ajouter un service</h3>
              <button type="button" onClick={() => setShowServiceModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom du service</label>
                <input type="text" required className="w-full border-gray-200 rounded-lg p-2.5" value={newService.nom} onChange={e => setNewService({...newService, nom: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                <textarea className="w-full border-gray-200 rounded-lg p-2.5" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 py-2 font-bold text-gray-500">Annuler</button>
              <button type="submit" className="flex-1 py-2 font-bold text-white bg-blue-600 rounded-lg">Créer</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Nouveau Motif */}
      {showMotifModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateMotif} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Ajouter un motif à {selectedService?.nom}</h3>
              <button type="button" onClick={() => setShowMotifModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Code unique (Ex: ADH_CARTE)</label>
                <input type="text" required className="w-full border-gray-200 rounded-lg p-2.5" value={newMotif.code} onChange={e => setNewMotif({...newMotif, code: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Libellé (Français)</label>
                <input type="text" required className="w-full border-gray-200 rounded-lg p-2.5" value={newMotif.libelleFr} onChange={e => setNewMotif({...newMotif, libelleFr: e.target.value})} />
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button type="button" onClick={() => setShowMotifModal(false)} className="flex-1 py-2 font-bold text-gray-500">Annuler</button>
              <button type="submit" className="flex-1 py-2 font-bold text-white bg-blue-600 rounded-lg">Créer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
