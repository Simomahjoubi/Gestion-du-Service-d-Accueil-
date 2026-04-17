import React, { useState, useEffect } from 'react';
import { adminService, UserDetail, TypeAffectationMotif, MotifDetail } from '../../services/adminService';
import { serviceService, Service, Motif } from '../../services/serviceService';
import { Building2, ClipboardList, Trash2, Eye, X, Shuffle, Users, Pencil, Check } from 'lucide-react';

interface ServiceWithMotifs extends Service {
  motifs?: Motif[];
}

interface NewMotifState {
  code: string;
  libelleFr: string;
  serviceId: string;
  typeAffectation: TypeAffectationMotif;
  user1Id: string;
  user2Id: string;
  user3Id: string;
}

export const ServiceMotifManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceWithMotifs[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newMotif, setNewMotif] = useState<NewMotifState>({
    code: '', libelleFr: '', serviceId: '',
    typeAffectation: 'ALEATOIRE',
    user1Id: '', user2Id: '', user3Id: '',
  });
  const [serviceFonctionnaires, setServiceFonctionnaires] = useState<UserDetail[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Modal détail / édition motif
  const [motifDetail, setMotifDetail] = useState<MotifDetail | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFonctionnaires, setEditFonctionnaires] = useState<UserDetail[]>([]);
  const [editForm, setEditForm] = useState<{
    code: string; libelleFr: string; serviceId: string;
    typeAffectation: TypeAffectationMotif;
    user1Id: string; user2Id: string; user3Id: string;
  }>({ code: '', libelleFr: '', serviceId: '', typeAffectation: 'ALEATOIRE', user1Id: '', user2Id: '', user3Id: '' });

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

  const handleServiceChange = async (serviceId: string) => {
    setNewMotif(m => ({ ...m, serviceId, user1Id: '', user2Id: '', user3Id: '' }));
    if (serviceId) {
      const fonctionnaires = await adminService.getServiceFonctionnaires(Number(serviceId));
      setServiceFonctionnaires(fonctionnaires);
    } else {
      setServiceFonctionnaires([]);
    }
  };

  const handleAddMotif = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createMotif({
      code: newMotif.code,
      libelleFr: newMotif.libelleFr,
      serviceId: Number(newMotif.serviceId),
      typeAffectation: newMotif.typeAffectation,
      user1Id: newMotif.typeAffectation === 'SPECIFIQUE' && newMotif.user1Id ? Number(newMotif.user1Id) : undefined,
      user2Id: newMotif.typeAffectation === 'SPECIFIQUE' && newMotif.user2Id ? Number(newMotif.user2Id) : undefined,
      user3Id: newMotif.typeAffectation === 'SPECIFIQUE' && newMotif.user3Id ? Number(newMotif.user3Id) : undefined,
    });
    setNewMotif({ code: '', libelleFr: '', serviceId: '', typeAffectation: 'ALEATOIRE', user1Id: '', user2Id: '', user3Id: '' });
    setServiceFonctionnaires([]);
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

  const openMotifDetail = async (motifId: number) => {
    const detail = await adminService.getMotifDetail(motifId);
    setMotifDetail(detail);
    setEditMode(false);
  };

  const startEdit = async () => {
    if (!motifDetail) return;
    const fonctionnaires = await adminService.getServiceFonctionnaires(motifDetail.serviceId);
    setEditFonctionnaires(fonctionnaires);
    setEditForm({
      code: motifDetail.code,
      libelleFr: motifDetail.libelleFr,
      serviceId: String(motifDetail.serviceId),
      typeAffectation: motifDetail.typeAffectation,
      user1Id: String(motifDetail.utilisateurs.find(u => u.priorite === 1)?.userId ?? ''),
      user2Id: String(motifDetail.utilisateurs.find(u => u.priorite === 2)?.userId ?? ''),
      user3Id: String(motifDetail.utilisateurs.find(u => u.priorite === 3)?.userId ?? ''),
    });
    setEditMode(true);
  };

  const handleUpdateMotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motifDetail) return;
    const updated = await adminService.updateMotif(motifDetail.id, {
      code: editForm.code,
      libelleFr: editForm.libelleFr,
      serviceId: Number(editForm.serviceId),
      typeAffectation: editForm.typeAffectation,
      user1Id: editForm.typeAffectation === 'SPECIFIQUE' && editForm.user1Id ? Number(editForm.user1Id) : undefined,
      user2Id: editForm.typeAffectation === 'SPECIFIQUE' && editForm.user2Id ? Number(editForm.user2Id) : undefined,
      user3Id: editForm.typeAffectation === 'SPECIFIQUE' && editForm.user3Id ? Number(editForm.user3Id) : undefined,
    });
    setMotifDetail(updated);
    setEditMode(false);
    loadData();
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
            <form onSubmit={handleAddMotif} className="space-y-3">
              {/* Code + Libellé */}
              <div className="grid grid-cols-2 gap-2">
                <input required className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-green-400" placeholder="Code (ex: ADH_CARTE)" value={newMotif.code} onChange={e => setNewMotif({...newMotif, code: e.target.value.toUpperCase()})} />
                <input required className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-green-400" placeholder="Libellé français" value={newMotif.libelleFr} onChange={e => setNewMotif({...newMotif, libelleFr: e.target.value})} />
              </div>

              {/* Service */}
              <select required className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-green-400" value={newMotif.serviceId} onChange={e => handleServiceChange(e.target.value)}>
                <option value="">-- Choisir un service --</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>

              {/* Mode d'affectation */}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setNewMotif(m => ({...m, typeAffectation: 'ALEATOIRE'}))}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${newMotif.typeAffectation === 'ALEATOIRE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Shuffle size={16} className={newMotif.typeAffectation === 'ALEATOIRE' ? 'text-blue-600' : 'text-gray-400'} />
                  <div>
                    <p className={`text-xs font-bold ${newMotif.typeAffectation === 'ALEATOIRE' ? 'text-blue-700' : 'text-gray-600'}`}>Aléatoire</p>
                    <p className="text-[10px] text-gray-400">Distribution auto</p>
                  </div>
                </button>
                <button type="button" onClick={() => setNewMotif(m => ({...m, typeAffectation: 'SPECIFIQUE'}))}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${newMotif.typeAffectation === 'SPECIFIQUE' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Users size={16} className={newMotif.typeAffectation === 'SPECIFIQUE' ? 'text-purple-600' : 'text-gray-400'} />
                  <div>
                    <p className={`text-xs font-bold ${newMotif.typeAffectation === 'SPECIFIQUE' ? 'text-purple-700' : 'text-gray-600'}`}>Spécifique</p>
                    <p className="text-[10px] text-gray-400">Agents désignés</p>
                  </div>
                </button>
              </div>

              {/* Si SPECIFIQUE */}
              {newMotif.typeAffectation === 'SPECIFIQUE' && (
                <div className="space-y-2">
                  {!newMotif.serviceId && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">Sélectionnez d'abord un service.</p>}
                  <select required className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400"
                    value={newMotif.user1Id} onChange={e => setNewMotif({...newMotif, user1Id: e.target.value})}>
                    <option value="">Agent principal *</option>
                    {serviceFonctionnaires.map(u => <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>)}
                  </select>
                  <select className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400"
                    value={newMotif.user2Id} onChange={e => setNewMotif({...newMotif, user2Id: e.target.value})}>
                    <option value="">Agent secondaire (optionnel)</option>
                    {serviceFonctionnaires.filter(u => String(u.id) !== newMotif.user1Id).map(u => <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>)}
                  </select>
                  <select className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400"
                    value={newMotif.user3Id} onChange={e => setNewMotif({...newMotif, user3Id: e.target.value})}>
                    <option value="">Agent tertiaire (optionnel)</option>
                    {serviceFonctionnaires.filter(u => String(u.id) !== newMotif.user1Id && String(u.id) !== newMotif.user2Id).map(u => <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>)}
                  </select>
                </div>
              )}

              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-all">Ajouter le motif</button>
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
                            <li key={motif.id} className="text-sm text-gray-600 flex justify-between items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 truncate">{motif.libelleFr}</p>
                                  <p className="text-[10px] text-blue-400 font-mono">{motif.code}</p>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <Eye size={14} className="text-blue-400 cursor-pointer hover:text-blue-600" onClick={() => openMotifDetail(motif.id)}/>
                                  <Trash2 size={14} className="text-red-400 cursor-pointer hover:text-red-600" onClick={() => handleDeleteMotif(motif.id)}/>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ))}
      </div>

      {/* Modal Détail / Édition Motif */}
      {motifDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{editMode ? 'Modifier le motif' : 'Détail du motif'}</h2>
                {!editMode && <p className="text-xs text-gray-400 font-mono mt-0.5">{motifDetail.code}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
                    <Pencil size={13}/> Modifier
                  </button>
                )}
                <X className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => { setMotifDetail(null); setEditMode(false); }}/>
              </div>
            </div>

            {/* Mode lecture */}
            {!editMode && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Code</p>
                    <p className="font-mono font-bold text-blue-600">{motifDetail.code}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Service</p>
                    <p className="font-semibold text-gray-800">{motifDetail.serviceNom}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Libellé</p>
                    <p className="text-gray-800">{motifDetail.libelleFr}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${motifDetail.typeAffectation === 'ALEATOIRE' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'}`}>
                  {motifDetail.typeAffectation === 'ALEATOIRE'
                    ? <Shuffle size={18} className="text-blue-500"/>
                    : <Users size={18} className="text-purple-500"/>}
                  <div>
                    <p className={`text-sm font-bold ${motifDetail.typeAffectation === 'ALEATOIRE' ? 'text-blue-700' : 'text-purple-700'}`}>
                      {motifDetail.typeAffectation === 'ALEATOIRE' ? 'Affectation aléatoire' : 'Affectation spécifique'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {motifDetail.typeAffectation === 'ALEATOIRE' ? 'Distribution automatique sur les agents du service' : 'Agents désignés par priorité'}
                    </p>
                  </div>
                </div>

                {motifDetail.typeAffectation === 'SPECIFIQUE' && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Agents assignés</p>
                    {motifDetail.utilisateurs.length === 0
                      ? <p className="text-xs text-gray-400 italic">Aucun agent assigné.</p>
                      : <div className="space-y-2">
                          {motifDetail.utilisateurs.map(u => (
                            <div key={u.priorite} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${u.priorite === 1 ? 'bg-purple-500' : u.priorite === 2 ? 'bg-purple-300' : 'bg-purple-200'}`}>{u.priorite}</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{u.nomComplet}</p>
                                <p className="text-[10px] text-gray-400">{u.role}</p>
                              </div>
                              <span className="ml-auto text-[10px] text-gray-400">
                                {u.priorite === 1 ? 'Principal' : u.priorite === 2 ? 'Secondaire' : 'Tertiaire'}
                              </span>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                )}
              </div>
            )}

            {/* Mode édition */}
            {editMode && (
              <form onSubmit={handleUpdateMotif} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Code</label>
                    <input required className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                      value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value.toUpperCase()})}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Libellé</label>
                    <input required className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                      value={editForm.libelleFr} onChange={e => setEditForm({...editForm, libelleFr: e.target.value})}/>
                  </div>
                </div>

                {/* Mode d'affectation */}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setEditForm(f => ({...f, typeAffectation: 'ALEATOIRE'}))}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${editForm.typeAffectation === 'ALEATOIRE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <Shuffle size={16} className={editForm.typeAffectation === 'ALEATOIRE' ? 'text-blue-600' : 'text-gray-400'}/>
                    <div>
                      <p className={`text-xs font-bold ${editForm.typeAffectation === 'ALEATOIRE' ? 'text-blue-700' : 'text-gray-600'}`}>Aléatoire</p>
                      <p className="text-[10px] text-gray-400">Distribution auto</p>
                    </div>
                  </button>
                  <button type="button" onClick={() => setEditForm(f => ({...f, typeAffectation: 'SPECIFIQUE'}))}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${editForm.typeAffectation === 'SPECIFIQUE' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                    <Users size={16} className={editForm.typeAffectation === 'SPECIFIQUE' ? 'text-purple-600' : 'text-gray-400'}/>
                    <div>
                      <p className={`text-xs font-bold ${editForm.typeAffectation === 'SPECIFIQUE' ? 'text-purple-700' : 'text-gray-600'}`}>Spécifique</p>
                      <p className="text-[10px] text-gray-400">Agents désignés</p>
                    </div>
                  </button>
                </div>

                {editForm.typeAffectation === 'SPECIFIQUE' && (
                  <div className="space-y-2">
                    <select required className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400"
                      value={editForm.user1Id} onChange={e => setEditForm({...editForm, user1Id: e.target.value})}>
                      <option value="">Agent principal *</option>
                      {editFonctionnaires.map(u => <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>)}
                    </select>
                    <select className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400"
                      value={editForm.user2Id} onChange={e => setEditForm({...editForm, user2Id: e.target.value})}>
                      <option value="">Agent secondaire (optionnel)</option>
                      {editFonctionnaires.filter(u => String(u.id) !== editForm.user1Id).map(u => <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>)}
                    </select>
                    <select className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400"
                      value={editForm.user3Id} onChange={e => setEditForm({...editForm, user3Id: e.target.value})}>
                      <option value="">Agent tertiaire (optionnel)</option>
                      {editFonctionnaires.filter(u => String(u.id) !== editForm.user1Id && String(u.id) !== editForm.user2Id).map(u => <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>)}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-2 text-sm font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
                  <button type="submit" className="flex-1 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all">
                    <Check size={15}/> Enregistrer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Détails Service */}
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
