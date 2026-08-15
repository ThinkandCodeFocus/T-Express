import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "T-Express | Votre boutique en ligne au Sénégal",
  description: "T-Express, la plateforme e-commerce sénégalaise : produits de qualité, paiement adapté et livraison partout au Sénégal.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
