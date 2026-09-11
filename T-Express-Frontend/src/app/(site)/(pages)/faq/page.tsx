import { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/Legal/LegalPage";
import { LEGAL } from "@/config/legal";

export const metadata: Metadata = {
  title: "FAQ | T-Express",
  description: "Questions fréquentes : commander, payer, se faire livrer, suivre ou retourner une commande T-Express.",
};

const lien = "text-blue hover:underline";

const QUESTIONS: { question: string; reponse: React.ReactNode }[] = [
  {
    question: "Comment passer commande ?",
    reponse: (
      <>
        Ajoutez vos produits au panier, puis cliquez sur « Passer la commande ». Renseignez votre adresse de
        livraison et cliquez sur « Valider la commande » : la commande est enregistrée et un bouton vous permet
        d&apos;envoyer son récapitulatif à notre équipe sur WhatsApp. Elle vous répond pour confirmer la commande.
      </>
    ),
  },
  {
    question: "Faut-il créer un compte ?",
    reponse: (
      <>
        Oui, un compte est nécessaire pour commander : il permet de retrouver vos adresses et de suivre vos
        commandes. L&apos;inscription se fait sur la page{" "}
        <Link href="/signup" className={lien}>
          Inscription
        </Link>
        .
      </>
    ),
  },
  {
    question: "Comment payer ma commande ?",
    reponse: (
      <>
        Aucun paiement n&apos;est demandé sur le site. Le moyen et le moment du paiement sont convenus avec notre
        équipe sur WhatsApp, au moment où elle confirme votre commande.
      </>
    ),
  },
  {
    question: "Combien coûte la livraison et combien de temps prend-elle ?",
    reponse: (
      <>
        La livraison standard est actuellement gratuite, avec un délai indicatif de {LEGAL.delaiLivraison} après
        la confirmation de la commande.
      </>
    ),
  },
  {
    question: "Comment suivre ma commande ?",
    reponse: (
      <>
        Retrouvez vos commandes et leur statut dans{" "}
        <Link href="/my-account/orders" className={lien}>
          Mon compte › Mes commandes
        </Link>
        . Pour toute précision, écrivez-nous sur WhatsApp avec votre numéro de commande.
      </>
    ),
  },
  {
    question: "Puis-je modifier ou annuler ma commande ?",
    reponse: (
      <>
        Oui, tant qu&apos;elle n&apos;a pas été expédiée : contactez-nous sur WhatsApp ({LEGAL.whatsappAffiche}) en
        indiquant votre numéro de commande.
      </>
    ),
  },
  {
    question: "Le produit reçu ne me convient pas ou est abîmé, que faire ?",
    reponse: (
      <>
        Vous pouvez demander un retour dans les {LEGAL.delaiRetourJours} jours suivant la livraison, et signaler un
        produit abîmé ou non conforme dans les {LEGAL.delaiSignalementHeures} heures. Toutes les conditions sont
        dans notre{" "}
        <Link href="/refund-policy" className={lien}>
          politique de remboursement
        </Link>
        .
      </>
    ),
  },
  {
    question: "Mes données personnelles sont-elles protégées ?",
    reponse: (
      <>
        Oui. Nous ne collectons que ce qui est nécessaire pour traiter vos commandes et ne vendons jamais vos
        données. Le détail figure dans notre{" "}
        <Link href="/privacy" className={lien}>
          politique de confidentialité
        </Link>
        .
      </>
    ),
  },
];

const FaqPage = () => (
  <LegalPage titre="Questions fréquentes" fil="FAQ">
    <div className="divide-y divide-gray-3 border-y border-gray-3">
      {QUESTIONS.map(({ question, reponse }) => (
        <details key={question} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-dark [&::-webkit-details-marker]:hidden">
            {question}
            <span aria-hidden="true" className="text-xl text-blue transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3">{reponse}</p>
        </details>
      ))}
    </div>
  </LegalPage>
);

export default FaqPage;
