/**
 * Exemple de Dashboard Admin
 * Ce composant montre comment intégrer les services admin
 */

'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { DashboardStats } from '@/types/api.types';
import { formatPrice, formatCommandeStatus } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des statistiques');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <p className="text-red-600">Impossible de charger les statistiques</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de votre boutique</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Commandes totales"
          value={stats.total_commandes}
          icon="📦"
          color="bg-blue-500"
        />
        <StatCard
          title="Ventes totales"
          value={formatPrice(stats.total_ventes)}
          icon="💰"
          color="bg-green-500"
        />
        <StatCard
          title="Clients"
          value={stats.total_clients}
          icon="👥"
          color="bg-purple-500"
        />
        <StatCard
          title="Produits"
          value={stats.total_produits}
          icon="🛍️"
          color="bg-orange-500"
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AlertCard
          title="Commandes en attente"
          value={stats.commandes_en_attente}
          description="Nécessitent votre attention"
          icon="⏰"
          color="bg-yellow-100 text-yellow-800"
        />
        <AlertCard
          title="Stock faible"
          value={stats.stock_faible}
          description="Produits à réapprovisionner"
          icon="⚠️"
          color="bg-red-100 text-red-800"
        />
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Produits les plus vendus</h2>
        <div className="space-y-4">
          {stats.top_produits.map((item, index) => (
            <div
              key={item.produit.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.produit.nom}</p>
                  <p className="text-sm text-gray-600">{item.quantite_vendue} vendus</p>
                </div>
              </div>
              <p className="font-bold text-green-600">{formatPrice(item.revenu)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Commandes récentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  N° Commande
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.commandes_recentes.map((commande) => {
                const status = formatCommandeStatus(commande.statut);
                return (
                  <tr key={commande.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {commande.numero_commande}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">Client #{commande.client_id}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatPrice(commande.montant_total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(commande.created_at).toLocaleDateString('fr-SN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Composants auxiliaires
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function AlertCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-6 ${color}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm">{description}</p>
    </div>
  );
}
