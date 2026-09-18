import { Metadata } from "next";
import LegalPage, { Liste, Section } from "@/components/Legal/LegalPage";
import { LEGAL } from "@/config/legal";

export const metadata: Metadata = {
  title: "Informations de livraison | T-Express",
  description: "Délais, zones couvertes et coûts de livraison T-Express.",
};

const LivraisonPage = () => (
  <LegalPage
    titre="Informations de livraison"
    fil="livraison"
    intro={
      <p>
        Tout ce qu&apos;il faut savoir sur la livraison de vos commandes T-Express : délais, zones
        couvertes et coûts.
      </p>
    }
  >
    <Section titre="Délai de livraison">
      <p>
        La livraison standard prend habituellement <strong>{LEGAL.delaiLivraison}</strong> à partir de
        la confirmation de votre commande par notre équipe. Ce délai peut varier selon la destination ;
        nous vous prévenons en cas de retard.
      </p>
    </Section>

    <Section titre="Zones couvertes">
      <p>
        (.).
      </p>
    </Section>

    <Section titre="Coûts de livraison">
      <p>
        La livraison standard est actuellement <strong>gratuite</strong>, quelle que soit votre
        commande.
      </p>
      <p>
        ().
      </p>
    </Section>

    <Section titre="Comment ça se passe">
      <Liste>
        <li>Vous validez votre commande sur le site.</li>
        <li>Vous envoyez le récapitulatif à notre équipe sur WhatsApp.</li>
        <li>Notre équipe confirme la commande et convient avec vous du paiement et de la livraison.</li>
        <li>Votre commande est livrée à l&apos;adresse indiquée.</li>
      </Liste>
    </Section>

    <Section titre="Une question sur votre livraison ?">
      <p>
        Contactez-nous directement sur WhatsApp au {LEGAL.whatsappAffiche}, ou via notre page{" "}
        <a href="/contact" className="text-blue hover:underline">
          Contact
        </a>
        .
      </p>
    </Section>
  </LegalPage>
);

export default LivraisonPage;