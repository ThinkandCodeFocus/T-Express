import React, { useEffect, useState } from "react";
import { retourService } from "@/services/retour.service";
import { clientService } from "@/services/client.service";
import { commandeService } from "@/services/commande.service";
import type { RetourCommande, Client, Commande } from "@/types/api.types";

const STATUTS: Record<string, string> = {
  en_attente: "En attente",
  demande: "En attente",
  valide: "Validé",
  approuve: "Validé",
  refuse: "Refusé",
  refusee: "Refusé",
  en_cours: "En cours",
  complete: "Terminé",
};

export default function AdminRetours() {
  const [retours, setRetours] = useState<RetourCommande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Charger retours, clients, commandes
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [retourData, clientData, commandeData] = await Promise.all([
        retourService.getListe(),
        clientService.getListe(),
        commandeService.getListe(),
      ]);
      setRetours(retourData);
      setClients(clientData);
      setCommandes(commandeData);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des retours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Valider/refuser un retour
  const handleAction = async (id: number, action: 'valider' | 'refuser') => {
    setActionId(id);
    setActionLoading(true);
    try {
      if (action === 'valider') {
        await retourService.valider(id);
      } else {
        await retourService.refuser(id);
      }
      fetchData();
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'action.");
    } finally {
      setActionId(null);
      setActionLoading(false);
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
      <h1 className="text-2xl font-bold mb-6">Gestion des retours</h1>
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
                <th className="py-2 px-3">Motif</th>
                <th className="py-2 px-3">Statut</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {retours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucun retour trouvé.</td>
                </tr>
              ) : (
                retours.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 px-3">{r.id}</td>
                    <td className="py-2 px-3">{getCommandeRef(r.commande_id)}</td>
                    <td className="py-2 px-3">{getClientNom(r.client_id)}</td>
                    <td className="py-2 px-3">{r.motif}</td>
                    <td className="py-2 px-3">{STATUTS[r.statut as keyof typeof STATUTS] || r.statut}</td>
                    <td className="py-2 px-3">
                      {["en_attente", "demande"].includes(r.statut) && (
                        <>
                          <button
                            className="text-blue-600 hover:underline mr-2"
                            disabled={actionLoading && actionId === r.id}
                            onClick={() => handleAction(r.id, 'valider')}
                          >
                            {actionLoading && actionId === r.id ? "Validation..." : "Valider"}
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            disabled={actionLoading && actionId === r.id}
                            onClick={() => handleAction(r.id, 'refuser')}
                          >
                            {actionLoading && actionId === r.id ? "Refus..." : "Refuser"}
                          </button>
                        </>
                      )}
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
