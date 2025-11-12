import React, { useEffect, useState } from "react";
import { paiementService } from "@/services/paiement.service";
import { clientService } from "@/services/client.service";
import { commandeService } from "@/services/commande.service";
import type { Paiement, Client, Commande } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";

const STATUTS = {
  en_attente: "En attente",
  complete: "Payé",
  echoue: "Échoué",
  rembourse: "Remboursé",
};

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger paiements, clients, commandes
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paiementData, clientData, commandeData] = await Promise.all([
        paiementService.getListe(),
        clientService.getListe(),
        commandeService.getListe(),
      ]);
      setPaiements(paiementData);
      setClients(clientData);
      setCommandes(commandeData);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des paiements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Supprimer un paiement
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de ce paiement ?")) return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      await paiementService.supprimer(id);
      fetchData();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  // Trouver le nom du client
  const getClientNom = (client_id: number) => {
    const c = clients.find((cl) => cl.id === client_id);
    return c ? `${c.prenom} ${c.nom}` : "-";
  };

  // Trouver la commande
  const getCommandeRef = (commande_id: number) => {
    return commandes.find((c) => c.id === commande_id)?.numero_commande || `#${commande_id}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des paiements</h1>
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
                <th className="py-2 px-3">Commande</th>
                <th className="py-2 px-3">Client</th>
                <th className="py-2 px-3">Montant</th>
                <th className="py-2 px-3">Statut</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paiements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucun paiement trouvé.</td>
                </tr>
              ) : (
                paiements.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3">{p.id}</td>
                    <td className="py-2 px-3">{getCommandeRef(p.commande_id)}</td>
                    <td className="py-2 px-3">{getClientNom(commandes.find((c) => c.id === p.commande_id)?.client_id || 0)}</td>
                    <td className="py-2 px-3">{LOCALE_CONFIG.formatPrice(p.montant)}</td>
                    <td className="py-2 px-3">{STATUTS[p.statut as keyof typeof STATUTS] || p.statut}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-red-600 hover:underline"
                        disabled={deleteLoading && deleteId === p.id}
                        onClick={() => handleDelete(p.id)}
                      >
                        {deleteLoading && deleteId === p.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
