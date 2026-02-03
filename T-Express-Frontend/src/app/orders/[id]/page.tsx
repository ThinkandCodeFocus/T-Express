"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  "en_attente": { label: "En attente", color: "bg-yellow-500" },
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

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { user } = useAuthContext();
  
  const [order, setOrder] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && orderId) {
      loadOrder();
    }
  }, [user, orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commandeService.getDetail(parseInt(orderId));
      setOrder(data);
    } catch (err: any) {
      console.error("Erreur chargement commande:", err);
      setError(err.message || "Erreur lors du chargement de la commande");
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
        <Breadcrumb title="Détail Commande" pages={["commandes", "détail"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] mx-auto px-4">
            <div className="bg-white rounded-xl shadow-1 p-10 text-center">
              <h2 className="text-2xl font-medium text-dark mb-4">Connexion requise</h2>
              <p className="mb-6">Vous devez être connecté pour voir cette commande</p>
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

  if (loading) {
    return (
      <>
        <Breadcrumb title="Détail Commande" pages={["commandes", "détail"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] mx-auto px-4">
            <div className="bg-white rounded-xl shadow-1 p-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Breadcrumb title="Détail Commande" pages={["commandes", "détail"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] mx-auto px-4">
            <div className="bg-white rounded-xl shadow-1 p-10 text-center">
              <p className="text-red-500 mb-4">{error || "Commande non trouvée"}</p>
              <Link href="/my-account" className="text-blue hover:underline">
                Retour à mon compte
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const statusStyle = getStatusStyle(order.statut);
  const paiementStyle = getPaiementStyle(order.paiement?.statut);

  return (
    <>
      <Breadcrumb title={`Commande #${order.numero_commande || order.id}`} pages={["commandes", "détail"]} />
      
      <section className="py-20 bg-gray-2">
        <div className="max-w-[1170px] mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/my-account" className="text-blue hover:text-blue-dark flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à mon compte
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statuts */}
              <div className="bg-white rounded-xl shadow-1 p-6">
                <h2 className="text-xl font-semibold text-dark mb-4">
                  Commande #{order.numero_commande || order.id}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="font-medium">{LOCALE_CONFIG.formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Statut commande</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Paiement</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paiementStyle.color}`}>
                      {paiementStyle.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mode de paiement</p>
                    <p className="font-medium capitalize">{order.paiement?.methode || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Articles commandés */}
              <div className="bg-white rounded-xl shadow-1 p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">Articles commandés</h3>
                <div className="space-y-4">
                  {order.details?.map((detail) => (
                    <div key={detail.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {detail.produit?.image_principale ? (
                          <img 
                            src={detail.produit.image_principale} 
                            alt={detail.produit.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-dark">{detail.produit?.nom || `Produit #${detail.produit_id}`}</h4>
                        <p className="text-sm text-gray-500">Quantité: {detail.quantite}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-dark">{LOCALE_CONFIG.formatPrice(detail.prix_unitaire * detail.quantite)}</p>
                        <p className="text-sm text-gray-500">{LOCALE_CONFIG.formatPrice(detail.prix_unitaire)} / unité</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="bg-white rounded-xl shadow-1 p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">Adresse de livraison</h3>
                {order.adresse_livraison ? (
                  <div className="text-gray-600">
                    <p className="font-medium text-dark">{order.adresse_livraison.adresse_ligne_1}</p>
                    {order.adresse_livraison.adresse_ligne_2 && (
                      <p>{order.adresse_livraison.adresse_ligne_2}</p>
                    )}
                    <p>{order.adresse_livraison.ville}, {order.adresse_livraison.region || order.adresse_livraison.pays}</p>
                    {order.adresse_livraison.telephone && (
                      <p className="mt-2">Tél: {order.adresse_livraison.telephone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Adresse non disponible</p>
                )}
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-1 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-dark mb-4">Récapitulatif</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{LOCALE_CONFIG.formatPrice(order.montant_ht || order.montant_total)}</span>
                  </div>
                  {order.montant_tva > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">TVA</span>
                      <span>{LOCALE_CONFIG.formatPrice(order.montant_tva)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="text-green-600">
                      {order.frais_livraison > 0 ? LOCALE_CONFIG.formatPrice(order.frais_livraison) : "Gratuite"}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue">{LOCALE_CONFIG.formatPrice(order.montant_total)}</span>
                  </div>
                </div>

                {/* Contact support */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-dark mb-2">Besoin d'aide ?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Contactez notre service client pour toute question concernant votre commande.
                  </p>
                  <a 
                    href="tel:+221771188747" 
                    className="flex items-center gap-2 text-blue hover:text-blue-dark"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    (+221) 77 118 87 47
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
