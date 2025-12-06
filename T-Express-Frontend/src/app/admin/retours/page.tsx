"use client";
import React, { useEffect, useState } from "react";
import { retourService } from "@/services/retour.service";
import type { RetourCommande } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import toast from "react-hot-toast";

const STATUT_COLORS: Record<string, { bg: string; text: string }> = {
  en_attente: { bg: "bg-yellow-light-4", text: "text-yellow-dark-2" },
  approuve: { bg: "bg-green-light-6", text: "text-green-dark" },
  refuse: { bg: "bg-red-light-6", text: "text-red-dark" },
};

export default function AdminRetours() {
  const [retours, setRetours] = useState<RetourCommande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [showRefuseModal, setShowRefuseModal] = useState<number | null>(null);
  const [raisonRefus, setRaisonRefus] = useState("");
  const [filters, setFilters] = useState({ statut: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await retourService.getListe(
        currentPage,
        20,
        filters.statut || undefined
      );
      setRetours(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des retours.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const handleApprouver = async (id: number) => {
    setActionId(id);
    try {
      await retourService.approuver(id);
      toast.success("Retour approuvé avec succès");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'approbation.");
    } finally {
      setActionId(null);
    }
  };

  const handleRefuser = async (id: number) => {
    setActionId(id);
    try {
      await retourService.refuser(id, raisonRefus);
      toast.success("Retour refusé");
      setShowRefuseModal(null);
      setRaisonRefus("");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du refus.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Gestion des retours</h1>
        <p className="text-dark-4">Gérez les demandes de retour de vos clients</p>
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
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvé</option>
              <option value="refuse">Refusé</option>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Date demande</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark-4 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {retours.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-dark-4">Aucun retour trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    retours.map((r) => {
                      const statutColor = STATUT_COLORS[r.statut] || { bg: "bg-gray-3", text: "text-dark-4" };
                      return (
                        <tr key={r.id} className="hover:bg-gray-1 transition-colors">
                          <td className="px-6 py-4 font-semibold text-dark">{r.id}</td>
                          <td className="px-6 py-4 text-dark">
                            {r.commande?.numero_commande || `#${r.commande_id}`}
                          </td>
                          <td className="px-6 py-4 text-dark">
                            {r.commande?.client ? `${r.commande.client.prenom} ${r.commande.client.nom}` : `Client #${r.commande?.client_id}`}
                          </td>
                          <td className="px-6 py-4 text-dark-4">
                            {LOCALE_CONFIG.formatDate(r.date_demande || r.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statutColor.bg} ${statutColor.text}`}>
                              {r.statut === 'en_attente' ? 'En attente' : r.statut === 'approuve' ? 'Approuvé' : 'Refusé'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {r.statut === 'en_attente' && (
                                <>
                                  <button
                                    onClick={() => handleApprouver(r.id)}
                                    disabled={actionId === r.id}
                                    className="px-4 py-2 bg-green text-white rounded-lg hover:bg-green-dark disabled:opacity-50 text-sm font-medium"
                                  >
                                    {actionId === r.id ? "..." : "Approuver"}
                                  </button>
                                  <button
                                    onClick={() => setShowRefuseModal(r.id)}
                                    disabled={actionId === r.id}
                                    className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-dark disabled:opacity-50 text-sm font-medium"
                                  >
                                    Refuser
                                  </button>
                                </>
                              )}
                            </div>
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

      {/* Modal refus */}
      {showRefuseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-3 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Refuser le retour</h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-dark mb-2">Raison du refus (optionnel)</label>
                <textarea
                  value={raisonRefus}
                  onChange={(e) => setRaisonRefus(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-3 rounded-lg px-4 py-3"
                  placeholder="Expliquez pourquoi ce retour est refusé..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRefuseModal(null);
                    setRaisonRefus("");
                  }}
                  className="px-4 py-2 border border-gray-3 rounded-lg hover:bg-gray-1"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleRefuser(showRefuseModal)}
                  disabled={actionId === showRefuseModal}
                  className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-dark disabled:opacity-50"
                >
                  {actionId === showRefuseModal ? "..." : "Confirmer le refus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
