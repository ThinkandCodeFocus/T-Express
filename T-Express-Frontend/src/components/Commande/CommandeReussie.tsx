"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import WhatsAppIcon from "@/components/Common/WhatsAppIcon";
import { formatPrice } from "@/lib/utils";
import { ADMIN_WHATSAPP_NUMBER } from "@/lib/whatsapp";

/** Clé partagée avec le tunnel de commande. */
export const CLE_CONFIRMATION = "t-express:derniere-commande";

export interface Confirmation {
  commandeId: number;
  lienWhatsApp: string;
  total?: number;
  nombreArticles?: number;
}

/** Numéro de l'admin, affiché en clair pour qui n'a pas WhatsApp sur l'appareil. */
const NUMERO_LISIBLE = "+221 77 118 87 47";

export default function CommandeReussie() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [etat, setEtat] = useState<"chargement" | "prete" | "absente">("chargement");
  const dejaOuvert = useRef(false);

  useEffect(() => {
    let sauvegarde: string | null = null;

    try {
      sauvegarde = sessionStorage.getItem(CLE_CONFIRMATION);
    } catch {
      // Stockage indisponible (navigation privée, site bloqué) : la page
      // s'affiche quand même, sans reprise de la commande.
    }

    if (!sauvegarde) {
      setEtat("absente");
      return;
    }

    try {
      setConfirmation(JSON.parse(sauvegarde));
      setEtat("prete");
    } catch {
      setEtat("absente");
    }
  }, []);

  // WhatsApp s'ouvre tout seul : c'est par ce message que l'admin reçoit la
  // commande. Laissé au seul clic volontaire, il partait rarement.
  useEffect(() => {
    if (etat !== "prete" || !confirmation?.lienWhatsApp || dejaOuvert.current) return;

    dejaOuvert.current = true;
    const minuteur = window.setTimeout(() => {
      window.open(confirmation.lienWhatsApp, "_blank", "noopener,noreferrer");
    }, 1200);

    return () => window.clearTimeout(minuteur);
  }, [etat, confirmation]);

  if (etat === "chargement") {
    return (
      <>
        <Breadcrumb title={"Commande réussie"} pages={["commande"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[640px] mx-auto px-4">
            <div className="bg-white rounded-[10px] shadow-1 p-10 animate-pulse">
              <div className="h-6 w-2/3 bg-gray-3 rounded mb-4" />
              <div className="h-4 w-full bg-gray-3 rounded mb-2" />
              <div className="h-4 w-4/5 bg-gray-3 rounded" />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (etat === "absente" || !confirmation) {
    return (
      <>
        <Breadcrumb title={"Commande réussie"} pages={["commande"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[640px] mx-auto px-4">
            <div className="bg-white rounded-[10px] shadow-1 px-4 py-10 sm:p-12.5 text-center">
              <h1 className="text-xl font-medium text-dark mb-3">
                Aucune commande à afficher ici
              </h1>
              <p className="text-dark-4 mb-8">
                Cette page montre le récapitulatif juste après une commande. Vos
                commandes passées restent consultables dans votre compte.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/my-account/orders"
                  className="font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Voir mes commandes
                </Link>
                <Link
                  href="/shop-with-sidebar"
                  className="font-medium text-dark bg-gray-1 border border-gray-3 py-3 px-7 rounded-md ease-out duration-200 hover:border-blue hover:text-blue"
                >
                  Retour à la boutique
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Commande réussie"} pages={["commande"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-[10px] shadow-1 px-4 py-10 sm:p-12.5 text-center max-w-[680px] mx-auto">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-light-6 text-green flex items-center justify-center">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-dark mb-3">
              Commande réussie
            </h1>

            <p className="text-lg text-dark-2 mb-2">
              Votre commande <span className="font-medium text-dark">#{confirmation.commandeId}</span>{" "}
              est enregistrée.
            </p>

            <p className="text-lg text-dark-2 mb-8">
              <span className="font-medium text-dark">Nous allons vous contacter sur WhatsApp</span>{" "}
              pour confirmer la disponibilité, le paiement et la livraison.
            </p>

            {(confirmation.total !== undefined || confirmation.nombreArticles !== undefined) && (
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8 text-dark-4">
                {confirmation.nombreArticles !== undefined && (
                  <span>
                    {confirmation.nombreArticles}{" "}
                    {confirmation.nombreArticles > 1 ? "articles" : "article"}
                  </span>
                )}
                {confirmation.total !== undefined && (
                  <span>
                    Total : <span className="font-medium text-dark">{formatPrice(confirmation.total)}</span>
                  </span>
                )}
              </div>
            )}

            <div className="rounded-md bg-gray-1 border border-gray-3 p-5 mb-7 text-left">
              <p className="font-medium text-dark mb-1.5">Envoyez-nous le récapitulatif</p>
              <p className="text-dark-4 text-custom-sm">
                WhatsApp s&apos;ouvre automatiquement avec votre commande déjà rédigée :
                produits, quantités, adresse et total. Il ne vous reste qu&apos;à appuyer
                sur envoyer. C&apos;est ce message qui nous prévient.
              </p>
            </div>

            <a
              href={confirmation.lienWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto font-medium text-white bg-[#25D366] py-3.5 px-8 rounded-md ease-out duration-200 hover:bg-[#1ebe5b]"
            >
              <WhatsAppIcon />
              Envoyer ma commande sur WhatsApp
            </a>

            <p className="text-custom-sm text-dark-5 mt-4">
              WhatsApp ne s&apos;est pas ouvert ? Écrivez-nous au {NUMERO_LISIBLE} en
              précisant le numéro de commande #{confirmation.commandeId}.
            </p>

            <div className="mt-8 pt-6 border-t border-gray-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href="/my-account/orders" className="text-blue hover:underline">
                Suivre ma commande
              </Link>
              <Link href="/shop-with-sidebar" className="text-blue hover:underline">
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
