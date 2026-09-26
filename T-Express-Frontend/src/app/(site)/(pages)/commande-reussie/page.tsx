import React from "react";
import { Metadata } from "next";
import CommandeReussie from "@/components/Commande/CommandeReussie";

export const metadata: Metadata = {
  title: "Commande réussie | T-Express",
  description:
    "Votre commande est enregistrée. Nous vous contactons sur WhatsApp pour la confirmer.",
  robots: { index: false, follow: false },
};

const CommandeReussiePage = () => {
  return (
    <main>
      <CommandeReussie />
    </main>
  );
};

export default CommandeReussiePage;
