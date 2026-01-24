"use client";
import React, { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { categorieService } from "@/services/categorie.service";
import type { Produit, Categorie, AdminProduitData } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import toast from "react-hot-toast";

export default function AdminProduits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editProduit, setEditProduit] = useState<Produit | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Formulaire complet
  const [form, setForm] = useState<Partial<AdminProduitData>>({
    nom: "",
    description: "",
    prix: undefined,
    prix_promo: undefined,
    categorie_id: undefined,
    marque: "",
    reference: "",
    couleurs: [],
    tailles: [],
    en_vedette: false,
    nouveau: false,
    actif: true,
    quantite_stock: undefined,
  });
  const [imagePrincipale, setImagePrincipale] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePrincipalePreview, setImagePrincipalePreview] = useState<string | null>(null);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  // Charger produits et catégories
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodResponse, catData] = await Promise.all([
        adminService.getProduits(currentPage, 20),
        categorieService.getListe(),
      ]);
      setProduits(prodResponse.data || []);
      setCategories(catData);
      setTotalPages(prodResponse.meta?.last_page || 1);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des produits.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  // Ouvrir le modal pour ajouter/modifier
  const openModal = (prod?: Produit) => {
    if (prod) {
      setEditProduit(prod);
      setForm({
        nom: prod.nom,
        description: prod.description || "",
        prix: prod.prix,
        prix_promo: prod.prix_promo,
        categorie_id: prod.categorie_id,
        marque: prod.marque || "",
        reference: prod.reference || "",
        couleurs: Array.isArray(prod.couleurs) ? prod.couleurs : (prod.couleurs ? JSON.parse(prod.couleurs as any) : []),
        tailles: Array.isArray(prod.tailles) ? prod.tailles : (prod.tailles ? JSON.parse(prod.tailles as any) : []),
        en_vedette: prod.en_vedette || false,
        nouveau: prod.nouveau || false,
        actif: prod.actif !== undefined ? prod.actif : true,
        quantite_stock: prod.stock?.quantite ?? undefined,
      });
      if (prod.image_principale) {
        setImagePrincipalePreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${prod.image_principale}`);
      }
    } else {
      setEditProduit(null);
      setForm({
        nom: "",
        description: "",
        prix: undefined,
        prix_promo: undefined,
        categorie_id: undefined,
        marque: "",
        reference: "",
        couleurs: [],
        tailles: [],
        en_vedette: false,
        nouveau: false,
        actif: true,
        quantite_stock: undefined,
      });
      setImagePrincipale(null);
      setImages([]);
      setImagePrincipalePreview(null);
      setImagesPreview([]);
    }
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setEditProduit(null);
    setImagePrincipale(null);
    setImages([]);
    setImagePrincipalePreview(null);
    setImagesPreview([]);
  };

  // Gérer le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Gérer les tableaux (couleurs, tailles)
  const handleArrayChange = (name: 'couleurs' | 'tailles', value: string) => {
    setForm((prev) => {
      const current = prev[name] || [];
      const newArray = value ? [...current, value] : current;
      return { ...prev, [name]: newArray };
    });
  };

  const removeArrayItem = (name: 'couleurs' | 'tailles', index: number) => {
    setForm((prev) => {
      const current = prev[name] || [];
      const newArray = current.filter((_, i) => i !== index);
      return { ...prev, [name]: newArray };
    });
  };

  // Gérer l'image principale
  const handleImagePrincipaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePrincipale(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePrincipalePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gérer les images multiples
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Sauvegarder (ajout ou modification)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data: Partial<AdminProduitData> = {
        nom: form.nom,
        description: form.description,
        prix: form.prix ?? 0,
        prix_promo: form.prix_promo ?? undefined,
        categorie_id: form.categorie_id ?? 0,
        marque: form.marque || undefined,
        reference: form.reference || undefined,
        couleurs: form.couleurs?.length ? form.couleurs : undefined,
        tailles: form.tailles?.length ? form.tailles : undefined,
        en_vedette: form.en_vedette,
        nouveau: form.nouveau,
        actif: form.actif,
        quantite_stock: form.quantite_stock ?? 0,
      };

      if (imagePrincipale) {
        data.image_principale = imagePrincipale;
      }

      if (images.length > 0) {
        data.images = images;
      }

      if (editProduit) {
        await adminService.modifierProduit(editProduit.id, data);
        toast.success("Produit modifié avec succès");
      } else {
        await adminService.creerProduit(data as AdminProduitData);
        toast.success("Produit créé avec succès");
      }
      closeModal();
      fetchData();
    } catch (e: any) {
      const errorMsg = e.message || "Erreur lors de l'enregistrement.";
      setError(errorMsg);
      toast.error(errorMsg);
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
      await adminService.supprimerProduit(id);
      toast.success("Produit supprimé avec succès");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Gestion des produits</h1>
            <p className="text-dark-4">Gérez votre catalogue de produits</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue to-blue-dark text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-2 border border-gray-3 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-light-5 border-t-blue rounded-full animate-spin"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-light-6 border-2 border-red-light-3 rounded-xl p-6 m-6">
            <div className="flex items-start gap-4">
              <div className="bg-red p-3 rounded-xl text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-dark mb-2">Erreur de connexion</h3>
                <p className="text-red-dark mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="bg-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-dark transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-1 border-b border-gray-3">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark-4 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {produits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-4 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <p className="text-dark-4 text-lg">Aucun produit trouvé</p>
                          <button
                            onClick={() => openModal()}
                            className="mt-4 text-blue hover:text-blue-dark font-medium"
                          >
                            Créer votre premier produit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    produits.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-1 transition-colors">
                        <td className="px-6 py-4">
                          {prod.image_principale ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${prod.image_principale}`}
                              alt={prod.nom}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-2 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-dark">{prod.nom}</p>
                            {prod.reference && (
                              <p className="text-sm text-dark-4">Ref: {prod.reference}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-light-5 text-blue rounded-full text-sm font-medium">
                            {prod.categorie?.nom || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-dark">{LOCALE_CONFIG.formatPrice(prod.prix)}</p>
                            {prod.prix_promo && (
                              <p className="text-sm text-green line-through">{LOCALE_CONFIG.formatPrice(prod.prix_promo)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${(prod.stock?.quantite ?? 0) <= 10 ? 'text-red' : 'text-green'}`}>
                              {prod.stock?.quantite ?? 0}
                            </span>
                            {(prod.stock?.quantite ?? 0) <= 10 && (
                              <span className="px-2 py-0.5 bg-red-light-6 text-red-dark text-xs rounded-full">Faible</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            prod.actif 
                              ? 'bg-green-light-6 text-green-dark' 
                              : 'bg-gray-3 text-dark-4'
                          }`}>
                            {prod.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(prod)}
                              className="p-2 text-blue hover:bg-blue-light-5 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id)}
                              disabled={deleteLoading && deleteId === prod.id}
                              className="p-2 text-red hover:bg-red-light-6 rounded-lg transition-colors disabled:opacity-50"
                              title="Supprimer"
                            >
                              {deleteLoading && deleteId === prod.id ? (
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-3 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-3 hover:bg-gray-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-dark-4">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-3 hover:bg-gray-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal d'ajout/modification complet */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-3 w-full max-w-4xl my-8 relative max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-3 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-dark">
                {editProduit ? "Modifier le produit" : "Ajouter un produit"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-1 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-light-6 border border-red-light-3 rounded-lg p-4 text-red-dark">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Nom du produit *</label>
                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue focus:border-transparent"
                    placeholder="Ex: T-shirt Premium"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue focus:border-transparent"
                    placeholder="Description détaillée du produit..."
                  />
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Prix (FCFA) *</label>
                  <input
                    type="number"
                    name="prix"
                    value={form.prix}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue focus:border-transparent"
                  />
                </div>

                {/* Prix promo */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Prix promotionnel (FCFA)</label>
                  <input
                    type="number"
                    name="prix_promo"
                    value={form.prix_promo}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue focus:border-transparent"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Catégorie *</label>
                  <select
                    name="categorie_id"
                    value={form.categorie_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>

                {/* Marque */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Marque</label>
                  <input
                    type="text"
                    name="marque"
                    value={form.marque}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue focus:border-transparent"
                    placeholder="Ex: Nike, Adidas..."
                  />
                </div>

                {/* Référence */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Référence</label>
                  <input
                    type="text"
                    name="reference"
                    value={form.reference}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue focus:border-transparent"
                    placeholder="Ex: REF-12345"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Quantité en stock *</label>
                  <input
                    type="number"
                    name="quantite_stock"
                    value={form.quantite_stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue focus:border-transparent"
                  />
                </div>
                

                {/* Couleurs */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Couleurs disponibles</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Ajouter une couleur"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            handleArrayChange('couleurs', input.value.trim());
                            input.value = '';
                          }
                        }
                      }}
                      className="flex-1 border border-gray-3 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.couleurs || []).map((couleur, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-light-5 text-blue rounded-full text-sm flex items-center gap-2"
                      >
                        {couleur}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('couleurs', index)}
                          className="hover:text-red"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tailles */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Tailles disponibles</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Ajouter une taille"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            handleArrayChange('tailles', input.value.trim());
                            input.value = '';
                          }
                        }
                      }}
                      className="flex-1 border border-gray-3 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.tailles || []).map((taille, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-light-6 text-green-dark rounded-full text-sm flex items-center gap-2"
                      >
                        {taille}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('tailles', index)}
                          className="hover:text-red"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-semibold text-dark mb-2">Options</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="en_vedette"
                        checked={form.en_vedette}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue rounded focus:ring-2 focus:ring-blue"
                      />
                      <span className="text-dark">En vedette</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="nouveau"
                        checked={form.nouveau}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue rounded focus:ring-2 focus:ring-blue"
                      />
                      <span className="text-dark">Nouveau produit</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={form.actif}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue rounded focus:ring-2 focus:ring-blue"
                      />
                      <span className="text-dark">Actif</span>
                    </label>
                  </div>
                </div>

                {/* Image principale */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Image principale</label>
                  <div className="border-2 border-dashed border-gray-3 rounded-lg p-4 text-center">
                    {imagePrincipalePreview ? (
                      <div className="relative">
                        <img
                          src={imagePrincipalePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePrincipale(null);
                            setImagePrincipalePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red text-white p-1 rounded-full"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 mx-auto text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-dark-4 mb-2">Cliquez pour ajouter une image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagePrincipaleChange}
                      className="hidden"
                      id="image-principale"
                    />
                    <label
                      htmlFor="image-principale"
                      className="inline-block px-4 py-2 bg-blue-light-5 text-blue rounded-lg cursor-pointer hover:bg-blue-light-4 transition-colors"
                    >
                      {imagePrincipalePreview ? 'Changer l\'image' : 'Sélectionner une image'}
                    </label>
                  </div>
                </div>

                {/* Images multiples */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Images supplémentaires</label>
                  <div className="border-2 border-dashed border-gray-3 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                      id="images"
                    />
                    <label
                      htmlFor="images"
                      className="block text-center px-4 py-2 bg-gray-1 text-dark rounded-lg cursor-pointer hover:bg-gray-2 transition-colors mb-3"
                    >
                      Ajouter des images
                    </label>
                    {imagesPreview.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imagesPreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImages(prev => prev.filter((_, i) => i !== index));
                                setImagesPreview(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="absolute top-1 right-1 bg-red text-white p-1 rounded-full text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-3 rounded-lg font-medium hover:bg-gray-1 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue to-blue-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editProduit ? "Modifier" : "Créer"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
