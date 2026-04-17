import React, { useState, useEffect } from 'react';
import { adminService, UserDetail, TypeAffectationMotif, MotifDetail } from '../../services/adminService';
import { serviceService, Service, Motif } from '../../services/serviceService';
import api from '../../services/api';
import { Plus, X, LayoutGrid, ClipboardList, ArrowRight, Shuffle, Users, Eye, Pencil, Check } from 'lucide-react';

export const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMotifModal, setShowMotifModal] = useState(false);
  const [serviceFonctionnaires, setServiceFonctionnaires] = useState<UserDetail[]>([]);

  // Modal détail / édition motif
  const [motifDetail, setMotifDetail] = useState<MotifDetail | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFonctionnaires, setEditFonctionnaires] = useState<UserDetail[]>([]);
  const [editForm, setEditForm] = useState<{
    code: string; libelleFr: string; serviceId: string;
    typeAffectation: TypeAffectationMotif;
    user1Id: string; user2Id: string; user3Id: string;
  }>({ code: '', libelleFr: '', serviceId: '', typeAffectation: 'ALEATOIRE', user1Id: '', user2Id: '', user3Id: '' });

  const [newService, setNewService] = useState({ nom: '', description: '' });
  const [newMotif, setNewMotif] = useState<{
    code: string;
    libelleFr: string;
    typeAffectation: TypeAffectationMotif;
    user1Id: string;
    user2Id: string;
    user3Id: string;
  }>({
    code: '',
    libelleFr: '',
    typeAffectation: 'ALEATOIRE',
    user1Id: '',
    user2Id: '',
    user3Id: '',
  });

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
    if (!motifDetail || !selectedService) return;
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
    loadMotifs(selectedService.id);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createService(newService);
    setShowServiceModal(false);
    setNewService({ nom: '', description: '' });
    loadServices();
  };

  const openMotifModal = async () => {
    if (!selectedService) return;
    setShowMotifModal(true);
    const fonctionnaires = await adminService.getServiceFonctionnaires(selectedService.id);
    setServiceFonctionnaires(fonctionnaires);
  };

  const handleCreateMotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    await adminService.createMotif({
      code: newMotif.code,
      libelleFr: newMotif.libelleFr,
      serviceId: selectedService.id,
      typeAffectation: newMotif.typeAffectation,
      user1Id: newMotif.typeAffectation === 'SPECIFIQUE' && newMotif.user1Id ? Number(newMotif.user1Id) : undefined,
      user2Id: newMotif.typeAffectation === 'SPECIFIQUE' && newMotif.user2Id ? Number(newMotif.user2Id) : undefined,
      user3Id: newMotif.typeAffectation === 'SPECIFIQUE' && newMotif.user3Id ? Number(newMotif.user3Id) : undefined,
    });
    setShowMotifModal(false);
    setNewMotif({ code: '', libelleFr: '', typeAffectation: 'ALEATOIRE', user1Id: '', user2Id: '', user3Id: '' });
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
              onClick={openMotifModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
            >
              <Plus size={18} /> Nouveau motif
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {motifs.map(m => (
              <div key={m.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col gap-1 hover:border-blue-200 transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{m.code}</span>
                  <Eye size={14} className="text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" onClick={() => openMotifDetail(m.id)}/>
                </div>
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
          <form onSubmit={handleCreateMotif} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">Ajouter un motif</h3>
                <p className="text-xs text-gray-400 mt-0.5">Service : <span className="font-semibold text-blue-600">{selectedService?.nom}</span></p>
              </div>
              <button type="button" onClick={() => setShowMotifModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Code & Libellé */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Code unique</label>
                  <input type="text" required placeholder="Ex: ADH_CARTE" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-400" value={newMotif.code} onChange={e => setNewMotif({...newMotif, code: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Libellé (Français)</label>
                  <input type="text" required placeholder="Ex: Carte d'adhérent" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-400" value={newMotif.libelleFr} onChange={e => setNewMotif({...newMotif, libelleFr: e.target.value})} />
                </div>
              </div>

              {/* Type d'affectation */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mode d'affectation</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewMotif({...newMotif, typeAffectation: 'ALEATOIRE'})}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${newMotif.typeAffectation === 'ALEATOIRE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Shuffle size={20} className={newMotif.typeAffectation === 'ALEATOIRE' ? 'text-blue-600' : 'text-gray-400'} />
                    <div>
                      <p className={`text-sm font-bold ${newMotif.typeAffectation === 'ALEATOIRE' ? 'text-blue-700' : 'text-gray-600'}`}>Aléatoire</p>
                      <p className="text-[10px] text-gray-400">Distribution automatique</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMotif({...newMotif, typeAffectation: 'SPECIFIQUE'})}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${newMotif.typeAffectation === 'SPECIFIQUE' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Users size={20} className={newMotif.typeAffectation === 'SPECIFIQUE' ? 'text-purple-600' : 'text-gray-400'} />
                    <div>
                      <p className={`text-sm font-bold ${newMotif.typeAffectation === 'SPECIFIQUE' ? 'text-purple-700' : 'text-gray-600'}`}>Spécifique</p>
                      <p className="text-[10px] text-gray-400">Agents désignés</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Si SPECIFIQUE → sélection des 3 agents */}
              {newMotif.typeAffectation === 'SPECIFIQUE' && (
                <div className="space-y-3">
                  {serviceFonctionnaires.length === 0 && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      Aucun agent trouvé pour ce service. Assignez d'abord du personnel.
                    </p>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Agent principal <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-400"
                      value={newMotif.user1Id}
                      onChange={e => setNewMotif({...newMotif, user1Id: e.target.value})}
                    >
                      <option value="">-- Sélectionner --</option>
                      {serviceFonctionnaires.map(u => (
                        <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Agent secondaire <span className="text-gray-300">(optionnel)</span></label>
                    <select
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-400"
                      value={newMotif.user2Id}
                      onChange={e => setNewMotif({...newMotif, user2Id: e.target.value})}
                    >
                      <option value="">-- Aucun --</option>
                      {serviceFonctionnaires.filter(u => String(u.id) !== newMotif.user1Id).map(u => (
                        <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Agent tertiaire <span className="text-gray-300">(optionnel)</span></label>
                    <select
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-400"
                      value={newMotif.user3Id}
                      onChange={e => setNewMotif({...newMotif, user3Id: e.target.value})}
                    >
                      <option value="">-- Aucun --</option>
                      {serviceFonctionnaires.filter(u => String(u.id) !== newMotif.user1Id && String(u.id) !== newMotif.user2Id).map(u => (
                        <option key={u.id} value={u.id}>{u.nomComplet} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button type="button" onClick={() => setShowMotifModal(false)} className="flex-1 py-2 font-bold text-gray-500">Annuler</button>
              <button type="submit" className="flex-1 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">Créer le motif</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Détail / Édition Motif */}
      {motifDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">{editMode ? 'Modifier le motif' : 'Détail du motif'}</h3>
                {!editMode && <p className="text-xs text-gray-400 font-mono mt-0.5">{motifDetail.code}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
                    <Pencil size={13}/> Modifier
                  </button>
                )}
                <button onClick={() => { setMotifDetail(null); setEditMode(false); }}><X size={20} className="text-gray-400"/></button>
              </div>
            </div>

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
                  {motifDetail.typeAffectation === 'ALEATOIRE' ? <Shuffle size={18} className="text-blue-500"/> : <Users size={18} className="text-purple-500"/>}
                  <div>
                    <p className={`text-sm font-bold ${motifDetail.typeAffectation === 'ALEATOIRE' ? 'text-blue-700' : 'text-purple-700'}`}>
                      {motifDetail.typeAffectation === 'ALEATOIRE' ? 'Affectation aléatoire' : 'Affectation spécifique'}
                    </p>
                    <p className="text-xs text-gray-400">{motifDetail.typeAffectation === 'ALEATOIRE' ? 'Distribution automatique sur les agents du service' : 'Agents désignés par priorité'}</p>
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
                              <span className="ml-auto text-[10px] text-gray-400">{u.priorite === 1 ? 'Principal' : u.priorite === 2 ? 'Secondaire' : 'Tertiaire'}</span>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                )}
              </div>
            )}

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
    </div>
  );
};
