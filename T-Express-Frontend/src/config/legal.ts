/**
 * Valeurs reprises dans les pages légales (confidentialité, CGU,
 * remboursement, FAQ). Ce sont des engagements commerciaux : les modifier
 * ici les met à jour partout, et penser à changer la date de mise à jour.
 */
export const LEGAL = {
  miseAJour: "11 septembre 2026",
  /** Délai, après la livraison, pour demander un retour. */
  delaiRetourJours: 7,
  /** Délai pour signaler un produit abîmé ou non conforme. */
  delaiSignalementHeures: 48,
  /** Délai de livraison standard annoncé au checkout. */
  delaiLivraison: "3 à 5 jours ouvrés",
  whatsappAffiche: "+221 77 118 87 47",
} as const;
