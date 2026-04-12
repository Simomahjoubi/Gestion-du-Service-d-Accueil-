import React, { useState, useEffect } from 'react';
import { adminService, UserDetail } from '../../services/adminService';
import { serviceService, Service } from '../../services/serviceService';
import { UserPlus, Check, X, Shield, Edit2, Trash2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null);

  const [newUser, setNewUser] = useState<any>({
    username: '',
    password: '',
    nomComplet: '',
    role: 'FONCTIONNAIRE',
    isChef: false,
    actif: true,
    serviceId: undefined
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [u, s] = await Promise.all([adminService.getUsers(), serviceService.getAll()]);
      setUsers(u);
      setServices(s);
      setError(null);
    } catch (err) {
      console.error("API Error:", err);
      setError("Erreur de chargement des données");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id!, newUser);
      } else {
        await adminService.createUser(newUser);
      }
      closeModal();
      loadData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'utilisateur");
    }
  };

  const openEditModal = (user: UserDetail) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      nomComplet: user.nomComplet,
      password: '', 
      role: user.role,
      isChef: !!user.service,
      actif: user.actif,
      serviceId: user.service?.id
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setNewUser({
      username: '',
      password: '',
      nomComplet: '',
      role: 'FONCTIONNAIRE',
      isChef: false,
      actif: true,
      serviceId: undefined
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await adminService.deleteUser(id);
        loadData();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 text-sm font-bold border-b border-red-100">
          {error}
        </div>
      )}
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Utilisateurs du système</h3>
          <p className="text-sm text-gray-500">Gérez les comptes, les rôles et les affectations.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-all shadow-sm"
        >
          <UserPlus size={18} /> Nouveau compte
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">Utilisateur</th>
              <th className="px-6 py-4">Rôle</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
                      {user.username.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{user.nomComplet}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-tighter">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.service?.nom || <span className="text-gray-300 italic">Non assigné</span>}
                </td>
                <td className="px-6 py-4">
                  {user.actif ? 
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><Check size={14}/> Actif</span> :
                    <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><X size={14}/> Inactif</span>
                  }
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => user.id && handleDelete(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de création / édition */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Shield className="text-blue-600" size={20}/> 
                {editingUser ? 'Modifier le compte' : 'Créer un compte'}
              </h3>
              <button type="button" onClick={closeModal}><X size={20} className="text-gray-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom d'utilisateur (Login)</label>
                <input 
                  type="text" required
                  className="w-full border-gray-200 rounded-lg p-2.5 text-sm"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom complet</label>
                <input 
                  type="text" required
                  className="w-full border-gray-200 rounded-lg p-2.5 text-sm"
                  value={newUser.nomComplet}
                  onChange={e => setNewUser({...newUser, nomComplet: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                </label>
                <input 
                  type="password" required={!editingUser}
                  className="w-full border-gray-200 rounded-lg p-2.5 text-sm"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={newUser.isChef}
                  onChange={e => {
                    const isChef = e.target.checked;
                    const needsService = newUser.role === 'FONCTIONNAIRE' || newUser.role === 'RESPONSABLE' || isChef;
                    setNewUser({
                      ...newUser, 
                      isChef: isChef,
                      serviceId: needsService ? newUser.serviceId : undefined
                    });
                  }}
                />
                <label className="text-sm font-bold text-gray-700">Chef de service</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rôle</label>
                  <select 
                    className="w-full border-gray-200 rounded-lg p-2.5 text-sm"
                    value={newUser.role}
                    onChange={e => {
                      const newRole = e.target.value;
                      const needsService = newRole === 'FONCTIONNAIRE' || newRole === 'RESPONSABLE' || newUser.isChef;
                      setNewUser({
                        ...newUser, 
                        role: newRole as any,
                        serviceId: needsService ? newUser.serviceId : undefined
                      });
                    }}
                  >
                    <option value="AGENT">AGENT</option>
                    <option value="FONCTIONNAIRE">FONCTIONNAIRE</option>
                    <option value="RESPONSABLE">RESPONSABLE</option>
                    <option value="DIRECTEUR">DIRECTEUR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Service</label>
                  <select 
                    className={`w-full border-gray-200 rounded-lg p-2.5 text-sm ${!(newUser.role === 'FONCTIONNAIRE' || newUser.role === 'RESPONSABLE' || newUser.isChef) ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
                    value={newUser.serviceId || ''}
                    disabled={!(newUser.role === 'FONCTIONNAIRE' || newUser.role === 'RESPONSABLE' || newUser.isChef)}
                    onChange={e => setNewUser({...newUser, serviceId: e.target.value ? Number(e.target.value) : undefined})}
                  >
                    <option value="">Choisir...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all">Annuler</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-100 transition-all">
                {editingUser ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
