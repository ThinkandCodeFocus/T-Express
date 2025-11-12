import React, { useEffect, useState } from "react";
import { livraisonService } from "@/services/livraison.service";
import { clientService } from "@/services/client.service";
import { commandeService } from "@/services/commande.service";
import type { Livraison, Client, Commande } from "@/types/api.types";

const STATUTS = [
  { value: "en_attente", label: "En attente" },
  { value: "en_cours", label: "En cours" },
  { value: "livree", label: "Livrée" },
  { value: "echouee", label: "Échouée" },
];

export default function AdminLivraisons() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Charger livraisons, clients, commandes
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [livraisonData, clientData, commandeData] = await Promise.all([
        livraisonService.getListe(),
        clientService.getListe(),
        commandeService.getListe(),
      ]);
      setLivraisons(livraisonData);
      setClients(clientData);
      setCommandes(commandeData);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des livraisons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modifier le statut
  const handleUpdateStatus = async (id: number, statut: string) => {
    setUpdating(true);
    try {
      await livraisonService.update(id, statut);
      fetchData();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdating(false);
    }
  };

  // Trouver le nom du client
  const getClientNom = (commande_id: number) => {
    const commande = commandes.find((c) => c.id === commande_id);
    if (!commande) return "-";
    const client = clients.find((cl) => cl.id === commande.client_id);
    return client ? `${client.prenom} ${client.nom}` : "-";
  };

  // Trouver l'adresse de livraison
  const getAdresse = (commande_id: number) => {
    const commande = commandes.find((c) => c.id === commande_id);
    return commande?.adresse_livraison?.adresse_ligne_1 || "-";
  };

  // Trouver la référence commande
  const getCommandeRef = (commande_id: number) => {
    return commandes.find((c) => c.id === commande_id)?.numero_commande || `#${commande_id}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des livraisons</h1>
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
                <th className="py-2 px-3">Adresse</th>
                <th className="py-2 px-3">Statut</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {livraisons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucune livraison trouvée.</td>
                </tr>
              ) : (
                livraisons.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 px-3">{l.id}</td>
                    <td className="py-2 px-3">{getCommandeRef(l.commande_id)}</td>
                    <td className="py-2 px-3">{getClientNom(l.commande_id)}</td>
                    <td className="py-2 px-3">{getAdresse(l.commande_id)}</td>
                    <td className="py-2 px-3">
                      <select
                        value={l.statut}
                        onChange={(e) => handleUpdateStatus(l.id, e.target.value)}
                        disabled={updating}
                        className="border rounded px-2 py-1"
                      >
                        {STATUTS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">-</td>
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
