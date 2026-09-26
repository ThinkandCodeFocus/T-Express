"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const { login, loginLoading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Le panier renvoie ici les visiteurs non connectes. Sans ce retour, un
  // acheteur venu d'une fiche produit se retrouvait sur l'accueil apres
  // connexion, et devait retrouver son article lui-meme.
  const retour = searchParams.get("redirect");
  // Un chemin interne uniquement : une URL absolue permettrait de rediriger
  // l'acheteur vers un autre site juste en fabriquant le lien de connexion.
  const destination = retour && /^\/(?!\/)/.test(retour) ? retour : "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const success = await login({ email, mot_de_passe: password });
      if (success) {
        router.push(destination);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la connexion");
    }
  };

  return (
    <>
      <Breadcrumb title={"Connexion"} pages={["Connexion"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Connectez-vous à votre compte
              </h2>
              <p>Entrez vos informations ci-dessous</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Mot de passe
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Entrez votre mot de passe"
                    autoComplete="on"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? "Connexion..." : "Se connecter"}
                </button>

                <Link
                  href="/forgot-password"
                  className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Mot de passe oublié ?
                </Link>

                <p className="text-center mt-6">
                  Vous n&apos;avez pas de compte ?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Créer un compte
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
