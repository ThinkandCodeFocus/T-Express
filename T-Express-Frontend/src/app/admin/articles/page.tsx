"use client";
import React, { useEffect, useState } from "react";
import { articleService } from "@/services/article.service";
import type { Article } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import toast from "react-hot-toast";

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [filters, setFilters] = useState({ categorie: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    titre: "",
    slug: "",
    extrait: "",
    contenu: "",
    auteur: "",
    categorie: "",
    tags: "",
    publie: false,
    date_publication: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await articleService.getListe(
        currentPage,
        20,
        filters.categorie || undefined
      );
      setArticles(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des articles.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const openModal = (article?: Article) => {
    if (article) {
      setEditArticle(article);
      setForm({
        titre: article.titre,
        slug: article.slug || "",
        extrait: article.extrait || "",
        contenu: article.contenu || "",
        auteur: article.auteur || "",
        categorie: article.categorie || "",
        tags: article.tags || "",
        publie: article.publie || false,
        date_publication: article.date_publication || "",
      });
      if (article.image) {
        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${article.image}`);
      }
    } else {
      setEditArticle(null);
      setForm({
        titre: "",
        slug: "",
        extrait: "",
        contenu: "",
        auteur: "",
        categorie: "",
        tags: "",
        publie: false,
        date_publication: "",
      });
      setImagePreview(null);
      setImage(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditArticle(null);
    setImagePreview(null);
    setImage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const data: Partial<Article> = {
        titre: form.titre,
        slug: form.slug || undefined,
        extrait: form.extrait || undefined,
        contenu: form.contenu,
        auteur: form.auteur,
        categorie: form.categorie || undefined,
        tags: form.tags || undefined,
        publie: form.publie,
        date_publication: form.date_publication || undefined,
      };

      if (editArticle) {
        await articleService.modifier(editArticle.id, data, image || undefined);
        toast.success("Article modifié avec succès");
      } else {
        await articleService.creer(data, image || undefined);
        toast.success("Article créé avec succès");
      }
      closeModal();
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de cet article ?")) return;
    setDeleteId(id);
    try {
      await articleService.supprimer(id);
      toast.success("Article supprimé avec succès");
      fetchData();
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
            <h1 className="text-3xl font-bold text-dark mb-2">Gestion des articles</h1>
            <p className="text-dark-4">Gérez votre blog et vos articles</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue to-blue-dark text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un article
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-2 p-4 mb-6 border border-gray-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-dark mb-2">Filtrer par catégorie</label>
              <input
                type="text"
                value={filters.categorie}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
                placeholder="Catégorie d'article..."
                className="w-full border border-gray-3 rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ categorie: "" })}
                className="px-4 py-2 border border-gray-3 rounded-lg hover:bg-gray-1"
              >
                Réinitialiser
              </button>
            </div>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Titre</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Auteur</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Catégorie</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark-4 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-dark-4">Aucun article trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-1 transition-colors">
                        <td className="px-6 py-4">
                          {article.image ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${article.image}`}
                              alt={article.titre}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-2 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-dark">{article.titre}</p>
                            {article.extrait && (
                              <p className="text-sm text-dark-4 line-clamp-1">{article.extrait}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-dark-4">{article.auteur || "-"}</td>
                        <td className="px-6 py-4">
                          {article.categorie && (
                            <span className="px-3 py-1 bg-blue-light-5 text-blue rounded-full text-sm font-medium">
                              {article.categorie}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            article.publie 
                              ? 'bg-green-light-6 text-green-dark' 
                              : 'bg-gray-3 text-dark-4'
                          }`}>
                            {article.publie ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-dark-4 text-sm">
                          {article.date_publication ? LOCALE_CONFIG.formatDate(article.date_publication) : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(article)}
                              className="p-2 text-blue hover:bg-blue-light-5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(article.id)}
                              disabled={deleteId === article.id}
                              className="p-2 text-red hover:bg-red-light-6 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deleteId === article.id ? (
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-3 w-full max-w-4xl my-8 relative max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-3 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-dark">
                {editArticle ? "Modifier l'article" : "Ajouter un article"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-1 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Titre *</label>
                  <input
                    type="text"
                    name="titre"
                    value={form.titre}
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
                  <label className="block text-sm font-semibold text-dark mb-2">Auteur *</label>
                  <input
                    type="text"
                    name="auteur"
                    value={form.auteur}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Catégorie</label>
                  <input
                    type="text"
                    name="categorie"
                    value={form.categorie}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Date de publication</label>
                  <input
                    type="datetime-local"
                    name="date_publication"
                    value={form.date_publication}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Extrait</label>
                  <textarea
                    name="extrait"
                    value={form.extrait}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                    placeholder="Résumé court de l'article..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Contenu *</label>
                  <textarea
                    name="contenu"
                    value={form.contenu}
                    onChange={handleChange}
                    required
                    rows={10}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue font-mono text-sm"
                    placeholder="Contenu de l'article..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-dark mb-2">Image</label>
                  <div className="border-2 border-dashed border-gray-3 rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg mb-2" />
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
                      id="article-image"
                    />
                    <label
                      htmlFor="article-image"
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
                      name="publie"
                      checked={form.publie}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue rounded focus:ring-2 focus:ring-blue"
                    />
                    <span className="text-dark">Publier l&apos;article</span>
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
                  {saving ? "Enregistrement..." : editArticle ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





















