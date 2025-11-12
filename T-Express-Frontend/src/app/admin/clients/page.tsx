import React, { useEffect, useState } from "react";
import { clientService } from "@/services/client.service";
import type { Client } from "@/types/api.types";

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", telephone: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les clients
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getListe();
      setClients(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Ouvrir le modal pour ajouter/modifier
  const openModal = (client?: Client) => {
    if (client) {
      setEditClient(client);
      setForm({
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone || "",
      });
    } else {
      setEditClient(null);
      setForm({ nom: "", prenom: "", email: "", telephone: "" });
    }
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setEditClient(null);
    setForm({ nom: "", prenom: "", email: "", telephone: "" });
  };

  // Gérer le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sauvegarder (ajout ou modification)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editClient) {
        await clientService.modifier(editClient.id, form);
      } else {
        await clientService.creer(form);
      }
      closeModal();
      fetchClients();
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un client
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de ce client ?")) return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      await clientService.supprimer(id);
      fetchClients();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des clients</h1>
      <div className="mb-4 flex justify-end">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
          onClick={() => openModal()}
        >
          Ajouter un client
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
                <th className="py-2 px-3">Prénom</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Téléphone</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucun client trouvé.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td className="py-2 px-3">{client.id}</td>
                    <td className="py-2 px-3">{client.nom}</td>
                    <td className="py-2 px-3">{client.prenom}</td>
                    <td className="py-2 px-3">{client.email}</td>
                    <td className="py-2 px-3">{client.telephone}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => openModal(client)}
                      >
                        Modifier
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        disabled={deleteLoading && deleteId === client.id}
                        onClick={() => handleDelete(client.id)}
                      >
                        {deleteLoading && deleteId === client.id ? "Suppression..." : "Supprimer"}
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
              {editClient ? "Modifier le client" : "Ajouter un client"}
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
                <label className="block mb-1 font-medium">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Téléphone</label>
                <input
                  type="text"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
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
