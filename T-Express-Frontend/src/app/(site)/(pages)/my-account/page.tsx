import MyAccountNew from "@/components/MyAccount/MyAccountNew";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mon Compte | T-Express E-commerce",
  description: "Gérez votre compte - T-Express Sénégal",
  // other metadata
};

const MyAccountPage = () => {
  return (
    <main>
      <MyAccountNew />
    </main>
  );
};

export default MyAccountPage;
