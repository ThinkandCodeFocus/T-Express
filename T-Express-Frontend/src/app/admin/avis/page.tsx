"use client";
import React, { useEffect, useState } from "react";
import { avisService } from "@/services/avis.service";
import type { Avis } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import toast from "react-hot-toast";

export default function AdminAvis() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ note: "", produit_id: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await avisService.getListe(
        currentPage,
        20,
        {
          note: filters.note ? parseInt(filters.note) : undefined,
          produit_id: filters.produit_id ? parseInt(filters.produit_id) : undefined,
        }
      );
      setAvis(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des avis.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de cet avis ?")) return;
    setDeleteId(id);
    try {
      await avisService.supprimer(id);
      toast.success("Avis supprimé avec succès");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
    }
  };

  const renderStars = (note: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < note ? 'text-yellow' : 'text-gray-4'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Gestion des avis</h1>
        <p className="text-dark-4">Modérez les avis clients sur vos produits</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-2 p-4 mb-6 border border-gray-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Filtrer par note</label>
            <select
              value={filters.note}
              onChange={(e) => setFilters({ ...filters, note: e.target.value })}
              className="w-full border border-gray-3 rounded-lg px-4 py-2"
            >
              <option value="">Toutes les notes</option>
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">ID Produit</label>
            <input
              type="number"
              value={filters.produit_id}
              onChange={(e) => setFilters({ ...filters, produit_id: e.target.value })}
              placeholder="Filtrer par produit"
              className="w-full border border-gray-3 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ note: "", produit_id: "" })}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Produit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Note</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Commentaire</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark-4 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {avis.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-dark-4">Aucun avis trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    avis.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-1 transition-colors">
                        <td className="px-6 py-4 font-semibold text-dark">{a.id}</td>
                        <td className="px-6 py-4 text-dark">
                          {a.client ? `${a.client.prenom} ${a.client.nom}` : `Client #${a.client_id}`}
                        </td>
                        <td className="px-6 py-4 text-dark">
                          {`Produit #${a.produit_id}`}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {renderStars(a.note)}
                            <span className="ml-2 font-semibold text-dark">{a.note}/5</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-dark-4 max-w-md">
                          <p className="truncate">{a.commentaire || "-"}</p>
                        </td>
                        <td className="px-6 py-4 text-dark-4 text-sm">
                          {LOCALE_CONFIG.formatDate(a.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(a.id)}
                            disabled={deleteId === a.id}
                            className="p-2 text-red hover:bg-red-light-6 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleteId === a.id ? (
                              <div className="w-5 h-5 border-2 border-red border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
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
