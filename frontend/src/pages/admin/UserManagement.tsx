import React, { useState, useEffect, useRef } from 'react';
import { adminService, UserDetail } from '../../services/adminService';
import { serviceService, Service } from '../../services/serviceService';
import { referenceService } from '../../services/referenceService';
import { UserPlus, Check, X, Shield, Edit2, Trash2, Wifi, WifiOff, Coffee, Users, Calendar } from 'lucide-react';

// ─── Présence badge ───────────────────────────────────────────────────────────
const PRESENCE_CFG: Record<string, { label: string; dot: string; text: string; bg: string; icon: React.ReactNode }> = {
  EN_LIGNE:    { label: 'En ligne',    dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  icon: <Wifi      size={11}/> },
  EN_PAUSE:    { label: 'En pause',    dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',    icon: <Coffee    size={11}/> },
  REUNION:     { label: 'Réunion',     dot: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50',     icon: <Users     size={11}/> },
  CONGE:       { label: 'Congé',       dot: 'bg-gray-400',    text: 'text-gray-500',    bg: 'bg-gray-100',    icon: <Calendar  size={11}/> },
  HORS_LIGNE:  { label: 'Hors ligne',  dot: 'bg-gray-300',    text: 'text-gray-400',    bg: 'bg-gray-50',     icon: <WifiOff   size={11}/> },
};

const PresenceBadge: React.FC<{ statut?: string }> = ({ statut }) => {
  const cfg = PRESENCE_CFG[statut ?? 'HORS_LIGNE'] ?? PRESENCE_CFG.HORS_LIGNE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${statut === 'EN_LIGNE' ? 'animate-pulse' : ''}`} />
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    // Rafraîchissement auto toutes les 15s pour voir les statuts en temps réel
    intervalRef.current = setInterval(() => {
      adminService.getUsers().then(u => setUsers(u)).catch(() => {});
    }, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const loadData = async () => {
    try {
      const [u, s] = await Promise.all([
        adminService.getUsers(),
        serviceService.getAll(),
      ]);
      setUsers(u);
      setServices(s);
      setError(null);
    } catch (err) {
      console.error("API Error:", err);
      setError("Erreur de chargement des données");
    }
    // Chargement des rôles séparé pour ne pas bloquer la page
    referenceService.getByCategorie('ROLE')
      .then(refs => setRoles(refs.map(r => r.valeur)))
      .catch(() => setRoles(['AGENT','FONCTIONNAIRE','RESPONSABLE','DIRECTEUR','ADMIN']));
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
              <th className="px-6 py-4">Compte</th>
              <th className="px-6 py-4">Présence</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase text-white relative
                      ${user.statutPresence === 'EN_LIGNE' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                      {user.username.substring(0, 2)}
                      {/* dot de présence */}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white
                        ${user.statutPresence === 'EN_LIGNE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
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
                  {user.actif
                    ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><Check size={14}/> Actif</span>
                    : <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><X size={14}/> Inactif</span>
                  }
                </td>
                <td className="px-6 py-4">
                  <PresenceBadge statut={user.statutPresence} />
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
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isChef"
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
                  <label htmlFor="isChef" className="text-sm font-bold text-gray-700">Chef de service</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={newUser.actif}
                    onChange={e => setNewUser({ ...newUser, actif: e.target.checked })}
                  />
                  <label htmlFor="actif" className="text-sm font-bold text-gray-700">Compte actif</label>
                </div>
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
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
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
