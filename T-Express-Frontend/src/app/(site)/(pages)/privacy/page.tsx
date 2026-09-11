import { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Liste, Section } from "@/components/Legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité | T-Express",
  description: "Quelles données T-Express collecte, pourquoi, combien de temps, et comment exercer vos droits.",
};

const PrivacyPage = () => (
  <LegalPage
    titre="Politique de confidentialité"
    fil="confidentialité"
    intro={
      <p>
        Cette page explique quelles données personnelles T-Express collecte lorsque vous utilisez le site,
        à quoi elles servent et comment exercer vos droits, conformément à la loi sénégalaise n° 2008-12 du
        25 janvier 2008 sur la protection des données à caractère personnel.
      </p>
    }
  >
    <Section titre="1. Responsable du traitement">
      <p>
        Les données sont traitées par T-Express, boutique en ligne exploitée au Sénégal. Pour toute question
        sur vos données, contactez-nous (coordonnées en bas de page).
      </p>
    </Section>

    <Section titre="2. Données collectées">
      <Liste>
        <li>
          <strong>Compte :</strong> nom, prénom, adresse e-mail, téléphone, mot de passe (enregistré chiffré,
          jamais en clair) et, si vous la renseignez, date de naissance.
        </li>
        <li>
          <strong>Livraison :</strong> nom du destinataire, adresse, ville et téléphone.
        </li>
        <li>
          <strong>Activité sur le site :</strong> commandes, panier, produits favoris et avis publiés.
        </li>
        <li>
          <strong>Données techniques :</strong> un jeton de connexion conservé dans votre navigateur pour vous
          garder connecté. Le site n&apos;utilise pas de cookies publicitaires.
        </li>
      </Liste>
      <p>
        Le site n&apos;enregistre aucune donnée bancaire : le paiement est convenu directement avec notre équipe
        lors de la confirmation de la commande.
      </p>
    </Section>

    <Section titre="3. Pourquoi nous les utilisons">
      <Liste>
        <li>créer et gérer votre compte ;</li>
        <li>traiter, confirmer et livrer vos commandes, et gérer les éventuels retours ;</li>
        <li>vous contacter au sujet de vos commandes et répondre à vos demandes ;</li>
        <li>afficher vos avis sur les produits ;</li>
        <li>assurer la sécurité du site et prévenir la fraude.</li>
      </Liste>
      <p>Vos données ne sont jamais vendues ni utilisées à des fins publicitaires par des tiers.</p>
    </Section>

    <Section titre="4. Qui y a accès">
      <Liste>
        <li>l&apos;équipe T-Express, pour le traitement des commandes et le service client ;</li>
        <li>
          le cas échéant, le livreur, uniquement pour les informations nécessaires à la livraison (nom,
          téléphone, adresse) ;
        </li>
        <li>notre hébergeur, qui stocke les données du site pour notre compte.</li>
      </Liste>
      <p>
        Lorsque vous finalisez une commande, le récapitulatif est envoyé par vous-même sur WhatsApp : ce message
        est alors aussi traité par WhatsApp selon sa propre politique de confidentialité.
      </p>
      <p>
        Sur les avis publiés, seuls votre prénom et l&apos;initiale de votre nom apparaissent publiquement.
      </p>
    </Section>

    <Section titre="5. Durée de conservation">
      <p>
        Les données de votre compte sont conservées tant qu&apos;il est actif. Les informations liées aux
        commandes sont conservées le temps nécessaire à leur suivi (livraison, retours, service client) et au
        respect de nos obligations légales et comptables.
      </p>
    </Section>

    <Section titre="6. Sécurité">
      <p>
        Les échanges avec le site sont chiffrés (HTTPS) et les mots de passe sont stockés sous forme chiffrée.
        Gardez votre mot de passe confidentiel et déconnectez-vous sur un appareil partagé.
      </p>
    </Section>

    <Section titre="7. Vos droits">
      <p>
        Vous pouvez à tout moment demander l&apos;accès à vos données, leur rectification ou leur suppression,
        et vous opposer à leur traitement pour un motif légitime. Une partie de ces informations est modifiable
        directement depuis{" "}
        <Link href="/my-account" className="text-blue hover:underline">
          votre compte
        </Link>
        . Pour le reste, contactez-nous : nous vous répondrons dans les meilleurs délais.
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission de Protection
        des Données Personnelles (CDP) du Sénégal.
      </p>
    </Section>

    <Section titre="8. Modifications">
      <p>
        Cette politique peut évoluer, par exemple si le site propose de nouveaux services. La date de dernière
        mise à jour figure en haut de cette page.
      </p>
    </Section>
  </LegalPage>
);

export default PrivacyPage;
