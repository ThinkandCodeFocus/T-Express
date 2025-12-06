"use client";
import React, { useEffect, useState } from "react";
import { stockService } from "@/services/stock.service";
import { produitService } from "@/services/produit.service";
import type { Stock, Produit } from "@/types/api.types";

export default function AdminStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<Stock | null>(null);
  const [form, setForm] = useState({ quantite: "" });
  const [saving, setSaving] = useState(false);

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des stocks</h1>
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
                <th className="py-2 px-3">Produit</th>
                <th className="py-2 px-3">Quantité</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">Aucun stock trouvé.</td>
                </tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock.id}>
                    <td className="py-2 px-3">{stock.id}</td>
                    <td className="py-2 px-3">{getProduitNom(stock.produit_id)}</td>
                    <td className="py-2 px-3">{stock.quantite}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => openModal(stock)}
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal modification stock */}
      {editStock && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={closeModal}
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
                  className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
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
