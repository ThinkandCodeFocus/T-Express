"use client";
import React, { useEffect, useState } from "react";
import { commandeService } from "@/services/commande.service";
import type { Commande, CommandeStatut } from "@/types/api.types";
import { LOCALE_CONFIG } from "@/config/api.config";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminErrorState from "@/components/Admin/AdminErrorState";

// Couleurs du thème Tailwind du projet (palette redéfinie : bg-yellow-100,
// bg-purple-100... n'y existent pas et laissaient les badges sans couleur).
const COULEUR = {
  attente: "bg-yellow-light-2 text-yellow-dark-2",
  info: "bg-blue-light-5 text-blue-dark",
  encours: "bg-orange/10 text-orange-dark",
  expedie: "bg-teal/10 text-teal-dark",
  succes: "bg-green-light-6 text-green-dark",
  echec: "bg-red-light-6 text-red-dark",
  neutre: "bg-gray-2 text-dark-4",
};

// Statuts de commande (affichage seulement, pas modifiable directement)
const STATUTS_COMMANDE: Record<string, { label: string; color: string }> = {
  "En attente": { label: "En attente", color: COULEUR.attente },
  "Validée": { label: "Validée", color: COULEUR.info },
  "Préparation": { label: "En préparation", color: COULEUR.encours },
  "Expédiée": { label: "Expédiée", color: COULEUR.expedie },
  "Livrée": { label: "Livrée", color: COULEUR.succes },
  "Annulée": { label: "Annulée", color: COULEUR.echec },
};

// Valeurs exactes de l'ENUM dans la table paiements (modifiable par l'admin)
const STATUTS_PAIEMENT_OPTIONS = [
  { value: "en_attente", label: "En attente", color: COULEUR.attente },
  { value: "validé", label: "Validé", color: COULEUR.succes },
  { value: "Complété", label: "Complété", color: COULEUR.succes },
  { value: "Accepté", label: "Accepté", color: COULEUR.succes },
  { value: "échoué", label: "Échoué", color: COULEUR.echec },
  { value: "Refusé", label: "Refusé", color: COULEUR.echec },
];

