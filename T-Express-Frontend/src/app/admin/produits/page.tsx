import React, { useEffect, useState } from "react";
import { produitService } from "@/services/produit.service";
import { categorieService } from "@/services/categorie.service";
import type { Produit, Categorie } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";

export default function AdminProduits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editProduit, setEditProduit] = useState<Produit | null>(null);
  const [form, setForm] = useState({ nom: "", prix: "", categorie_id: "", stock: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger produits et catégories
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, catData] = await Promise.all([
        produitService.getListe(),
        categorieService.getListe(),
      ]);
      setProduits(prodData);
      setCategories(catData);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ouvrir le modal pour ajouter/modifier
  const openModal = (prod?: Produit) => {
    if (prod) {
      setEditProduit(prod);
      setForm({
        nom: prod.nom,
        prix: prod.prix.toString(),
        categorie_id: prod.categorie_id.toString(),
        stock: prod.stock?.quantite_disponible?.toString() || "",
      });
    } else {
      setEditProduit(null);
      setForm({ nom: "", prix: "", categorie_id: "", stock: "" });
    }
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setEditProduit(null);
    setForm({ nom: "", prix: "", categorie_id: "", stock: "" });
  };

  // Gérer le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sauvegarder (ajout ou modification)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        nom: form.nom,
        prix: parseFloat(form.prix),
        categorie_id: parseInt(form.categorie_id),
        quantite_disponible: parseInt(form.stock),
      };
      if (editProduit) {
        await produitService.modifier(editProduit.id, data);
      } else {
        await produitService.creer(data);
      }
      closeModal();
      fetchData();
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un produit
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de ce produit ?")) return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      await produitService.supprimer(id);
      fetchData();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des produits</h1>
      <div className="mb-4 flex justify-end">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
          onClick={() => openModal()}
        >
          Ajouter un produit
        </button>
      </div>
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
                <th className="py-2 px-3">Nom</th>
                <th className="py-2 px-3">Catégorie</th>
                <th className="py-2 px-3">Prix</th>
                <th className="py-2 px-3">Stock</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucun produit trouvé.</td>
                </tr>
              ) : (
                produits.map((prod) => (
                  <tr key={prod.id}>
                    <td className="py-2 px-3">{prod.id}</td>
                    <td className="py-2 px-3">{prod.nom}</td>
                    <td className="py-2 px-3">{prod.categorie?.nom || "-"}</td>
                    <td className="py-2 px-3">{LOCALE_CONFIG.formatPrice(prod.prix)}</td>
                    <td className="py-2 px-3">{prod.stock?.quantite_disponible ?? "-"}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => openModal(prod)}
                      >
                        Modifier
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        disabled={deleteLoading && deleteId === prod.id}
                        onClick={() => handleDelete(prod.id)}
                      >
                        {deleteLoading && deleteId === prod.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={closeModal}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editProduit ? "Modifier le produit" : "Ajouter un produit"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Prix</label>
                <input
                  type="number"
                  name="prix"
                  value={form.prix}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Catégorie</label>
                <select
                  name="categorie_id"
                  value={form.categorie_id}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Sélectionner</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
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
