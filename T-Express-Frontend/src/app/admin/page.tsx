"use client";
import React, { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import type { DashboardStats } from "@/types/api.types";
import { formatPrice, formatCommandeStatus, formatRelativeTime } from "@/lib/utils";

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
      // Si l'endpoint n'existe pas encore, utiliser des données mockées
      console.warn("Dashboard stats endpoint not available, using mock data");
      setStats({
        total_commandes: 0,
        total_ventes: 0,
        total_clients: 0,
        total_produits: 0,
        commandes_en_attente: 0,
        stock_faible: 0,
        ventes_mois: 0,
        croissance_ventes: 0,
        top_produits: [],
        commandes_recentes: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-light-5 border-t-blue rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-light-4 border-t-blue-light-2 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="bg-red-light-6 border border-red-light-3 rounded-lg p-4">
          <p className="text-red font-medium">Impossible de charger les statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-1 p-6 lg:p-8">
      {/* Header avec gradient */}
      <div className="mb-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue via-blue-dark to-blue-light rounded-2xl p-8 lg:p-10 shadow-3">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-blue-light-4 text-lg">
              Bienvenue dans votre espace d&apos;administration T-Express
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Grid moderne */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Commandes payées"
          value={stats.total_commandes}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          gradient="from-blue to-blue-dark"
          trend={null}
        />
        <StatCard
          title="Ventes totales"
          value={formatPrice(stats.total_ventes)}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          gradient="from-green to-green-dark"
          trend={null}
        />
        <StatCard
          title="Clients"
          value={stats.total_clients}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          gradient="from-purple-500 to-purple-700"
          trend={null}
        />
        <StatCard
          title="Produits"
          value={stats.total_produits}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          gradient="from-orange to-orange-dark"
          trend={null}
        />
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AlertCard
          title="Commandes en attente"
          value={stats.commandes_en_attente}
          description="Commandes payées à traiter"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
        <AlertCard
          title="Stock faible"
          value={stats.stock_faible}
          description="Produits à réapprovisionner"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="red"
        />
      </div>

      {/* Contenu principal - 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Produits */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-2 p-6 lg:p-8 border border-gray-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">Produits les plus vendus</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-blue to-blue-light rounded-full"></div>
            </div>
            <div className="space-y-4">
              {stats.top_produits.length > 0 ? (
                stats.top_produits.map((item, index) => (
                  <div
                    key={item.produit.id}
                    className="flex items-center justify-between p-4 bg-gray-1 rounded-lg hover:bg-gray-2 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue to-blue-dark text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                          {index + 1}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark truncate">{item.produit.nom}</p>
                        <p className="text-sm text-dark-4">{item.quantite_vendue} vendus</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green text-lg">{formatPrice(item.revenu)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-dark-4">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p>Aucun produit vendu pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-2 p-6 lg:p-8 border border-gray-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">Commandes récentes</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-blue to-blue-light rounded-full"></div>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
              {stats.commandes_recentes.length > 0 ? (
                stats.commandes_recentes.map((commande) => {
                  const status = formatCommandeStatus(commande.statut);
                  return (
                    <div
                      key={commande.id}
                      className="p-4 bg-gray-1 rounded-lg hover:bg-gray-2 transition-colors duration-200 border-l-4 border-green"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-dark text-sm">#{commande.numero_commande || commande.id}</p>
                          <p className="text-xs text-dark-4 mt-1">{formatRelativeTime(commande.created_at)}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-3">
                        <p className="text-xs text-dark-4 mb-1">
                          {commande.client ? `${commande.client.prenom} ${commande.client.nom}` : `Client #${commande.client_id}`}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-dark text-lg">{formatPrice(commande.montant_total)}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Payé
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-dark-4">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p>Aucune commande payée récente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant StatCard moderne
function StatCard({
  title,
  value,
  icon,
  gradient,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend: number | null;
}) {
  return (
    <div className="group relative bg-white rounded-xl shadow-2 p-6 border border-gray-3 hover:shadow-3 transition-all duration-300 overflow-hidden">
      {/* Gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {trend !== null && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend >= 0 ? 'text-green' : 'text-red'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trend >= 0 ? "M13 7l5 5m0 0l-5 5m5-5H6" : "M13 17l5-5m0 0l-5-5m5 5H6"} />
              </svg>
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-dark-4 mb-1">{title}</p>
          <p className="text-3xl font-bold text-dark">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Composant AlertCard
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
  icon: React.ReactNode;
  color: "yellow" | "red";
}) {
  const colorClasses = {
    yellow: {
      bg: "bg-yellow-light-4",
      border: "border-yellow-light-2",
      text: "text-yellow-dark-2",
      iconBg: "bg-yellow",
    },
    red: {
      bg: "bg-red-light-6",
      border: "border-red-light-3",
      text: "text-red-dark",
      iconBg: "bg-red",
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} ${classes.border} border-2 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-start gap-4">
        <div className={`${classes.iconBg} p-3 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${classes.text} mb-1`}>{title}</h3>
          <p className="text-4xl font-extrabold mb-2">{value}</p>
          <p className={`text-sm ${classes.text} opacity-80`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
