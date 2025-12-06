"use client";
import React, { useEffect, useState } from "react";
import { livraisonService } from "@/services/livraison.service";
import type { Livraison } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import toast from "react-hot-toast";

const STATUT_COLORS: Record<string, { bg: string; text: string }> = {
  en_preparation: { bg: "bg-yellow-light-4", text: "text-yellow-dark-2" },
  expediee: { bg: "bg-blue-light-5", text: "text-blue-dark" },
  en_transit: { bg: "bg-purple-100", text: "text-purple-700" },
  livree: { bg: "bg-green-light-6", text: "text-green-dark" },
  retournee: { bg: "bg-red-light-6", text: "text-red-dark" },
};

export default function AdminLivraisons() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ statut: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ statut: "", numero_suivi: "", date_livraison_prevue: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await livraisonService.getListe(
        currentPage,
        20,
        filters.statut || undefined
      );
      setLivraisons(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des livraisons.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const openEditModal = (livraison: Livraison) => {
    setEditId(livraison.id);
    setEditForm({
      statut: livraison.statut,
      numero_suivi: livraison.numero_suivi || "",
      date_livraison_prevue: livraison.date_livraison_prevue || "",
    });
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      await livraisonService.modifierStatut(
        editId,
        editForm.statut,
        editForm.numero_suivi || undefined,
        editForm.date_livraison_prevue || undefined
      );
      toast.success("Livraison modifiée avec succès");
      setEditId(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la modification.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Gestion des livraisons</h1>
        <p className="text-dark-4">Suivez et gérez toutes les livraisons</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-2 p-4 mb-6 border border-gray-3">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-dark mb-2">Filtrer par statut</label>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="w-full border border-gray-3 rounded-lg px-4 py-2"
            >
              <option value="">Tous les statuts</option>
              <option value="en_preparation">En préparation</option>
              <option value="expediee">Expédiée</option>
              <option value="en_transit">En transit</option>
              <option value="livree">Livrée</option>
              <option value="retournee">Retournée</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ statut: "" })}
              className="px-4 py-2 border border-gray-3 rounded-lg hover:bg-gray-1"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-2 border border-gray-3 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-light-5 border-t-blue rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-light-6 border-2 border-red-light-3 rounded-xl p-6 m-6">
            <p className="text-red-dark">{error}</p>
            <button onClick={fetchData} className="mt-4 bg-red text-white px-4 py-2 rounded-lg">
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-1 border-b border-gray-3">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Commande</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Numéro de suivi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Date prévue</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark-4 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {livraisons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-dark-4">Aucune livraison trouvée</p>
                      </td>
                    </tr>
                  ) : (
                    livraisons.map((l) => {
                      const statutColor = STATUT_COLORS[l.statut] || { bg: "bg-gray-3", text: "text-dark-4" };
                      return (
                        <tr key={l.id} className="hover:bg-gray-1 transition-colors">
                          <td className="px-6 py-4 font-semibold text-dark">{l.id}</td>
                          <td className="px-6 py-4 text-dark">
                            {l.commande?.numero_commande || `#${l.commande_id}`}
                          </td>
                          <td className="px-6 py-4 text-dark">
                            {l.commande?.client ? `${l.commande.client.prenom} ${l.commande.client.nom}` : `Client #${l.commande?.client_id}`}
                          </td>
                          <td className="px-6 py-4 text-dark-4">
                            {l.numero_suivi || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statutColor.bg} ${statutColor.text}`}>
                              {l.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-dark-4 text-sm">
                            {l.date_livraison_prevue ? LOCALE_CONFIG.formatDate(l.date_livraison_prevue) : "-"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openEditModal(l)}
                              className="p-2 text-blue hover:bg-blue-light-5 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-3 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-3 hover:bg-gray-1 disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="text-dark-4">Page {currentPage} sur {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-3 hover:bg-gray-1 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal modification */}
      {editId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-3 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Modifier la livraison</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Statut *</label>
                  <select
                    value={editForm.statut}
                    onChange={(e) => setEditForm({ ...editForm, statut: e.target.value })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3"
                  >
                    <option value="en_preparation">En préparation</option>
                    <option value="expediee">Expédiée</option>
                    <option value="en_transit">En transit</option>
                    <option value="livree">Livrée</option>
                    <option value="retournee">Retournée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Numéro de suivi</label>
                  <input
                    type="text"
                    value={editForm.numero_suivi}
                    onChange={(e) => setEditForm({ ...editForm, numero_suivi: e.target.value })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3"
                    placeholder="Ex: TRACK123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Date de livraison prévue</label>
                  <input
                    type="date"
                    value={editForm.date_livraison_prevue}
                    onChange={(e) => setEditForm({ ...editForm, date_livraison_prevue: e.target.value })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-3">
                <button
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 border border-gray-3 rounded-lg hover:bg-gray-1"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
