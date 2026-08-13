import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mon panier | T-Express",
  description: "Consultez et modifiez le contenu de votre panier T-Express avant de passer commande.",
  // other metadata
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
