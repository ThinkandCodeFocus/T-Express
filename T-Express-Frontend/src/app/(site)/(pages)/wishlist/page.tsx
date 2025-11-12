import React from "react";
import { WishlistNew } from "@/components/Wishlist/WishlistNew";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes Favoris | T-Express E-commerce",
  description: "Vos produits favoris - T-Express Sénégal",
  // other metadata
};

const WishlistPage = () => {
  return (
    <main>
      <WishlistNew />
    </main>
  );
};

export default WishlistPage;
