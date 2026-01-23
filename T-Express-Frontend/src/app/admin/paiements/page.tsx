"use client";
import React, { useEffect, useState } from "react";
import { paiementService } from "@/services/paiement.service";
import type { Paiement } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import toast from "react-hot-toast";

const STATUT_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  succeeded: { bg: "bg-green-100", text: "text-green-800", label: "Payé ✓" },
  "validé": { bg: "bg-green-100", text: "text-green-800", label: "Payé ✓" },
  "complété": { bg: "bg-green-100", text: "text-green-800", label: "Payé ✓" },
  en_attente: { bg: "bg-yellow-100", text: "text-yellow-800", label: "En attente" },
  échoué: { bg: "bg-red-100", text: "text-red-800", label: "Échoué" },
  failed: { bg: "bg-red-100", text: "text-red-800", label: "Échoué" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-800", label: "Annulé" },
  rembourse: { bg: "bg-purple-100", text: "text-purple-800", label: "Remboursé" },
};

const METHODE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  wave: { icon: "📱", label: "Wave", color: "text-blue-600" },
  orange_money: { icon: "🟠", label: "Orange Money", color: "text-orange-600" },
  cash: { icon: "💵", label: "Espèces", color: "text-green-600" },
  carte: { icon: "💳", label: "Carte", color: "text-purple-600" },
};

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Par défaut, filtrer uniquement les paiements réussis (clients qui ont bien payé)
  // Le statut peut être "validé" (Wave) ou "succeeded"
  const [filters, setFilters] = useState({ statut: "validé", methode: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null);

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

  const getStatutStyle = (statut: string) => {
    const config = STATUT_CONFIG[statut?.toLowerCase()] || STATUT_CONFIG.en_attente;
    return config;
  };

  const getMethodeStyle = (methode: string) => {
    const config = METHODE_CONFIG[methode?.toLowerCase()] || { icon: "💰", label: methode || "Non défini", color: "text-gray-600" };
    return config;
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await paiementService.getDetail(id);
      setSelectedPaiement(detail);
    } catch (e: any) {
      toast.error("Erreur lors du chargement du détail");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Clients ayant payé</h1>
        <p className="text-dark-4">Liste des clients qui ont effectué un paiement avec succès</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Statut</label>
            <select
              value={filters.statut}
              onChange={(e) => { setFilters({ ...filters, statut: e.target.value }); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="validé">Payé avec succès ✓</option>
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="échoué">Échoué</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Méthode</label>
            <select
              value={filters.methode}
              onChange={(e) => { setFilters({ ...filters, methode: e.target.value }); setCurrentPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les méthodes</option>
              <option value="wave">Wave</option>
              <option value="orange_money">Orange Money</option>
              <option value="cash">Espèces</option>
              <option value="carte">Carte bancaire</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilters({ statut: "validé", methode: "" }); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchData()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 m-6">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchData} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commande</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Frais</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Méthode</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paiements.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-4xl mb-4">💳</span>
                          <p className="text-gray-500">Aucun paiement trouvé</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paiements.map((p) => {
                      const statutStyle = getStatutStyle(p.statut);
                      const methodeStyle = getMethodeStyle(p.methode);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-dark">#{p.id}</td>
                          <td className="px-6 py-4">
                            <span className="text-blue-600 font-medium">
                              #{p.commande_id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {p.commande?.client ? (
                              <div>
                                <p className="font-medium text-dark">{p.commande.client.prenom} {p.commande.client.nom}</p>
                                <p className="text-xs text-gray-500">{p.commande.client.email}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-dark">
                              {LOCALE_CONFIG.formatPrice(p.montant)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {p.frais_service ? LOCALE_CONFIG.formatPrice(p.frais_service) : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 ${methodeStyle.color}`}>
                              <span>{methodeStyle.icon}</span>
                              <span className="font-medium">{p.methode_display || methodeStyle.label}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statutStyle.bg} ${statutStyle.text}`}>
                              {p.statut_label || statutStyle.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500 font-mono">
                              {p.client_reference || p.reference_transaction || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {LOCALE_CONFIG.formatDate(p.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleViewDetail(p.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Précédent
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-gray-400">...</span>}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal détail */}
      {selectedPaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-dark">Détail du paiement #{selectedPaiement.id}</h2>
                <button
                  onClick={() => setSelectedPaiement(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatutStyle(selectedPaiement.statut).bg} ${getStatutStyle(selectedPaiement.statut).text}`}>
                    {selectedPaiement.statut_label || getStatutStyle(selectedPaiement.statut).label}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Méthode</p>
                  <p className="font-semibold">{selectedPaiement.methode_display || selectedPaiement.methode}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Montant de base</p>
                  <p className="font-bold text-lg">{LOCALE_CONFIG.formatPrice(selectedPaiement.montant)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Frais de service</p>
                  <p className="font-semibold">{selectedPaiement.frais_service ? LOCALE_CONFIG.formatPrice(selectedPaiement.frais_service) : "-"}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg col-span-2">
                  <p className="text-sm text-green-600 mb-1">Montant total</p>
                  <p className="font-bold text-2xl text-green-700">
                    {LOCALE_CONFIG.formatPrice(selectedPaiement.montant_total || selectedPaiement.montant)}
                  </p>
                </div>
              </div>

              {/* Informations du client */}
              {selectedPaiement.commande?.client && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-dark mb-3">👤 Informations du client</h3>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom complet :</span>
                      <span className="font-medium">{selectedPaiement.commande.client.prenom} {selectedPaiement.commande.client.nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email :</span>
                      <span className="font-medium">{selectedPaiement.commande.client.email}</span>
                    </div>
                    {selectedPaiement.commande.client.telephone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone :</span>
                        <span className="font-medium">{selectedPaiement.commande.client.telephone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Adresse de livraison/facturation */}
              {selectedPaiement.commande?.adresse_facturation && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-dark mb-3">📍 Adresse de livraison</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                    {selectedPaiement.commande.adresse_facturation.nom_complet && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destinataire :</span>
                        <span className="font-medium">{selectedPaiement.commande.adresse_facturation.nom_complet}</span>
                      </div>
                    )}
                    {selectedPaiement.commande.adresse_facturation.adresse_ligne_1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adresse :</span>
                        <span className="font-medium">{selectedPaiement.commande.adresse_facturation.adresse_ligne_1}</span>
                      </div>
                    )}
                    {selectedPaiement.commande.adresse_facturation.adresse_ligne_2 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Complément :</span>
                        <span className="font-medium">{selectedPaiement.commande.adresse_facturation.adresse_ligne_2}</span>
                      </div>
                    )}
                    {selectedPaiement.commande.adresse_facturation.ville && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ville :</span>
                        <span className="font-medium">{selectedPaiement.commande.adresse_facturation.ville}</span>
                      </div>
                    )}
                    {selectedPaiement.commande.adresse_facturation.code_postal && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code postal :</span>
                        <span className="font-medium">{selectedPaiement.commande.adresse_facturation.code_postal}</span>
                      </div>
                    )}
                    {selectedPaiement.commande.adresse_facturation.pays && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pays :</span>
                        <span className="font-medium">{selectedPaiement.commande.adresse_facturation.pays}</span>
                      </div>
                    )}
                    {selectedPaiement.commande.adresse_facturation.telephone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone (livraison) :</span>
                        <span className="font-medium">{selectedPaiement.commande.adresse_facturation.telephone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes de la commande */}
              {selectedPaiement.commande?.notes && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-dark mb-3">📝 Notes du client</h3>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-gray-700 italic">{selectedPaiement.commande.notes}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-dark mb-3">🔧 Informations techniques</h3>
                <div className="space-y-2 text-sm">
                  {selectedPaiement.client_reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Référence client :</span>
                      <span className="font-mono">{selectedPaiement.client_reference}</span>
                    </div>
                  )}
                  {selectedPaiement.reference_transaction && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID :</span>
                      <span className="font-mono">{selectedPaiement.reference_transaction}</span>
                    </div>
                  )}
                  {selectedPaiement.wave_session_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wave Session :</span>
                      <span className="font-mono text-xs">{selectedPaiement.wave_session_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date de création :</span>
                    <span>{LOCALE_CONFIG.formatDate(selectedPaiement.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedPaiement(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
