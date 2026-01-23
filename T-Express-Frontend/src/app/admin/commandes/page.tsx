"use client";
import React, { useEffect, useState } from "react";
import { commandeService } from "@/services/commande.service";
import type { Commande } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<Commande | null>(null);

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
      const detail = await commandeService.getDetail(id);
      setShowDetail(detail);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement du détail.");
    } finally {
      setLoading(false);
    }
  };

  // Fermer le détail
  const closeDetail = () => setShowDetail(null);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des commandes (Paiements réussis)</h1>
      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Client</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Montant</th>
                <th className="py-2 px-3">Paiement</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commandes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucune commande payée trouvée.</td>
                </tr>
              ) : (
                commandes.map((cmd) => (
                  <tr key={cmd.id}>
                    <td className="py-2 px-3">{cmd.id}</td>
                    <td className="py-2 px-3">
                      {cmd.client ? `${cmd.client.prenom} ${cmd.client.nom}` : `Client #${cmd.client_id}`}
                    </td>
                    <td className="py-2 px-3">{LOCALE_CONFIG.formatDate(cmd.created_at)}</td>
                    <td className="py-2 px-3">{LOCALE_CONFIG.formatPrice(cmd.montant_total)}</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Payé
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => handleShowDetail(cmd.id)}
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal détail commande */}
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={closeDetail}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Détail de la commande #{showDetail.id}</h2>
            <div className="mb-2">
              Client : {showDetail.client ? `${showDetail.client.prenom} ${showDetail.client.nom}` : `ID #${showDetail.client_id}`}
            </div>
            <div className="mb-2">Date : {LOCALE_CONFIG.formatDate(showDetail.created_at)}</div>
            <div className="mb-2">Montant : {LOCALE_CONFIG.formatPrice(showDetail.montant_total)}</div>
            <div className="mb-2">
              Paiement : <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Payé avec succès</span>
            </div>
            <div className="mb-2">Adresse livraison : {showDetail.adresse_livraison?.adresse_ligne_1}</div>
            <div className="mb-2">Adresse facturation : {showDetail.adresse_facturation?.adresse_ligne_1}</div>
            <div className="mb-2">Détails :</div>
            <ul className="list-disc pl-6">
              {showDetail.details?.map((d) => (
                <li key={d.id}>
                  {d.produit?.nom} x {d.quantite} — {LOCALE_CONFIG.formatPrice(d.prix_unitaire)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
