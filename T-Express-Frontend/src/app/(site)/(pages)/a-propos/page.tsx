import { Metadata } from "next";
import LegalPage, { Section } from "@/components/Legal/LegalPage";

export const metadata: Metadata = {
  title: "À propos | T-Express",
  description: "Découvrez T-Express, boutique en ligne au Sénégal.",
};

const AProposPage = () => (
  <LegalPage
    titre="À propos de T-Express"
    fil="à propos"
    intro={
      <p>
        T-Express est une boutique en ligne exploitée au Sénégal, pensée pour rendre les achats du
        quotidien simples et accessibles.
      </p>
    }
  >
    <Section titre="Notre mission">
      <p>
         (...).
      </p>
    </Section>

    <Section titre="Ce que nous proposons">
      <p>
        T-Express permet de parcourir un catalogue de produits, de passer commande en ligne, puis de
        finaliser chaque commande directement avec notre équipe sur WhatsApp, pour un paiement et une
        livraison convenus ensemble.
      </p>
    </Section>

    <Section titre="Notre engagement">
      <p>
        (...).
      </p>
    </Section>

    <Section titre="Nous contacter">
      <p>
        Une question ? Notre équipe est joignable via notre page{" "}
        <a href="/contact" className="text-blue hover:underline">
          Contact
        </a>{" "}
        ou par téléphone au (+221) 77 118 87 47.
      </p>
    </Section>
  </LegalPage>
);

export default AProposPage;