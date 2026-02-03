"use client";
import React, { useEffect, useState } from "react";
import { commandeService } from "@/services/commande.service";
import type { Commande, CommandeStatut } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";

// Valeurs exactes de l'ENUM dans la table commandes
const STATUTS_COMMANDE = [
  { value: "En attente", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "Validée", label: "Validée", color: "bg-blue-100 text-blue-800" },
  { value: "Préparation", label: "En préparation", color: "bg-orange-100 text-orange-800" },
  { value: "Expédiée", label: "Expédiée", color: "bg-purple-100 text-purple-800" },
  { value: "Livrée", label: "Livrée", color: "bg-green-100 text-green-800" },
  { value: "Annulée", label: "Annulée", color: "bg-red-100 text-red-800" },
];

// Valeurs de l'ENUM dans la table paiements
const STATUTS_PAIEMENT: Record<string, { label: string; color: string }> = {
  "en_attente": { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  "En attente": { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  "validé": { label: "Payé", color: "bg-green-100 text-green-800" },
  "Complété": { label: "Payé", color: "bg-green-100 text-green-800" },
  "Accepté": { label: "Payé", color: "bg-green-100 text-green-800" },
  "échoué": { label: "Échoué", color: "bg-red-100 text-red-800" },
  "Refusé": { label: "Refusé", color: "bg-red-100 text-red-800" },
};

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<Commande | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Charger les commandes
  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commandeService.getListe();
      setCommandes(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  // Voir le détail d'une commande
  const handleShowDetail = async (id: number) => {
    setLoading(true);
    try {
      const detail = await commandeService.getDetailAdmin(id);
      setShowDetail(detail);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement du détail.");
    } finally {
      setLoading(false);
    }
  };

  // Fermer le détail
  const closeDetail = () => setShowDetail(null);

  // Changer le statut d'une commande
  const handleStatusChange = async (commandeId: number, newStatut: string) => {
    setUpdatingStatus(commandeId);
    try {
      await commandeService.updateStatus(commandeId, newStatut);
      // Mettre à jour localement
      setCommandes(prev => 
        prev.map(cmd => 
          cmd.id === commandeId ? { ...cmd, statut: newStatut as CommandeStatut } : cmd
        )
      );
      // Si le modal est ouvert, mettre à jour aussi
      if (showDetail?.id === commandeId) {
        setShowDetail(prev => prev ? { ...prev, statut: newStatut as CommandeStatut } : null);
      }
    } catch (e: any) {
      alert(e.message || "Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Obtenir le style du statut de commande
  const getStatutCommandeStyle = (statut: string) => {
    const found = STATUTS_COMMANDE.find(s => s.value === statut);
    return found?.color || "bg-gray-100 text-gray-800";
  };

  // Obtenir le style du statut de paiement
  const getStatutPaiementStyle = (statut?: string) => {
    if (!statut) return { label: "N/A", color: "bg-gray-100 text-gray-800" };
    return STATUTS_PAIEMENT[statut] || { label: statut, color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des commandes</h1>
      
      <div className="bg-white rounded shadow p-6">
        {loading && !commandes.length ? (
          <div className="text-center py-8">Chargement...</div>
        ) : error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-3 font-semibold">ID</th>
                  <th className="py-3 px-3 font-semibold">Client</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold">Montant</th>
                  <th className="py-3 px-3 font-semibold">Paiement</th>
                  <th className="py-3 px-3 font-semibold">Statut commande</th>
                  <th className="py-3 px-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commandes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                ) : (
                  commandes.map((cmd) => {
                    const paiementStyle = getStatutPaiementStyle(cmd.paiement?.statut);
                    return (
                      <tr key={cmd.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 font-medium">#{cmd.id}</td>
                        <td className="py-3 px-3">
                          {cmd.client ? `${cmd.client.prenom} ${cmd.client.nom}` : `Client #${cmd.client_id}`}
                        </td>
                        <td className="py-3 px-3">{LOCALE_CONFIG.formatDate(cmd.created_at)}</td>
                        <td className="py-3 px-3 font-medium">{LOCALE_CONFIG.formatPrice(cmd.montant_total)}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paiementStyle.color}`}>
                            {paiementStyle.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={cmd.statut}
                            onChange={(e) => handleStatusChange(cmd.id, e.target.value)}
                            disabled={updatingStatus === cmd.id}
                            className={`text-xs font-medium rounded-lg px-2 py-1.5 border cursor-pointer ${getStatutCommandeStyle(cmd.statut)}`}
                          >
                            {STATUTS_COMMANDE.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          {updatingStatus === cmd.id && (
                            <span className="ml-2 text-xs text-gray-500">...</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            className="text-blue-600 hover:underline text-sm"
                            onClick={() => handleShowDetail(cmd.id)}
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détail commande */}
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Commande #{showDetail.id}</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl"
                onClick={closeDetail}
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Infos client */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Client</h3>
                <p>{showDetail.client ? `${showDetail.client.prenom} ${showDetail.client.nom}` : `ID #${showDetail.client_id}`}</p>
                {showDetail.client?.email && <p className="text-sm text-gray-600">{showDetail.client.email}</p>}
                {showDetail.client?.telephone && <p className="text-sm text-gray-600">{showDetail.client.telephone}</p>}
              </div>

              {/* Statuts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Statut commande</h3>
                  <select
                    value={showDetail.statut}
                    onChange={(e) => handleStatusChange(showDetail.id, e.target.value)}
                    disabled={updatingStatus === showDetail.id}
                    className={`text-sm font-medium rounded-lg px-3 py-2 border w-full ${getStatutCommandeStyle(showDetail.statut)}`}
                  >
                    {STATUTS_COMMANDE.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Paiement</h3>
                  <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getStatutPaiementStyle(showDetail.paiement?.statut).color}`}>
                    {getStatutPaiementStyle(showDetail.paiement?.statut).label}
                  </span>
                  {showDetail.paiement?.methode && (
                    <p className="text-sm text-gray-600 mt-1">Mode: {showDetail.paiement.methode}</p>
                  )}
                </div>
              </div>

              {/* Infos commande */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Informations</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-600">Date:</span> {LOCALE_CONFIG.formatDate(showDetail.created_at)}</p>
                  <p><span className="text-gray-600">Montant:</span> <strong>{LOCALE_CONFIG.formatPrice(showDetail.montant_total)}</strong></p>
                </div>
              </div>

              {/* Adresses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                  <p className="text-sm">{showDetail.adresse_livraison?.adresse_ligne_1 || "Non définie"}</p>
                  {showDetail.adresse_livraison?.ville && (
                    <p className="text-sm text-gray-600">{showDetail.adresse_livraison.ville}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Adresse de facturation</h3>
                  <p className="text-sm">{showDetail.adresse_facturation?.adresse_ligne_1 || "Non définie"}</p>
                  {showDetail.adresse_facturation?.ville && (
                    <p className="text-sm text-gray-600">{showDetail.adresse_facturation.ville}</p>
                  )}
                </div>
              </div>

              {/* Articles */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Articles commandés</h3>
                <div className="space-y-2">
                  {showDetail.details?.map((d) => (
                    <div key={d.id} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div>
                        <p className="font-medium">{d.produit?.nom || `Produit #${d.produit_id}`}</p>
                        <p className="text-sm text-gray-600">Quantité: {d.quantite}</p>
                      </div>
                      <p className="font-medium">{LOCALE_CONFIG.formatPrice(d.prix_unitaire * d.quantite)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
