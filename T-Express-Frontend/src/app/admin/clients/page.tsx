"use client";
import React, { useEffect, useState } from "react";
import { clientService } from "@/services/client.service";
import type { Client } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import toast from "react-hot-toast";

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    telephone: "",
    date_naissance: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.getListe(currentPage, 20, recherche || undefined);
      setClients(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des clients.");
      toast.error(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, recherche]);

  const openModal = (client?: Client) => {
    if (client) {
      setEditClient(client);
      setForm({
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        password: "",
        telephone: client.telephone || "",
        date_naissance: client.date_naissance || "",
      });
    } else {
      setEditClient(null);
      setForm({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        telephone: "",
        date_naissance: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditClient(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone || undefined,
        date_naissance: form.date_naissance || undefined,
      };
      if (form.password) {
        data.password = form.password;
      }
      if (editClient) {
        await clientService.modifier(editClient.id, data);
        toast.success("Client modifié avec succès");
      } else {
        if (!form.password) {
          toast.error("Le mot de passe est requis pour créer un client");
          setSaving(false);
          return;
        }
        await clientService.creer(data);
        toast.success("Client créé avec succès");
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
    if (!window.confirm("Confirmer la suppression de ce client ?")) return;
    try {
      await clientService.supprimer(id);
      toast.success("Client supprimé avec succès");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Gestion des clients</h1>
            <p className="text-dark-4">Gérez vos clients et leurs informations</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue to-blue-dark text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un client
          </button>
        </div>

        {/* Recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full border border-gray-3 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-blue focus:border-transparent"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
            <div className="flex items-start gap-4">
              <div className="bg-red p-3 rounded-xl text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-dark mb-2">Erreur</h3>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Nom complet</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Téléphone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-4 uppercase">Date d'inscription</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark-4 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-4 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-dark-4 text-lg">Aucun client trouvé</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-1 transition-colors">
                        <td className="px-6 py-4 font-semibold text-dark">{client.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-dark">{client.prenom} {client.nom}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-dark">{client.email}</td>
                        <td className="px-6 py-4 text-dark-4">{client.telephone || "-"}</td>
                        <td className="px-6 py-4 text-dark-4">
                          {LOCALE_CONFIG.formatDate(client.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(client)}
                              className="p-2 text-blue hover:bg-blue-light-5 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-2 text-red hover:bg-red-light-6 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-3 w-full max-w-2xl relative">
            <div className="sticky top-0 bg-white border-b border-gray-3 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark">
                {editClient ? "Modifier le client" : "Ajouter un client"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-1 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                  <label className="block text-sm font-semibold text-dark mb-2">Prénom *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Mot de passe {!editClient && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editClient}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                    placeholder={editClient ? "Laisser vide pour ne pas changer" : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Date de naissance</label>
                  <input
                    type="date"
                    name="date_naissance"
                    value={form.date_naissance}
                    onChange={handleChange}
                    className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue"
                  />
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
                  {saving ? "Enregistrement..." : editClient ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