const STATUTS_PAIEMENT: Record<string, { label: string; color: string }> = {
  "en_attente": { label: "En attente", color: COULEUR.attente },
  "En attente": { label: "En attente", color: COULEUR.attente },
  "validé": { label: "Validé", color: COULEUR.succes },
  "Complété": { label: "Complété", color: COULEUR.succes },
  "Accepté": { label: "Accepté", color: COULEUR.succes },
  "échoué": { label: "Échoué", color: COULEUR.echec },
  "Refusé": { label: "Refusé", color: COULEUR.echec },
};

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<Commande | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Charger les commandes
  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commandeService.getListe();
      setCommandes(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  // Voir le détail d'une commande
  const handleShowDetail = async (id: number) => {
    setLoading(true);
    try {
      const detail = await commandeService.getDetailAdmin(id);
      setShowDetail(detail);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement du détail.");
    } finally {
      setLoading(false);
    }
  };

  // Fermer le détail
  const closeDetail = () => setShowDetail(null);

  // Changer le statut de paiement d'une commande
  const handleStatusChange = async (commandeId: number, newStatut: string) => {
    setUpdatingStatus(commandeId);
    try {
      const updatedCommande = await commandeService.updateStatus(commandeId, newStatut);
      // Mettre à jour localement avec la commande retournée par le backend
      setCommandes(prev => 
        prev.map(cmd => 
          cmd.id === commandeId ? updatedCommande : cmd
        )
      );
      // Si le modal est ouvert, mettre à jour aussi
      if (showDetail?.id === commandeId) {
        setShowDetail(updatedCommande);
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Obtenir le style du statut de commande
  const getStatutCommandeStyle = (statut: string) => {
    return STATUTS_COMMANDE[statut]?.color || COULEUR.neutre;
  };

  // Obtenir le style du statut de paiement
  const getStatutPaiementStyle = (statut?: string) => {
    if (!statut) return { label: "N/A", color: COULEUR.neutre };
    return STATUTS_PAIEMENT[statut] || { label: statut, color: COULEUR.neutre };
  };

  const nomClient = (cmd: Commande) =>
    cmd.client ? `${cmd.client.prenom} ${cmd.client.nom}` : `Client #${cmd.client_id}`;

  // Éléments partagés par le tableau (desktop) et les cartes (mobile).
  const selectPaiement = (cmd: Commande) => (
    <>
      <select
        value={cmd.paiement?.statut || "en_attente"}
        onChange={(e) => handleStatusChange(cmd.id, e.target.value)}
        disabled={updatingStatus === cmd.id || !cmd.paiement}
        aria-label={`Statut du paiement de la commande #${cmd.id}`}
        className={`text-xs font-medium rounded-lg px-2 py-1.5 border cursor-pointer ${getStatutPaiementStyle(cmd.paiement?.statut).color}`}
      >
        {STATUTS_PAIEMENT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {updatingStatus === cmd.id && <span className="ml-2 text-xs text-dark-4">...</span>}
    </>
  );

  const badgeCommande = (cmd: Commande) => {
    const style = STATUTS_COMMANDE[cmd.statut] || { label: cmd.statut, color: COULEUR.neutre };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.color}`}>
        {style.label}
      </span>
    );
  };

  const actions = (cmd: Commande, disposition: string) => (
    <div className={disposition}>
      <button className="text-blue hover:underline text-sm text-left" onClick={() => handleShowDetail(cmd.id)}>
        Voir détails
      </button>
      <Link href={`/admin/livraisons?commande=${cmd.id}`} className="text-teal-dark hover:underline text-sm">
        Gérer livraison
      </Link>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des commandes</h1>

      <div className="bg-white rounded shadow p-4 sm:p-6">
        {loading && !commandes.length ? (
          <div className="text-center py-8">Chargement...</div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={fetchCommandes} />
        ) : (
          <>
          {/* Cartes sur mobile : le tableau (7 colonnes) débordait de l'écran. */}
          <ul className="md:hidden divide-y divide-gray-3">
            {commandes.length === 0 ? (
              <li className="text-center py-8 text-dark-4">Aucune commande trouvée.</li>
            ) : (
              commandes.map((cmd) => (
                <li key={cmd.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-dark">#{cmd.id}</p>
                      <p className="text-sm text-dark truncate">{nomClient(cmd)}</p>
                      <p className="text-xs text-dark-4">{LOCALE_CONFIG.formatDate(cmd.created_at)}</p>
                    </div>
                    <p className="font-semibold text-dark whitespace-nowrap">
                      {LOCALE_CONFIG.formatPrice(cmd.montant_total)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {badgeCommande(cmd)}
                    <span className="text-xs text-dark-4">Paiement :</span>
                    {selectPaiement(cmd)}
                  </div>
                  {actions(cmd, "flex gap-5 mt-3")}
                </li>
              ))
            )}
          </ul>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-3 font-semibold">ID</th>
                  <th className="py-3 px-3 font-semibold">Client</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold">Montant</th>
                  <th className="py-3 px-3 font-semibold">Statut Paiement</th>
                  <th className="py-3 px-3 font-semibold">Statut Commande</th>
                  <th className="py-3 px-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commandes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                ) : (
                  commandes.map((cmd) => (
                      <tr key={cmd.id} className="hover:bg-gray-1">
                        <td className="py-3 px-3 font-medium">#{cmd.id}</td>
                        <td className="py-3 px-3">{nomClient(cmd)}</td>
                        <td className="py-3 px-3">{LOCALE_CONFIG.formatDate(cmd.created_at)}</td>
                        <td className="py-3 px-3 font-medium">{LOCALE_CONFIG.formatPrice(cmd.montant_total)}</td>
                        <td className="py-3 px-3">{selectPaiement(cmd)}</td>
                        {/* Statut de commande en lecture seule */}
                        <td className="py-3 px-3">{badgeCommande(cmd)}</td>
                        <td className="py-3 px-3">{actions(cmd, "flex flex-col gap-1")}</td>
                      </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Modal détail commande */}
      {showDetail && (
        <div className="fixed inset-0 bg-dark/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Commande #{showDetail.id}</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl"
                onClick={closeDetail}
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Infos client */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Client</h3>
                <p>{showDetail.client ? `${showDetail.client.prenom} ${showDetail.client.nom}` : `ID #${showDetail.client_id}`}</p>
                {showDetail.client?.email && <p className="text-sm text-gray-600">{showDetail.client.email}</p>}
                {showDetail.client?.telephone && <p className="text-sm text-gray-600">{showDetail.client.telephone}</p>}
              </div>

              {/* Statuts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Statut Paiement</h3>
                  <select
                    value={showDetail.paiement?.statut || "en_attente"}
                    onChange={(e) => handleStatusChange(showDetail.id, e.target.value)}
                    disabled={updatingStatus === showDetail.id || !showDetail.paiement}
                    className={`text-sm font-medium rounded-lg px-3 py-2 border w-full ${getStatutPaiementStyle(showDetail.paiement?.statut).color}`}
                  >
                    {STATUTS_PAIEMENT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {showDetail.paiement?.methode && (
                    <p className="text-sm text-gray-600 mt-1">Mode: {showDetail.paiement.methode}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Statut Commande</h3>
                  <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getStatutCommandeStyle(showDetail.statut)}`}>
                    {STATUTS_COMMANDE[showDetail.statut]?.label || showDetail.statut}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    Le statut commande est mis à jour automatiquement quand le paiement est validé.
                  </p>
    <Link
  href={`/admin/livraisons?commande=${showDetail.id}`}
  className="inline-block mt-3 text-sm text-purple-600 hover:underline font-medium"
>
  → Gérer la livraison de cette commande
</Link>
                </div>
              </div>

              {/* Infos commande */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Informations</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-600">Date:</span> {LOCALE_CONFIG.formatDate(showDetail.created_at)}</p>
                  <p><span className="text-gray-600">Montant:</span> <strong>{LOCALE_CONFIG.formatPrice(showDetail.montant_total)}</strong></p>
                </div>
              </div>

              {/* Adresses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                  <p className="text-sm">{showDetail.adresse_livraison?.adresse_ligne_1 || "Non définie"}</p>
                  {showDetail.adresse_livraison?.ville && (
                    <p className="text-sm text-gray-600">{showDetail.adresse_livraison.ville}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Adresse de facturation</h3>
                  <p className="text-sm">{showDetail.adresse_facturation?.adresse_ligne_1 || "Non définie"}</p>
                  {showDetail.adresse_facturation?.ville && (
                    <p className="text-sm text-gray-600">{showDetail.adresse_facturation.ville}</p>
                  )}
                </div>
              </div>

              {/* Articles */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Articles commandés</h3>
                <div className="space-y-2">
                  {showDetail.details?.map((d) => (
                    <div key={d.id} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div>
                        <p className="font-medium">{d.produit?.nom || `Produit #${d.produit_id}`}</p>
                        <p className="text-sm text-gray-600">Quantité: {d.quantite}</p>
                      </div>
                      <p className="font-medium">{LOCALE_CONFIG.formatPrice(d.prix_unitaire * d.quantite)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
