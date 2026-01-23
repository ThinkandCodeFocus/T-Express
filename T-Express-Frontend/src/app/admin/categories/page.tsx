"use client";
import React, { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import type { Categorie, AdminCategorieData } from "@/types/api.types";
import toast from "react-hot-toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategorie, setEditCategorie] = useState<Categorie | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const [form, setForm] = useState<Partial<AdminCategorieData>>({
    nom: "",
    slug: "",
    description: "",
    parent_id: "",
    actif: true,
    ordre: "0",
  });

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des catégories.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (cat?: Categorie) => {
    if (cat) {
      setEditCategorie(cat);
      setForm({
        nom: cat.nom,
        slug: cat.slug,
        description: cat.description || "",
        parent_id: cat.parent_id?.toString() || "",
        actif: cat.actif !== undefined ? cat.actif : true,
        ordre: cat.ordre?.toString() || "0",
      });
      if (cat.image) {
        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${cat.image}`);
      }
    } else {
      setEditCategorie(null);
      setForm({
        nom: "",
        slug: "",
        description: "",
        parent_id: "",
        actif: true,
        ordre: "0",
      });
      setImagePreview(null);
      setImage(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCategorie(null);
    setImagePreview(null);
    setImage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Partial<AdminCategorieData> = {
        nom: form.nom,
        slug: form.slug || undefined,
        description: form.description || undefined,
        parent_id: form.parent_id ? parseInt(form.parent_id as string) : undefined,
        actif: form.actif,
        ordre: form.ordre ? parseInt(form.ordre as string) : 0,
      };

      if (image) {
        data.image = image;
      }

      if (editCategorie) {
        await adminService.modifierCategorie(editCategorie.id, data);
        toast.success("Catégorie modifiée avec succès");
      } else {
        await adminService.creerCategorie(data as AdminCategorieData);
        toast.success("Catégorie créée avec succès");
      }
      closeModal();
      fetchCategories();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de cette catégorie ?")) return;
    setDeleteId(id);
    try {
      await adminService.supprimerCategorie(id);
      toast.success("Catégorie supprimée avec succès");
      fetchCategories();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Gestion des catégories</h1>
            <p className="text-dark-4">Organisez vos produits par catégories</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue to-blue-dark text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une catégorie
          </button>
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
            <button onClick={fetchCategories} className="mt-4 bg-red text-white px-4 py-2 rounded-lg">
              Réessayer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-1 border-b border-gray-3">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Produits</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-dark-4 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-dark-4">Aucune catégorie trouvée</p>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-1 transition-colors">
                      <td className="px-6 py-4">
                        {cat.image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${cat.image}`}
                            alt={cat.nom}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-2 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-dark">{cat.nom}</p>
                          {cat.parent && (
                            <p className="text-sm text-dark-4">Sous-catégorie de: {cat.parent.nom}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-4 font-mono text-sm">{cat.slug}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-light-5 text-blue rounded-full text-sm font-medium">
                          {cat.produits_count || 0} produits
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          cat.actif 
                            ? 'bg-green-light-6 text-green-dark' 
                            : 'bg-gray-3 text-dark-4'
                        }`}>
                          {cat.actif ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(cat)}
                            className="p-2 text-blue hover:bg-blue-light-5 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={deleteId === cat.id}
                            className="p-2 text-red hover:bg-red-light-6 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleteId === cat.id ? (
                              <div className="w-5 h-5 border-2 border-red border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-3 w-full max-w-2xl my-8 relative">
            <div className="sticky top-0 bg-white border-b border-gray-3 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-dark">
                {editCategorie ? "Modifier la catégorie" : "Ajouter une catégorie"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-1 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                    placeholder="Auto-généré si vide"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Catégorie parente</label>
                  <select
                    name="parent_id"
                    value={form.parent_id}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  >
                    <option value="">Aucune (catégorie principale)</option>
                    {categories.filter(c => c.id !== editCategorie?.id).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Ordre d&apos;affichage</label>
                  <input
                    type="number"
                    name="ordre"
                    value={form.ordre}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Image</label>
                  <div className="border-2 border-dashed border-gray-3 rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2" />
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red text-white p-1 rounded-full"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="categorie-image"
                    />
                    <label
                      htmlFor="categorie-image"
                      className="block text-center px-4 py-2 bg-gray-1 text-dark rounded-lg cursor-pointer hover:bg-gray-2 mt-2"
                    >
                      {imagePreview ? 'Changer l\'image' : 'Sélectionner une image'}
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="actif"
                      checked={form.actif}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue rounded focus:ring-2 focus:ring-blue"
                    />
                    <span className="text-dark">Catégorie active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-3 rounded-lg font-medium hover:bg-gray-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue to-blue-dark text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? "Enregistrement..." : editCategorie ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
