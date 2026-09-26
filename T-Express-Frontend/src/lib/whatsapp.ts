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

export interface DonneesMessageMotDePasse {
  email: string;
  /** Facultatif : aide l'admin à retrouver le compte et à vérifier l'identité. */
  telephone?: string;
}

/**
 * Demande de réinitialisation de mot de passe envoyée à l'admin.
 *
 * Le backend n'expose aucun endpoint de réinitialisation ni d'envoi d'email :
 * la demande passe donc par WhatsApp, comme la finalisation des commandes.
 */
export function messageMotDePasseOublieWhatsApp(
  donnees: DonneesMessageMotDePasse
): string {
  return [
    "Bonjour T-Express, j'ai oublié le mot de passe de mon compte.",
    "",
    "*Compte concerné*",
    `Email : ${donnees.email}`,
    ...(donnees.telephone ? [`Téléphone : ${donnees.telephone}`] : []),
    "",
    "Pouvez-vous m'aider à le réinitialiser ?",
  ].join("\n");
}

export interface DonneesMessageProduit {
  nom: string;
  /** Prix effectivement payé, promotion déduite. */
  prix: number;
  /** Prix barré, seulement s'il y a une promotion. */
  prixInitial?: number | null;
  /** URL absolue de la fiche produit. */
  lien: string;
  /** URL absolue de la photo, pour que l'admin voie de quoi il s'agit. */
  image?: string | null;
  quantite?: number;
}

/**
 * Demande d'achat d'un produit, envoyée à l'admin.
 *
 * Il n'y a plus de paiement en ligne : l'acheteur signale le produit qui
 * l'intéresse et l'admin reprend la main sur WhatsApp. Le message porte tout
 * ce qu'il faut pour répondre sans rien demander en retour, l'image comprise :
 * WhatsApp affiche un aperçu du premier lien, donc celui de la fiche produit
 * est placé avant celui de la photo.
 */
export function messageProduitWhatsApp(produit: DonneesMessageProduit): string {
  const quantite = produit.quantite && produit.quantite > 1 ? produit.quantite : 1;

  return [
    `Bonjour T-Express, ce produit m'intéresse : *${produit.nom}*`,
    "",
    `Prix : ${formatPrice(produit.prix)}`,
    ...(produit.prixInitial && produit.prixInitial > produit.prix
      ? [`Prix initial : ${formatPrice(produit.prixInitial)}`]
      : []),
    ...(quantite > 1 ? [`Quantité souhaitée : ${quantite}`] : []),
    "",
    `Fiche produit : ${produit.lien}`,
    ...(produit.image ? [`Photo : ${produit.image}`] : []),
    "",
    "Est-il disponible ?",
  ].join("\n");
}
