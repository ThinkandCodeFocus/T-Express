"use client";
import React, { useEffect, useState } from "react";
import { commandeService } from "@/services/commande.service";
import type { Commande } from "@/types/api.types";
import Link from "next/link";

const OrdersNew = () => {
  const [orders, setOrders] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await commandeService.getHistorique();
      setOrders(response.data);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      // Formats minuscules avec underscores (legacy)
      'en_attente': { label: 'En attente', color: 'bg-yellow-500' },
      'confirmee': { label: 'Confirmée', color: 'bg-blue' },
      'en_preparation': { label: 'En préparation', color: 'bg-orange-500' },
      'expediee': { label: 'Expédiée', color: 'bg-purple-500' },
      'livree': { label: 'Livrée', color: 'bg-green-500' },
      'annulee': { label: 'Annulée', color: 'bg-red' },
      // Formats avec espaces et accents (backend actuel)
      'En attente': { label: 'En attente', color: 'bg-yellow-500' },
      'Confirmée': { label: 'Confirmée', color: 'bg-blue' },
      'En préparation': { label: 'En préparation', color: 'bg-orange-500' },
      'Expédiée': { label: 'Expédiée', color: 'bg-purple-500' },
      'Livrée': { label: 'Livrée', color: 'bg-green-500' },
      'Annulée': { label: 'Annulée', color: 'bg-red' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-400' };
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px] p-7.5">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* Header */}
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">Commande</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Date</p>
              </div>
              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Statut</p>
              </div>
              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark">Articles</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Action</p>
              </div>
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 ? (
            orders.map((order) => {
              const status = getStatusLabel(order.statut);
              const itemCount = order.details?.length || 0;
              
              return (
                <div
                  key={order.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between py-4.5 px-7.5 border-b border-gray-3"
                >
                  {/* Order Number */}
                  <div className="min-w-[111px] mb-2 md:mb-0">
                    <p className="font-medium text-dark">#{order.numero_commande}</p>
                  </div>

                  {/* Date */}
                  <div className="min-w-[175px] mb-2 md:mb-0">
                    <p className="text-custom-sm">{formatDate(order.created_at)}</p>
                  </div>

                  {/* Status */}
                  <div className="min-w-[128px] mb-2 md:mb-0">
                    <span className={`inline-flex items-center justify-center rounded-full py-1 px-3 text-xs text-white ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="min-w-[213px] mb-2 md:mb-0">
                    <p className="text-custom-sm">
                      {itemCount} article{itemCount > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="min-w-[113px] mb-2 md:mb-0">
                    <p className="font-medium text-dark">{formatPrice(order.montant_total)}</p>
                  </div>

                  {/* Action */}
                  <div className="min-w-[113px]">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex text-blue hover:text-blue-dark text-sm"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              Vous n&apos;avez encore passé aucune commande!
            </p>
          )}
        </div>

        {/* Mobile view - simplified cards */}
        {orders.length > 0 && (
          <div className="block md:hidden">
            {orders.map((order) => {
              const status = getStatusLabel(order.statut);
              const itemCount = order.details?.length || 0;
              
              return (
                <div
                  key={`mobile-${order.id}`}
                  className="bg-gray-1 rounded-lg p-4 mb-3 mx-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-dark text-sm mb-1">
                        #{order.numero_commande}
                      </p>
                      <p className="text-xs text-gray-5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center justify-center rounded-full py-1 px-2.5 text-xs text-white ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-5 mb-1">
                        {itemCount} article{itemCount > 1 ? 's' : ''}
                      </p>
                      <p className="font-medium text-dark">
                        {formatPrice(order.montant_total)}
                      </p>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue hover:text-blue-dark text-sm"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersNew;
