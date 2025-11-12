import React from "react";
import ShopDetailsNew from "@/components/ShopDetails/ShopDetailsNew";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Détails Produit | T-Express E-commerce",
  description: "Découvrez les détails du produit - T-Express Sénégal",
  // other metadata
};

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetailsNew />
    </main>
  );
};

export default ShopDetailsPage;
