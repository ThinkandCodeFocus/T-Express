/**
 * Contact WhatsApp de l'administrateur T-Express.
 *
 * Le paiement en ligne (Wave) n'est plus disponible : les commandes sont
 * finalisées manuellement par l'admin sur WhatsApp (ticket #2).
 */

import { formatPrice } from "@/lib/utils";

/** Format international sans "+" ni espaces, comme l'attend wa.me. */
export const ADMIN_WHATSAPP_NUMBER = "221771188747";

/** Lien ouvrant une conversation WhatsApp avec l'admin, message pré-rempli. */
export function lienWhatsAppAdmin(message: string): string {
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface LigneMessageCommande {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  /** URL absolue de la fiche produit, pour que l'admin l'identifie vite. */
  lien: string;
}

export interface DonneesMessageCommande {
  commandeId: number;
  client: { nom: string; telephone: string; adresse: string };
  lignes: LigneMessageCommande[];
  fraisLivraison: number;
  total: number;
  notes?: string;
}

/** Récapitulatif de commande envoyé à l'admin pour qu'il la traite. */
export function messageCommandeWhatsApp(commande: DonneesMessageCommande): string {
  const produits = commande.lignes.map(
    (ligne, i) =>
      `${i + 1}. ${ligne.nom} × ${ligne.quantite} — ${formatPrice(ligne.prixUnitaire)} l'unité\n   ${ligne.lien}`
  );

  return [
    // "#<id>" : c'est ainsi que la commande apparaît dans l'admin.
    `Bonjour T-Express, je souhaite finaliser ma commande #${commande.commandeId}.`,
    "",
    "*Client*",
    `Nom : ${commande.client.nom}`,
    `Téléphone : ${commande.client.telephone}`,
    `Adresse de livraison : ${commande.client.adresse}`,
    "",
    "*Produits*",
    ...produits,
    "",
    `Livraison : ${commande.fraisLivraison > 0 ? formatPrice(commande.fraisLivraison) : "gratuite"}`,
    `*Total : ${formatPrice(commande.total)}*`,
    ...(commande.notes ? ["", `Notes : ${commande.notes}`] : []),
  ].join("\n");
}
