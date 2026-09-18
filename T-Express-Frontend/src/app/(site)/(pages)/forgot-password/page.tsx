import ForgotPassword from "@/components/Auth/ForgotPassword";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié | T-Express",
  description:
    "Vous avez oublié le mot de passe de votre compte T-Express ? Préparez votre demande de réinitialisation à envoyer à notre équipe sur WhatsApp.",
};

const ForgotPasswordPage = () => {
  return (
    <main>
      <ForgotPassword />
    </main>
  );
};

export default ForgotPasswordPage;
