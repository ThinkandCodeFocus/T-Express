import React from "react";
import CheckoutNew from "@/components/Checkout/CheckoutNew";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Paiement | T-Express E-commerce",
  description: "Finalisez votre commande - T-Express Sénégal",
  // other metadata
};

const CheckoutPage = () => {
  return (
    <main>
      <CheckoutNew />
    </main>
  );
};

export default CheckoutPage;
