import React, { useEffect, useState } from "react";
import { avisService } from "@/services/avis.service";
import { produitService } from "@/services/produit.service";
import { clientService } from "@/services/client.service";
import type { Avis, Produit, Client } from "@/types/api.types";

export default function AdminAvis() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger avis, produits, clients
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [avisData, prodData, clientData] = await Promise.all([
        avisService.getListe(),
        produitService.getListe(),
        clientService.getListe(),
      ]);
      setAvis(avisData);
      setProduits(prodData);
      setClients(clientData);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des avis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Supprimer un avis
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de cet avis ?")) return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      await avisService.supprimer(id);
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

  // Trouver le nom du produit
  const getProduitNom = (produit_id: number) => {
    return produits.find((p) => p.id === produit_id)?.nom || "-";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des avis</h1>
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
                <th className="py-2 px-3">Produit</th>
                <th className="py-2 px-3">Note</th>
                <th className="py-2 px-3">Commentaire</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {avis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucun avis trouvé.</td>
                </tr>
              ) : (
                avis.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 px-3">{a.id}</td>
                    <td className="py-2 px-3">{getClientNom(a.client_id)}</td>
                    <td className="py-2 px-3">{getProduitNom(a.produit_id)}</td>
                    <td className="py-2 px-3">{a.note}/5</td>
                    <td className="py-2 px-3">{a.commentaire}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-red-600 hover:underline"
                        disabled={deleteLoading && deleteId === a.id}
                        onClick={() => handleDelete(a.id)}
                      >
                        {deleteLoading && deleteId === a.id ? "Suppression..." : "Supprimer"}
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
