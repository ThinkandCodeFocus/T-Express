"use client";
import React, { useEffect, useState } from "react";
import { stockService } from "@/services/stock.service";
import { produitService } from "@/services/produit.service";
import type { Stock, Produit } from "@/types/api.types";
import AdminErrorState from "@/components/Admin/AdminErrorState";

// Même seuil que le backend (AdminStockController, carte "stock faible" du
// dashboard) ; ne sert que si l'API ne renvoie pas déjà le statut.
const SEUIL_STOCK_FAIBLE = 10;

type NiveauStock = "rupture" | "faible" | "normal";

const niveauStock = (stock: Stock): NiveauStock => {
  if (stock.quantite <= 0) return "rupture";
  const faible = stock.statut ? stock.statut === "faible" : stock.quantite <= SEUIL_STOCK_FAIBLE;
  return faible ? "faible" : "normal";
};

const STYLE_NIVEAU: Record<NiveauStock, { ligne: string; quantite: string; badge?: { classe: string; libelle: string } }> = {
  rupture: {
    ligne: "bg-red-light-6",
    quantite: "text-red-dark",
    badge: { classe: "bg-red-light-4 text-red-dark", libelle: "Rupture" },
  },
  faible: {
    ligne: "bg-yellow-light-4",
    quantite: "text-yellow-dark-2",
    badge: { classe: "bg-yellow-light-2 text-yellow-dark-2", libelle: "Stock faible" },
  },
  normal: { ligne: "", quantite: "text-dark" },
};

export default function AdminStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<Stock | null>(null);
  const [form, setForm] = useState({ quantite: "" });
  const [saving, setSaving] = useState(false);
  const [aSurveillerSeulement, setASurveillerSeulement] = useState(false);

  // Charger stocks et produits
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stockData, prodData] = await Promise.all([
        stockService.getListe(),
        produitService.getListe(),
      ]);
      setStocks(stockData);
      setProduits(prodData);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des stocks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ouvrir le modal pour modifier
  const openModal = (stock: Stock) => {
    setEditStock(stock);
    setForm({ quantite: stock.quantite.toString() });
  };

  // Fermer le modal
  const closeModal = () => {
    setEditStock(null);
    setForm({ quantite: "" });
  };

  // Gérer le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sauvegarder la modification
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStock) return;
    setSaving(true);
    try {
      await stockService.update(editStock.id, parseInt(form.quantite));
      closeModal();
      fetchData();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  // Trouver le nom du produit
  const getProduitNom = (produit_id: number) => {
    return produits.find((p) => p.id === produit_id)?.nom || "-";
  };

  const nbRupture = stocks.filter((s) => niveauStock(s) === "rupture").length;
  const nbFaible = stocks.filter((s) => niveauStock(s) === "faible").length;
  const stocksAffiches = aSurveillerSeulement
    ? stocks.filter((s) => niveauStock(s) !== "normal")
    : stocks;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des stocks</h1>

      {!loading && !error && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-light-5 text-red-dark">
            {nbRupture} en rupture
          </span>
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-light-2 text-yellow-dark-2">
            {nbFaible} en stock faible (≤ {SEUIL_STOCK_FAIBLE})
          </span>
          <label className="flex items-center gap-2 text-sm text-dark cursor-pointer sm:ml-auto">
            <input
              type="checkbox"
              checked={aSurveillerSeulement}
              onChange={(e) => setASurveillerSeulement(e.target.checked)}
              className="w-4 h-4"
            />
            Afficher seulement les stocks à surveiller
          </label>
        </div>
      )}

      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <div>Chargement...</div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={fetchData} />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Produit</th>
                <th className="py-2 px-3">Quantité</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocksAffiches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    {aSurveillerSeulement ? "Aucun stock à surveiller." : "Aucun stock trouvé."}
                  </td>
                </tr>
              ) : (
                stocksAffiches.map((stock) => {
                  const style = STYLE_NIVEAU[niveauStock(stock)];
                  return (
                    <tr key={stock.id} className={`border-t border-gray-3 ${style.ligne}`}>
                      <td className="py-2 px-3">{stock.id}</td>
                      <td className="py-2 px-3">{stock.produit_nom || getProduitNom(stock.produit_id)}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${style.quantite}`}>{stock.quantite}</span>
                          {style.badge && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.badge.classe}`}>
                              {style.badge.libelle}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <button
                          className="text-blue hover:underline mr-2"
                          onClick={() => openModal(stock)}
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal modification stock */}
      {editStock && (
        <div className="fixed inset-0 bg-dark/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-dark-4 hover:text-dark"
              onClick={closeModal}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Modifier le stock</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Quantité disponible</label>
                <input
                  type="number"
                  name="quantite"
                  value={form.quantite}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue text-white px-4 py-2 rounded font-medium hover:bg-blue-dark transition disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
