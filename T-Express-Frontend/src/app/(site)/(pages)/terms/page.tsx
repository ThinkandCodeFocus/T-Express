import { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Liste, Section } from "@/components/Legal/LegalPage";
import { LEGAL } from "@/config/legal";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | T-Express",
  description: "Conditions d'utilisation du site T-Express : compte, commandes, prix, livraison et retours.",
};

const TermsPage = () => (
  <LegalPage
    titre="Conditions d'utilisation"
    fil="conditions d'utilisation"
    intro={
      <p>
        Les présentes conditions encadrent l&apos;utilisation du site T-Express et les commandes qui y sont
        passées. En créant un compte ou en passant commande, vous les acceptez.
      </p>
    }
  >
    <Section titre="1. Le service">
      <p>
        T-Express est une boutique en ligne exploitée au Sénégal. Le site présente un catalogue de produits
        et permet de passer commande ; chaque commande est ensuite confirmée par notre équipe sur WhatsApp.
      </p>
    </Section>

    <Section titre="2. Compte client">
      <Liste>
        <li>Un compte est nécessaire pour passer commande.</li>
        <li>
          Vous vous engagez à fournir des informations exactes, notamment votre téléphone et votre adresse de
          livraison, indispensables pour vous livrer.
        </li>
        <li>
          Vous êtes responsable de la confidentialité de votre mot de passe et des actions réalisées avec votre
          compte.
        </li>
      </Liste>
    </Section>

    <Section titre="3. Commandes">
      <p>
        Après validation du panier, la commande est enregistrée et vous envoyez son récapitulatif à notre équipe
        sur WhatsApp. <strong>La commande est définitive une fois confirmée par notre équipe</strong>, qui
        convient alors avec vous du paiement et de la livraison.
      </p>
      <p>
        T-Express peut refuser ou annuler une commande, par exemple en cas de produit indisponible,
        d&apos;informations de livraison incomplètes ou de commande manifestement anormale. Vous en êtes
        informé et aucun montant ne vous est dû dans ce cas.
      </p>
    </Section>

    <Section titre="4. Prix et disponibilité">
      <p>
        Les prix sont indiqués en francs CFA (FCFA). Le prix appliqué est celui affiché au moment de la
        commande. Les produits sont proposés dans la limite des stocks disponibles ; malgré notre attention, une
        erreur d&apos;affichage reste possible et vous serait signalée avant confirmation.
      </p>
    </Section>

    <Section titre="5. Paiement">
      <p>
        Aucun paiement n&apos;est effectué sur le site. Le moyen et le moment du paiement sont convenus avec
        notre équipe lors de la confirmation de la commande sur WhatsApp.
      </p>
    </Section>

    <Section titre="6. Livraison">
      <p>
        La livraison standard est actuellement gratuite, avec un délai indicatif de {LEGAL.delaiLivraison} après
        confirmation. Ce délai peut varier selon la destination ; nous vous prévenons en cas de retard.
      </p>
    </Section>

    <Section titre="7. Retours et remboursements">
      <p>
        Les conditions de retour, d&apos;échange et de remboursement sont détaillées dans notre{" "}
        <Link href="/refund-policy" className="text-blue hover:underline">
          politique de remboursement
        </Link>
        .
      </p>
    </Section>

    <Section titre="8. Avis clients">
      <p>
        Les avis doivent porter sur le produit et rester respectueux. T-Express peut retirer un avis injurieux,
        hors sujet ou contenant des informations personnelles.
      </p>
    </Section>

    <Section titre="9. Propriété intellectuelle">
      <p>
        Les éléments du site (logo, textes, visuels) appartiennent à T-Express ou à leurs titulaires et ne
        peuvent pas être réutilisés sans autorisation.
      </p>
    </Section>

    <Section titre="10. Données personnelles">
      <p>
        Le traitement de vos données est décrit dans notre{" "}
        <Link href="/privacy" className="text-blue hover:underline">
          politique de confidentialité
        </Link>
        .
      </p>
    </Section>

    <Section titre="11. Droit applicable et litiges">
      <p>
        Ces conditions sont soumises au droit sénégalais. En cas de difficulté, contactez-nous d&apos;abord :
        nous chercherons une solution amiable. À défaut, le litige sera porté devant les juridictions
        compétentes du Sénégal.
      </p>
    </Section>
  </LegalPage>
);

export default TermsPage;
