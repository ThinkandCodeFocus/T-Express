"use client";
import React, { useEffect, useState } from "react";
import { favoriService } from "@/services/favori.service";
import type { Favori } from "@/types/api.types";

export default function AdminFavoris() {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les favoris
  const fetchFavoris = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await favoriService.getListeAdmin();
      setFavoris(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des favoris.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoris();
  }, []);

  // Supprimer un favori
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de ce favori ?")) return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      await favoriService.supprimerAdmin(id);
      fetchFavoris();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des favoris</h1>
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
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {favoris.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">Aucun favori trouvé.</td>
                </tr>
              ) : (
                favoris.map((favori) => (
                  <tr key={favori.id}>
                    <td className="py-2 px-3">{favori.id}</td>
                    <td className="py-2 px-3">{favori.client_id}</td>
                    <td className="py-2 px-3">{favori.produit_id}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-red-600 hover:underline"
                        disabled={deleteLoading && deleteId === favori.id}
                        onClick={() => handleDelete(favori.id)}
                      >
                        {deleteLoading && deleteId === favori.id ? "Suppression..." : "Supprimer"}
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
