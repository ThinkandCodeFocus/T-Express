"use client";

import React, { useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import PhoneInput from "@/components/Common/PhoneInput";
import WhatsAppIcon from "@/components/Common/WhatsAppIcon";
import { validatePhone } from "@/lib/utils";
import { lienWhatsAppAdmin, messageMotDePasseOublieWhatsApp } from "@/lib/whatsapp";

/**
 * Demande de réinitialisation de mot de passe.
 *
 * Le backend n'expose ni endpoint de réinitialisation ni envoi d'email : la
 * demande part donc sur le WhatsApp de l'admin, comme la finalisation des
 * commandes (#2) et le formulaire de contact (#17). L'admin vérifie l'identité
 * du client puis réinitialise le mot de passe lui-même.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [erreur, setErreur] = useState("");
  const [lienWhatsApp, setLienWhatsApp] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailNettoye = email.trim();
    if (!emailNettoye) {
      setErreur("Merci d'indiquer l'email de votre compte.");
      return;
    }

    // Le téléphone est facultatif, mais s'il est rempli il doit être valide :
    // un numéro erroné empêcherait l'admin de vous rappeler.
    if (telephone && !validatePhone(telephone)) {
      setErreur("Le numéro de téléphone n'est pas valide (format : +221 XX XXX XX XX).");
      return;
    }

    setErreur("");
    setLienWhatsApp(
      lienWhatsAppAdmin(
        messageMotDePasseOublieWhatsApp({
          email: emailNettoye,
          telephone: telephone.trim() || undefined,
        })
      )
    );
  };

  if (lienWhatsApp) {
    return (
      <>
        <Breadcrumb title={"Mot de passe oublié"} pages={["mot de passe oublié"]} />

        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:p-12.5 text-center max-w-[570px] mx-auto">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-light-6 text-green flex items-center justify-center">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h2 className="text-2xl font-medium text-dark mb-3">Votre demande est prête</h2>

              <p className="text-dark-4 mb-8">
                Dernière étape : envoyez-nous la demande sur WhatsApp. Notre équipe vérifie qu&apos;il
                s&apos;agit bien de votre compte, puis réinitialise votre mot de passe avec vous.
              </p>

              <a
                href={lienWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto font-medium text-white bg-[#25D366] py-3.5 px-8 rounded-md ease-out duration-200 hover:bg-[#1ebe5b]"
              >
                <WhatsAppIcon />
                Envoyer ma demande sur WhatsApp
              </a>

              <p className="text-custom-sm text-dark-5 mt-4">
                Le message est déjà rempli : il vous suffit de l&apos;envoyer.
              </p>

              <div className="mt-8 pt-6 border-t border-gray-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                <button
                  type="button"
                  onClick={() => setLienWhatsApp(null)}
                  className="text-blue hover:underline"
                >
                  Corriger mes informations
                </button>

                <Link href="/signin" className="text-blue hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Mot de passe oublié"} pages={["mot de passe oublié"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Mot de passe oublié
              </h2>
              <p>
                La réinitialisation automatique par email n&apos;est pas encore disponible. Indiquez
                l&apos;email de votre compte : nous préparons une demande à envoyer à notre équipe sur
                WhatsApp, qui réinitialisera votre mot de passe avec vous.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {erreur && (
                <div className="mb-5 p-4 bg-red-light-6 border border-red-light-4 text-red-dark rounded-lg">
                  {erreur}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email <span className="text-red">*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Entrez l'email de votre compte"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <PhoneInput
                  id="telephone"
                  name="telephone"
                  label="Téléphone (facultatif)"
                  value={telephone}
                  onChange={setTelephone}
                />
                <p className="text-custom-sm text-dark-4 mt-2">
                  Nous aide à retrouver votre compte et à vous rappeler si besoin.
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
              >
                Préparer ma demande
              </button>

              <p className="text-center mt-6">
                Vous vous souvenez de votre mot de passe ?
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
      </section>
    </>
  );
};

export default ForgotPassword;
