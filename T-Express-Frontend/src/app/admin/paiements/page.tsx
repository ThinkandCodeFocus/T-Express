"use client";
import React, { useEffect, useState } from "react";
import { paiementService } from "@/services/paiement.service";
import type { Paiement } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import toast from "react-hot-toast";

const STATUT_COLORS: Record<string, { bg: string; text: string }> = {
  en_attente: { bg: "bg-yellow-light-4", text: "text-yellow-dark-2" },
  complete: { bg: "bg-green-light-6", text: "text-green-dark" },
  echoue: { bg: "bg-red-light-6", text: "text-red-dark" },
  rembourse: { bg: "bg-purple-100", text: "text-purple-700" },
};

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ statut: "", methode: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paiementService.getListe(
        currentPage,
        20,
        {
          statut: filters.statut || undefined,
          methode: filters.methode || undefined,
        }
      );
      setPaiements(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des paiements.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const handleChangeStatut = async (id: number, statut: string) => {
    try {
      await paiementService.modifierStatut(id, statut);
      toast.success("Statut modifié avec succès");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la modification.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Gestion des paiements</h1>
        <p className="text-dark-4">Suivez et gérez tous les paiements</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-2 p-4 mb-6 border border-gray-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Statut</label>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="w-full border border-gray-3 rounded-lg px-4 py-2"
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="complete">Complété</option>
              <option value="echoue">Échoué</option>
              <option value="rembourse">Remboursé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Méthode</label>
            <input
              type="text"
              value={filters.methode}
              onChange={(e) => setFilters({ ...filters, methode: e.target.value })}
              placeholder="Wave, Orange Money..."
              className="w-full border border-gray-3 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ statut: "", methode: "" })}
              className="w-full px-4 py-2 border border-gray-3 rounded-lg hover:bg-gray-1"
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Montant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Méthode</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark-4 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {paiements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="text-dark-4">Aucun paiement trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    paiements.map((p) => {
                      const statutColor = STATUT_COLORS[p.statut] || { bg: "bg-gray-3", text: "text-dark-4" };
                      return (
                        <tr key={p.id} className="hover:bg-gray-1 transition-colors">
                          <td className="px-6 py-4 font-semibold text-dark">{p.id}</td>
                          <td className="px-6 py-4 text-dark">
                            {p.commande?.numero_commande || `#${p.commande_id}`}
                          </td>
                          <td className="px-6 py-4 text-dark">
                            {p.commande?.client ? `${p.commande.client.prenom} ${p.commande.client.nom}` : `Client #${p.commande?.client_id}`}
                          </td>
                          <td className="px-6 py-4 font-bold text-dark">
                            {LOCALE_CONFIG.formatPrice(p.montant)}
                          </td>
                          <td className="px-6 py-4 text-dark-4">
                            {p.methode_paiement || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={p.statut}
                              onChange={(e) => handleChangeStatut(p.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${statutColor.bg} ${statutColor.text}`}
                            >
                              <option value="en_attente">En attente</option>
                              <option value="complete">Complété</option>
                              <option value="echoue">Échoué</option>
                              <option value="rembourse">Remboursé</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-dark-4 text-sm">
                            {LOCALE_CONFIG.formatDate(p.date_paiement || p.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className="p-2 text-blue hover:bg-blue-light-5 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
    </div>
  );
}
