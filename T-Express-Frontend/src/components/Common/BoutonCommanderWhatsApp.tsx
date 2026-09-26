"use client";

import React from "react";
import WhatsAppIcon from "@/components/Common/WhatsAppIcon";
import { SITE_URL } from "@/config/site";
import { lienWhatsAppAdmin, messageProduitWhatsApp } from "@/lib/whatsapp";

interface Props {
  produitId: number | string;
  nom: string;
  prix: number;
  prixInitial?: number | null;
  /** URL de la photo telle que résolue pour l'affichage. */
  image?: string | null;
  quantite?: number;
  /** `compact` pour les vignettes de la boutique, `plein` pour les fiches. */
  taille?: "compact" | "plein";
  className?: string;
}

/**
 * Commande directe sur WhatsApp, sans compte ni panier.
 *
 * Le paiement en ligne a été retiré : l'acheteur signale le produit à l'admin,
 * qui reprend la main sur WhatsApp. Ce chemin est volontairement indépendant du
 * panier, dont l'API exige une authentification : un visiteur non connecté doit
 * pouvoir commander.
 */
export default function BoutonCommanderWhatsApp({
  produitId,
  nom,
  prix,
  prixInitial,
  image,
  quantite,
  taille = "compact",
  className = "",
}: Props) {
  const lien = `${SITE_URL}/shop-details?id=${produitId}`;

  // Seule une URL absolue est exploitable dans le message : une image de repli
  // servie en chemin relatif ne dirait rien à l'admin.
  const imageAbsolue = image && /^https?:\/\//i.test(image) ? image : null;

  const href = lienWhatsAppAdmin(
    messageProduitWhatsApp({
      nom,
      prix,
      prixInitial,
      lien,
      image: imageAbsolue,
      quantite,
    })
  );

  const base =
    "inline-flex items-center justify-center gap-2 font-medium text-white bg-[#25D366] rounded-md ease-out duration-200 hover:bg-[#1ebe5b]";
  const dimensions =
    taille === "plein" ? "w-full py-3 px-6 text-base" : "w-full py-2.5 px-4 text-custom-sm";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`${base} ${dimensions} ${className}`}
      aria-label={`Commander ${nom} sur WhatsApp`}
    >
      <WhatsAppIcon size={taille === "plein" ? 20 : 16} />
      Commander sur WhatsApp
    </a>
  );
}
