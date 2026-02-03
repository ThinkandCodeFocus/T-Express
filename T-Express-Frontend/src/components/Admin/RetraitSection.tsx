"use client";
import React, { useEffect, useState } from "react";
import { retraitService, Retrait, SoldeInfo } from "@/services/retrait.service";
import { LOCALE_CONFIG } from "@/config/api.config";

const STATUT_STYLES: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  confirmé: { label: "Confirmé", color: "bg-green-100 text-green-800" },
  refusé: { label: "Refusé", color: "bg-red-100 text-red-800" },
};

export default function RetraitSection() {
  const [solde, setSolde] = useState<SoldeInfo | null>(null);
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [montant, setMontant] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [soldeData, retraitsData] = await Promise.all([
        retraitService.getSolde(),
        retraitService.liste(),
      ]);
      setSolde(soldeData);
      setRetraits(retraitsData);
    } catch (err: any) {
      console.error("Erreur chargement données:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum < 1000) {
      setError("Le montant minimum est de 1 000 FCFA");
      return;
    }

    if (solde && montantNum > solde.solde_disponible) {
      setError(`Solde insuffisant. Disponible: ${LOCALE_CONFIG.formatPrice(solde.solde_disponible)}`);
      return;
    }

    try {
      setSubmitting(true);
      await retraitService.creer(montantNum, note || undefined);
      setSuccess("Demande de retrait envoyée avec succès");
      setMontant("");
      setNote("");
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la demande");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnuler = async (id: number) => {
    if (!confirm("Voulez-vous annuler cette demande de retrait ?")) return;

    try {
      await retraitService.annuler(id);
      setSuccess("Demande annulée");
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carte Solde */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">💰 Votre Solde</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total des ventes</p>
            <p className="text-2xl font-bold text-gray-900">{LOCALE_CONFIG.formatPrice(solde?.total_ventes || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Retraits effectués</p>
            <p className="text-2xl font-bold text-gray-900">{LOCALE_CONFIG.formatPrice(solde?.total_retraits || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">{LOCALE_CONFIG.formatPrice(solde?.retraits_en_attente || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Disponible</p>
            <p className="text-2xl font-bold text-green-600">{LOCALE_CONFIG.formatPrice(solde?.solde_disponible || 0)}</p>
          </div>
        </div>
      </div>

      {/* Formulaire de demande */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📤 Demander un retrait</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (FCFA) *
            </label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              min="1000"
              step="100"
              placeholder="Ex: 50000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 1 000 FCFA</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optionnel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Informations supplémentaires..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !solde || solde.solde_disponible < 1000}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Envoi en cours..." : "Demander le retrait"}
          </button>
        </form>
      </div>

      {/* Historique des retraits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Historique des demandes</h2>

        {retraits.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucune demande de retrait</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {retraits.map((retrait) => {
                  const style = STATUT_STYLES[retrait.statut] || { label: retrait.statut, color: "bg-gray-100" };
                  return (
                    <tr key={retrait.id}>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(retrait.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {LOCALE_CONFIG.formatPrice(retrait.montant)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.color}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {retrait.note || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {retrait.statut === "en_attente" && (
                          <button
                            onClick={() => handleAnnuler(retrait.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Annuler
                          </button>
                        )}
                        {retrait.statut === "confirmé" && retrait.date_confirmation && (
                          <span className="text-xs text-gray-500">
                            Confirmé le {new Date(retrait.date_confirmation).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
