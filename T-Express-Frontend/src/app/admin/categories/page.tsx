import React, { useEffect, useState } from "react";
import { categorieService } from "@/services/categorie.service";
import type { Categorie } from "@/types/api.types";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategorie, setEditCategorie] = useState<Categorie | null>(null);
  const [form, setForm] = useState({ nom: "", slug: "", description: "", actif: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les catégories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categorieService.getListe();
      setCategories(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des catégories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Ouvrir le modal pour ajouter/modifier
  const openModal = (cat?: Categorie) => {
    if (cat) {
      setEditCategorie(cat);
      setForm({
        nom: cat.nom,
        slug: cat.slug,
        description: cat.description || "",
        actif: cat.actif,
      });
    } else {
      setEditCategorie(null);
      setForm({ nom: "", slug: "", description: "", actif: true });
    }
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setEditCategorie(null);
    setForm({ nom: "", slug: "", description: "", actif: true });
  };

  // Gérer le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (target as HTMLInputElement).checked : value }));
  };

  // Sauvegarder (ajout ou modification)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCategorie) {
        await categorieService.modifier(editCategorie.id, form);
      } else {
        await categorieService.creer(form);
      }
      closeModal();
      fetchCategories();
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // Supprimer une catégorie
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de cette catégorie ?")) return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      await categorieService.supprimer(id);
      fetchCategories();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des catégories</h1>
      <div className="mb-4 flex justify-end">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
          onClick={() => openModal()}
        >
          Ajouter une catégorie
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
                <th className="py-2 px-3">Slug</th>
                <th className="py-2 px-3">Active</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">Aucune catégorie trouvée.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="py-2 px-3">{cat.id}</td>
                    <td className="py-2 px-3">{cat.nom}</td>
                    <td className="py-2 px-3">{cat.slug}</td>
                    <td className="py-2 px-3">{cat.actif ? "Oui" : "Non"}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => openModal(cat)}
                      >
                        Modifier
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        disabled={deleteLoading && deleteId === cat.id}
                        onClick={() => handleDelete(cat.id)}
                      >
                        {deleteLoading && deleteId === cat.id ? "Suppression..." : "Supprimer"}
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
              {editCategorie ? "Modifier la catégorie" : "Ajouter une catégorie"}
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
                <label className="block mb-1 font-medium">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="actif"
                  checked={form.actif}
                  onChange={handleChange}
                  id="actif"
                />
                <label htmlFor="actif">Active</label>
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
