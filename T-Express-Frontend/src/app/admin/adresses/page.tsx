import React, { useEffect, useState } from "react";
import { adresseService } from "@/services/adresse.service";
import type { Adresse } from "@/types/api.types";

export default function AdminAdresses() {
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les adresses
  const fetchAdresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adresseService.getListeAdmin();
      setAdresses(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des adresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdresses();
  }, []);

  // Supprimer une adresse
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de cette adresse ?")) return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      await adresseService.supprimerAdmin(id);
      fetchAdresses();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des adresses</h1>
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
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Nom complet</th>
                <th className="py-2 px-3">Adresse</th>
                <th className="py-2 px-3">Ville</th>
                <th className="py-2 px-3">Pays</th>
                <th className="py-2 px-3">Téléphone</th>
                <th className="py-2 px-3">Par défaut</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adresses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4">Aucune adresse trouvée.</td>
                </tr>
              ) : (
                adresses.map((adresse) => (
                  <tr key={adresse.id}>
                    <td className="py-2 px-3">{adresse.id}</td>
                    <td className="py-2 px-3">{adresse.client_id}</td>
                    <td className="py-2 px-3">{adresse.type}</td>
                    <td className="py-2 px-3">{adresse.nom_complet}</td>
                    <td className="py-2 px-3">{adresse.adresse_ligne_1}{adresse.adresse_ligne_2 ? ", " + adresse.adresse_ligne_2 : ""}</td>
                    <td className="py-2 px-3">{adresse.ville}</td>
                    <td className="py-2 px-3">{adresse.pays}</td>
                    <td className="py-2 px-3">{adresse.telephone}</td>
                    <td className="py-2 px-3">{adresse.par_defaut ? "Oui" : "Non"}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-red-600 hover:underline"
                        disabled={deleteLoading && deleteId === adresse.id}
                        onClick={() => handleDelete(adresse.id)}
                      >
                        {deleteLoading && deleteId === adresse.id ? "Suppression..." : "Supprimer"}
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
