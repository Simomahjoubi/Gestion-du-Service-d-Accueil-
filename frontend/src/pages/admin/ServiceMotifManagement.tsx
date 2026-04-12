import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { serviceService, Service, Motif } from '../../services/serviceService';
import { Building2, ClipboardList, Trash2, Eye, X } from 'lucide-react';

interface ServiceWithMotifs extends Service {
  motifs?: Motif[];
}

export const ServiceMotifManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceWithMotifs[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newMotif, setNewMotif] = useState({ code: '', libelleFr: '', serviceId: '' });
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const s = await serviceService.getAll();
    const servicesWithMotifs = await Promise.all(s.map(async (service) => {
        const motifs = await serviceService.getMotifs(service.id);
        return { ...service, motifs };
    }));
    setServices(servicesWithMotifs);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createService({ nom: newServiceName });
    setNewServiceName('');
    loadData();
  };

  const handleAddMotif = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createMotif({ 
        code: newMotif.code, 
        libelleFr: newMotif.libelleFr, 
        serviceId: Number(newMotif.serviceId) 
    });
    setNewMotif({ code: '', libelleFr: '', serviceId: '' });
    loadData();
  };

  const handleDeleteService = async (id: number) => {
    if (window.confirm("Supprimer ce service ?")) {
        await adminService.deleteService(id);
        loadData();
    }
  };

  const handleDeleteMotif = async (id: number) => {
    if (window.confirm("Supprimer ce motif ?")) {
        await adminService.deleteMotif(id);
        loadData();
    }
  };

  const showDetails = async (id: number) => {
    const details = await serviceService.getServiceDetails(id);
    setSelectedService(details);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Formulaires en haut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Building2 className="text-blue-600"/> Ajouter Service</h3>
            <form onSubmit={handleAddService} className="flex gap-2">
                <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="Nom du service" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Ajouter</button>
            </form>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ClipboardList className="text-green-600"/> Ajouter Motif</h3>
            <form onSubmit={handleAddMotif} className="grid grid-cols-2 gap-2">
                <input className="border rounded-lg p-2 text-sm" placeholder="Code" value={newMotif.code} onChange={e => setNewMotif({...newMotif, code: e.target.value})} />
                <input className="border rounded-lg p-2 text-sm" placeholder="Libellé" value={newMotif.libelleFr} onChange={e => setNewMotif({...newMotif, libelleFr: e.target.value})} />
                <select className="col-span-2 border rounded-lg p-2 text-sm" value={newMotif.serviceId} onChange={e => setNewMotif({...newMotif, serviceId: e.target.value})}>
                    <option value="">Choisir service</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                <button className="col-span-2 bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Ajouter Motif</button>
            </form>
        </div>
      </div>

      {/* Liste des services et motifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
            <div key={service.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b font-bold flex justify-between">
                    {service.nom}
                    <div className='flex gap-2'>
                        <Eye size={16} className="text-blue-400 cursor-pointer" onClick={() => showDetails(service.id)}/>
                        <Trash2 size={16} className="text-red-400 cursor-pointer" onClick={() => handleDeleteService(service.id)}/>
                    </div>
                </div>
                <div className="p-4">
                    <ul className="space-y-2">
                        {service.motifs?.map((motif: Motif) => (
                            <li key={motif.id} className="text-sm text-gray-600 flex justify-between">
                                <span>{motif.libelleFr}</span>
                                <Trash2 size={14} className="text-red-400 cursor-pointer" onClick={() => handleDeleteMotif(motif.id)}/>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ))}
      </div>

      {/* Modal Détails */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
                <div className='p-6 border-b flex justify-between items-center bg-gray-50'>
                    <h2 className="text-xl font-bold">{selectedService.service.nom}</h2>
                    <X className="cursor-pointer text-gray-400" onClick={() => setSelectedService(null)}/>
                </div>
                <div className="p-6">
                    <h4 className="font-bold text-xs text-gray-400 uppercase mb-4">Personnel du service</h4>
                    <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Nom complet</th>
                                <th className="px-4 py-3">Rôle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {selectedService.staff.map((u: any) => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3 font-medium text-gray-800">{u.nomComplet}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span>{u.role}</span>
                                            {u.isChef && (
                                                <span className="w-fit px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                                                    Chef de service
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
