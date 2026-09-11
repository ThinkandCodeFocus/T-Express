"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PhoneInput from "@/components/Common/PhoneInput";
import { validatePhone } from "@/lib/utils";

// Aligné sur la règle backend (RegisterRequest : password min:8).
const LONGUEUR_MIN_MOT_DE_PASSE = 8;

const Signup = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    password_confirmation: ""
  });
  
  const { register, registerLoading } = useAuthContext();
  const router = useRouter();
  const [error, setError] = useState<string>("");

  // Signalé dès la saisie de la confirmation, sans attendre l'envoi.
  const confirmationDifferente =
    formData.password_confirmation.length > 0 && formData.password !== formData.password_confirmation;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Valider le téléphone
    if (formData.telephone && !validatePhone(formData.telephone)) {
      setError("Le numéro de téléphone n'est pas valide. Format attendu : +221 XX XXX XX XX");
      return;
    }

    if (formData.password.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      setError(`Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    // Adapter les noms de champs pour l'API Laravel
    const data = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      mot_de_passe: formData.password,
      mot_de_passe_confirmation: formData.password_confirmation,
      // role: formData.role || "client" // décommente si tu ajoutes un champ role dans le formulaire
    };
    try {
      const success = await register(data);
      if (success) {
        router.push("/"); // Rediriger après inscription
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription");
    }
  };

  return (
    <>
      <Breadcrumb title={"Inscription"} pages={["Inscription"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Créer un compte
              </h2>
              <p>Entrez vos informations ci-dessous</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div role="alert" className="mb-5 p-4 bg-red-light-6 border border-red-light-4 text-red rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-5 mb-5">
                  <div className="w-full">
                    <label htmlFor="prenom" className="block mb-2.5">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      id="prenom"
                      placeholder="Votre prénom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="nom" className="block mb-2.5">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="nom"
                      id="nom"
                      placeholder="Votre nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Votre email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <PhoneInput
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={(value) => setFormData({...formData, telephone: value})}
                    placeholder="+221 77 118 87 47"
                    required
                    label="Téléphone"
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
                    placeholder="Votre mot de passe"
                    autoComplete="new-password"
                    aria-describedby="password-aide"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                  <p id="password-aide" className="mt-1.5 text-custom-sm text-dark-5">
                    {LONGUEUR_MIN_MOT_DE_PASSE} caractères minimum.
                  </p>
                </div>

                <div className="mb-5">
                  <label htmlFor="password_confirmation" className="block mb-2.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    id="password_confirmation"
                    placeholder="Confirmez votre mot de passe"
                    autoComplete="new-password"
                    aria-invalid={confirmationDifferente}
                    aria-describedby="password-confirmation-aide"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                      confirmationDifferente ? "border-red" : "border-gray-3"
                    }`}
                  />
                  <p id="password-confirmation-aide" aria-live="polite" className="mt-1.5 text-custom-sm text-red">
                    {confirmationDifferente ? "Les deux mots de passe ne correspondent pas." : ""}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerLoading ? "Inscription..." : "Créer un compte"}
                </button>

                <p className="text-center mt-6">
                  Vous avez déjà un compte ?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Se connecter
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

export default Signup;
