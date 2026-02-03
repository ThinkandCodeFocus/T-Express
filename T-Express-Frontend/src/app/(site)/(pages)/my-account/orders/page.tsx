"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { commandeService } from "@/services/commande.service";
import type { Commande } from "@/types/api.types";
import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { LOCALE_CONFIG } from "@/config/api.config";

const STATUTS_COMMANDE: Record<string, { label: string; color: string }> = {
  "En attente": { label: "En attente", color: "bg-yellow-500" },
  "Validée": { label: "Validée", color: "bg-blue-500" },
  "Préparation": { label: "En préparation", color: "bg-orange-500" },
  "Expédiée": { label: "Expédiée", color: "bg-purple-500" },
  "Livrée": { label: "Livrée", color: "bg-green-500" },
  "Annulée": { label: "Annulée", color: "bg-red-500" },
  // Legacy
  "en_attente": { label: "En attente", color: "bg-yellow-500" },
  "confirmee": { label: "Validée", color: "bg-blue-500" },
};

const STATUTS_PAIEMENT: Record<string, { label: string; color: string }> = {
  "en_attente": { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  "En attente": { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  "validé": { label: "Payé", color: "bg-green-100 text-green-800" },
  "Complété": { label: "Payé", color: "bg-green-100 text-green-800" },
  "Accepté": { label: "Payé", color: "bg-green-100 text-green-800" },
  "échoué": { label: "Échoué", color: "bg-red-100 text-red-800" },
  "Refusé": { label: "Refusé", color: "bg-red-100 text-red-800" },
};

export default function OrdersPage() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commandeService.getHistorique();
      setOrders(response.data || []);
    } catch (err: any) {
      console.error("Erreur chargement commandes:", err);
      setError(err.message || "Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    return STATUTS_COMMANDE[status] || { label: status, color: "bg-gray-400" };
  };

  const getPaiementStyle = (status?: string) => {
    if (!status) return { label: "N/A", color: "bg-gray-100 text-gray-800" };
    return STATUTS_PAIEMENT[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  if (!user) {
    return (
      <>
        <Breadcrumb title="Mes Commandes" pages={["mon compte", "commandes"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] mx-auto px-4">
            <div className="bg-white rounded-xl shadow-1 p-10 text-center">
              <h2 className="text-2xl font-medium text-dark mb-4">Connexion requise</h2>
              <p className="mb-6">Vous devez être connecté pour voir vos commandes</p>
              <Link 
                href="/signin" 
                className="inline-flex text-white bg-blue py-3 px-8 rounded-md hover:bg-blue-dark"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Mes Commandes" pages={["mon compte", "commandes"]} />
      
      <section className="py-20 bg-gray-2">
        <div className="max-w-[1170px] mx-auto px-4">
          <div className="bg-white rounded-xl shadow-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-dark">Mes Commandes</h1>
              <Link 
                href="/my-account" 
                className="text-blue hover:text-blue-dark text-sm"
              >
                ← Retour au compte
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue mx-auto"></div>
                <p className="mt-4 text-gray-500">Chargement...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={loadOrders}
                  className="text-blue hover:underline"
                >
                  Réessayer
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500 mb-4">Vous n'avez pas encore de commandes</p>
                <Link 
                  href="/shop-with-sidebar" 
                  className="inline-flex text-white bg-blue py-2 px-6 rounded-md hover:bg-blue-dark"
                >
                  Découvrir nos produits
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-4 px-4 font-semibold text-sm">N° Commande</th>
                      <th className="py-4 px-4 font-semibold text-sm">Date</th>
                      <th className="py-4 px-4 font-semibold text-sm">Montant</th>
                      <th className="py-4 px-4 font-semibold text-sm">Paiement</th>
                      <th className="py-4 px-4 font-semibold text-sm">Statut</th>
                      <th className="py-4 px-4 font-semibold text-sm">Articles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => {
                      const statusStyle = getStatusStyle(order.statut);
                      const paiementStyle = getPaiementStyle(order.paiement?.statut);
                      const itemCount = order.details?.length || 0;

                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">
                            #{order.numero_commande || order.id}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {LOCALE_CONFIG.formatDate(order.created_at)}
                          </td>
                          <td className="py-4 px-4 font-medium">
                            {LOCALE_CONFIG.formatPrice(order.montant_total)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paiementStyle.color}`}>
                              {paiementStyle.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${statusStyle.color}`}>
                              {statusStyle.label}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {itemCount} article{itemCount > 1 ? "s" : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
