"use client";
import React, { useState, useEffect } from "react";
import { superAdminService, DashboardSuperAdmin, PaiementSuperAdmin, Retrait } from "@/services/retrait.service";
import { LOCALE_CONFIG } from "@/config/api.config";

const STATUT_PAIEMENT: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  "En attente": { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  validé: { label: "Payé", color: "bg-green-100 text-green-800" },
  Complété: { label: "Payé", color: "bg-green-100 text-green-800" },
  Accepté: { label: "Payé", color: "bg-green-100 text-green-800" },
  échoué: { label: "Échoué", color: "bg-red-100 text-red-800" },
  Refusé: { label: "Refusé", color: "bg-red-100 text-red-800" },
};

const STATUT_RETRAIT: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  confirmé: { label: "Confirmé", color: "bg-green-100 text-green-800" },
  refusé: { label: "Refusé", color: "bg-red-100 text-red-800" },
};

export default function SuperAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardSuperAdmin | null>(null);
  const [paiements, setPaiements] = useState<PaiementSuperAdmin[]>([]);
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "paiements" | "retraits">("dashboard");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    // Vérifier si déjà connecté
    const token = localStorage.getItem("super_admin_token");
    if (token) {
      setIsLoggedIn(true);
      loadData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await superAdminService.login(email, password);
      localStorage.setItem("super_admin_token", response.token);
      localStorage.setItem("token", response.token); // Pour que l'API l'utilise
      setIsLoggedIn(true);
      loadData();
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Identifiants invalides");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("super_admin_token");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setDashboard(null);
    setPaiements([]);
    setRetraits([]);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, paiementsData, retraitsData] = await Promise.all([
        superAdminService.dashboard(),
        superAdminService.paiements(),
        superAdminService.retraits(),
      ]);
      setDashboard(dashboardData);
      setPaiements(paiementsData);
      setRetraits(retraitsData);
    } catch (err: any) {
      console.error("Erreur chargement:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmerRetrait = async (id: number) => {
    if (!confirm("Confirmer ce retrait ? Le montant sera déduit du solde.")) return;

    try {
      setActionLoading(id);
      await superAdminService.confirmerRetrait(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la confirmation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefuserRetrait = async (id: number) => {
    const note = prompt("Raison du refus (optionnel):");
    if (note === null) return; // Annulé

    try {
      setActionLoading(id);
      await superAdminService.refuserRetrait(id, note || undefined);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors du refus");
    } finally {
      setActionLoading(null);
    }
  };

  // Page de connexion
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">🔐 Super Admin</h1>
            <p className="text-gray-600">Accès restreint</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark disabled:bg-gray-400 transition"
              style={{ backgroundColor: '#3C50E0', color: '#ffffff' }}
            >
              {loginLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard super admin
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">🛡️ Super Admin - T-Express</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Onglets */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: "dashboard", label: "📊 Tableau de bord" },
              { key: "paiements", label: "💳 Paiements" },
              { key: "retraits", label: "💸 Demandes de retrait" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {activeTab === "dashboard" && dashboard && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-500">Total des ventes</p>
                  <p className="text-3xl font-bold text-green-600">{LOCALE_CONFIG.formatPrice(dashboard.total_ventes)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-500">Retraits confirmés</p>
                  <p className="text-3xl font-bold text-blue-600">{LOCALE_CONFIG.formatPrice(dashboard.total_retraits_confirmes)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-500">Retraits en attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{LOCALE_CONFIG.formatPrice(dashboard.total_retraits_en_attente)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                  <p className="text-sm text-gray-600">Solde du compte</p>
                  <p className="text-3xl font-bold text-blue-700">{LOCALE_CONFIG.formatPrice(dashboard.solde_compte)}</p>
                </div>
              </div>
            )}

            {/* Paiements */}
            {activeTab === "paiements" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Liste des paiements ({paiements.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paiements.map((paiement) => {
                        const style = STATUT_PAIEMENT[paiement.statut] || { label: paiement.statut, color: "bg-gray-100" };
                        return (
                          <tr key={paiement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">#{paiement.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(paiement.created_at).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {paiement.client ? (
                                <div>
                                  <p className="font-medium text-gray-900">{paiement.client.prenom} {paiement.client.nom}</p>
                                  <p className="text-gray-500 text-xs">{paiement.client.email}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {LOCALE_CONFIG.formatPrice(paiement.montant)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{paiement.methode || "Wave"}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.color}`}>
                                {style.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {paiements.length === 0 && (
                    <p className="text-center py-8 text-gray-500">Aucun paiement</p>
                  )}
                </div>
              </div>
            )}

            {/* Retraits */}
            {activeTab === "retraits" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Demandes de retrait ({retraits.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demandeur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {retraits.map((retrait) => {
                        const style = STATUT_RETRAIT[retrait.statut] || { label: retrait.statut, color: "bg-gray-100" };
                        return (
                          <tr key={retrait.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">#{retrait.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(retrait.created_at).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {retrait.user ? (
                                <div>
                                  <p className="font-medium text-gray-900">{retrait.user.prenom} {retrait.user.nom}</p>
                                  <p className="text-gray-500 text-xs">{retrait.user.email}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {LOCALE_CONFIG.formatPrice(retrait.montant)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.color}`}>
                                {style.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                              {retrait.note || "-"}
                            </td>
                            <td className="px-6 py-4">
                              {retrait.statut === "en_attente" && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleConfirmerRetrait(retrait.id)}
                                    disabled={actionLoading === retrait.id}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                                  >
                                    {actionLoading === retrait.id ? "..." : "Confirmer"}
                                  </button>
                                  <button
                                    onClick={() => handleRefuserRetrait(retrait.id)}
                                    disabled={actionLoading === retrait.id}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                                  >
                                    Refuser
                                  </button>
                                </div>
                              )}
                              {retrait.statut !== "en_attente" && retrait.date_confirmation && (
                                <span className="text-xs text-gray-500">
                                  {new Date(retrait.date_confirmation).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {retraits.length === 0 && (
                    <p className="text-center py-8 text-gray-500">Aucune demande de retrait</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
