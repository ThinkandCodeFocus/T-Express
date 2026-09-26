import Signin from "@/components/Auth/Signin";
import React, { Suspense } from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Connexion | T-Express",
  description: "Connectez-vous à votre compte T-Express pour suivre vos commandes et vos favoris.",
  // other metadata
};

const SigninPage = () => {
  return (
    <main>
      {/* Signin lit le parametre `redirect` : useSearchParams impose une
          frontiere Suspense, sinon toute la page bascule en rendu dynamique. */}
      <Suspense fallback={null}>
        <Signin />
      </Suspense>
    </main>
  );
};

export default SigninPage;
