import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Check, X, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  referenceService,
  ReferenceItem,
  ReferenceCategorie,
  CATEGORIE_LABELS,
  ALL_CATEGORIES,
} from '../../services/referenceService';

const PAGE_SIZE = 20;
const HAS_DESCRIPTION = (cat: ReferenceCategorie) => cat === 'AFFECTATION';

export const ReferencesManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('categorie') as ReferenceCategorie) || ALL_CATEGORIES[0];

  const [items, setItems]     = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage]       = useState(1);

  // Formulaire d'ajout
  const [newValeur,       setNewValeur]       = useState('');
  const [newDescription,  setNewDescription]  = useState('');
  const [addLoading,      setAddLoading]      = useState(false);

  // Édition inline
  const [editId,          setEditId]          = useState<number | null>(null);
  const [editValeur,      setEditValeur]       = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading,     setEditLoading]     = useState(false);

  // Suppression
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const withDesc = HAS_DESCRIPTION(activeTab);
  const colSpan  = withDesc ? 4 : 3;

  // ── Données paginées ───────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const pageItems   = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const globalIndex = (i: number) => (safePage - 1) * PAGE_SIZE + i + 1;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await referenceService.getByCategorie(activeTab);
      setItems(data);
    } catch {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
    setNewValeur('');
    setNewDescription('');
    setEditId(null);
    setSuccess(null);
    setPage(1);
  }, [fetchItems]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  // ── Ajout ─────────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValeur.trim()) return;
    setAddLoading(true);
    setError(null);
    try {
      const created = await referenceService.create(
        activeTab,
        newValeur.trim(),
        withDesc ? newDescription.trim() || undefined : undefined,
      );
      setItems(prev => [...prev, created]);
      setNewValeur('');
      setNewDescription('');
      showSuccess('Valeur ajoutée avec succès.');
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erreur lors de l'ajout.");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Édition ───────────────────────────────────────────────────────────────
  const startEdit = (item: ReferenceItem) => {
    setEditId(item.id);
    setEditValeur(item.valeur);
    setEditDescription(item.description || '');
  };

  const cancelEdit = () => { setEditId(null); setEditValeur(''); setEditDescription(''); };

  const handleEdit = async (id: number) => {
    if (!editValeur.trim()) return;
    setEditLoading(true);
    setError(null);
    try {
      const updated = await referenceService.update(
        id,
        editValeur.trim(),
        withDesc ? editDescription.trim() || undefined : undefined,
      );
      setItems(prev => prev.map(it => it.id === id ? updated : it));
      setEditId(null);
      showSuccess('Valeur modifiée avec succès.');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erreur lors de la modification.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await referenceService.delete(id);
      setItems(prev => prev.filter(it => it.id !== id));
      setDeleteId(null);
      showSuccess('Valeur supprimée.');
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-1">Gestion des références</h1>
      <p className="text-sm text-gray-500 mb-6">
        Gérez les listes de valeurs utilisées dans les formulaires adhérents.
      </p>

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSearchParams({ categorie: cat })}
            className={`px-4 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
              activeTab === cat
                ? 'border-blue-600 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {CATEGORIE_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Alertes */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md mb-4">
          <Check size={16} /> {success}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newValeur}
          onChange={e => setNewValeur(e.target.value)}
          placeholder={`Valeur...`}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {withDesc && (
          <input
            type="text"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="Description (optionnelle)..."
            className="flex-[2] border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <button
          type="submit"
          disabled={addLoading || !newValeur.trim()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {addLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Ajouter
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 w-12">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Valeur</th>
              {withDesc && <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>}
              <th className="text-right px-4 py-3 font-semibold text-gray-600 w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-10 text-gray-400">
                  <Loader2 size={20} className="animate-spin inline mr-2" />
                  Chargement...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-10 text-gray-400 text-sm">
                  Aucune valeur. Ajoutez la première via le formulaire ci-dessus.
                </td>
              </tr>
            ) : (
              pageItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{globalIndex(idx)}</td>

                  {/* Colonne Valeur */}
                  <td className="px-4 py-3">
                    {editId === item.id ? (
                      <input
                        autoFocus
                        value={editValeur}
                        onChange={e => setEditValeur(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Escape') cancelEdit(); }}
                        className="border border-blue-400 rounded-md px-2 py-1 text-sm w-full max-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{item.valeur}</span>
                    )}
                  </td>

                  {/* Colonne Description (AFFECTATION seulement) */}
                  {withDesc && (
                    <td className="px-4 py-3 text-gray-500">
                      {editId === item.id ? (
                        <input
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Escape') cancelEdit(); }}
                          placeholder="Description..."
                          className="border border-blue-400 rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-xs">{item.description || <span className="text-gray-300 italic">—</span>}</span>
                      )}
                    </td>
                  )}

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    {editId === item.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item.id)}
                          disabled={editLoading}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                          title="Confirmer"
                        >
                          {editLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md" title="Annuler">
                          <X size={14} />
                        </button>
                      </div>
                    ) : deleteId === item.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-red-600 mr-1">Confirmer ?</span>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md" title="Oui">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setDeleteId(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md" title="Annuler">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="Modifier">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer : total + pagination */}
        {!loading && items.length > 0 && (
          <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-400">
              {items.length} valeur{items.length > 1 ? 's' : ''} — {CATEGORIE_LABELS[activeTab]}
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-6 h-6 rounded text-xs font-semibold ${
                      p === safePage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
