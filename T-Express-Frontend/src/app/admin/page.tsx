import React from "react";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {/* Widgets statistiques */}
        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-500">Produits</p>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-500">Commandes</p>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-500">Clients</p>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-500">Chiffre d'affaires</p>
          <p className="text-2xl font-bold">-- FCFA</p>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dernières commandes</h2>
        <p className="text-gray-500">À implémenter : liste des dernières commandes...</p>
      </div>
    </div>
  );
}
