import { Metadata } from "next";
import LegalPage, { Liste, Section } from "@/components/Legal/LegalPage";
import { LEGAL } from "@/config/legal";

export const metadata: Metadata = {
  title: "Politique de remboursement | T-Express",
  description: "Retours, échanges et remboursements chez T-Express : délais, conditions et démarche.",
};

const RefundPolicyPage = () => (
  <LegalPage
    titre="Politique de remboursement"
    fil="remboursement"
    intro={
      <p>
        Un produit ne vous convient pas ou est arrivé abîmé ? Voici comment demander un retour, un échange ou un
        remboursement.
      </p>
    }
  >
    <Section titre="1. Produit abîmé, défectueux ou non conforme">
      <p>
        Signalez-le-nous <strong>dans les {LEGAL.delaiSignalementHeures} heures suivant la livraison</strong>,
        avec votre numéro de commande et des photos du produit et de l&apos;emballage. Après vérification, nous
        vous proposons un échange ou un remboursement, sans frais pour vous.
      </p>
    </Section>

    <Section titre="2. Retour d'un produit qui ne vous convient pas">
      <p>
        Vous pouvez demander un retour <strong>dans les {LEGAL.delaiRetourJours} jours suivant la livraison</strong>,
        si le produit :
      </p>
      <Liste>
        <li>n&apos;a pas été utilisé, lavé ni endommagé ;</li>
        <li>est complet (accessoires, notices) et dans son emballage d&apos;origine.</li>
      </Liste>
      <p>
        Pour des raisons d&apos;hygiène, certains articles ne peuvent pas être repris une fois ouverts (par
        exemple les produits de soin ou les écouteurs intra-auriculaires) ; ce sera précisé lors de votre
        demande.
      </p>
    </Section>

    <Section titre="3. Comment faire une demande">
      <Liste>
        <li>
          Contactez-nous sur WhatsApp ({LEGAL.whatsappAffiche}) ou via la page Contact, en indiquant votre numéro
          de commande, le ou les produits concernés et la raison du retour.
        </li>
        <li>Notre équipe examine la demande et vous répond pour l&apos;accepter ou l&apos;expliquer si elle est refusée.</li>
        <li>Si elle est acceptée, nous convenons avec vous de la reprise du produit.</li>
      </Liste>
    </Section>

    <Section titre="4. Remboursement">
      <p>
        Une fois le produit reçu et vérifié, le remboursement est effectué par le moyen de paiement convenu avec
        vous, dans les meilleurs délais. Vous pouvez aussi choisir un échange contre un autre produit.
      </p>
    </Section>

    <Section titre="5. Annulation avant livraison">
      <p>
        Vous pouvez annuler une commande tant qu&apos;elle n&apos;a pas été expédiée, en nous contactant sur
        WhatsApp. Si un paiement a déjà été effectué, il vous est intégralement remboursé.
      </p>
    </Section>
  </LegalPage>
);

export default RefundPolicyPage;
