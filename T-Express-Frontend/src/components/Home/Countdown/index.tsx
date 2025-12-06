"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { heroService, type HeroSection } from "@/services/hero.service";
import { API_CONFIG } from "@/config/api.config";

const CounDown = () => {
  const [countdownSection, setCountdownSection] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    loadCountdownSection();
  }, []);

  const loadCountdownSection = async () => {
    try {
      setLoading(true);
      const response = await heroService.getListe();
      const countdown = response.grouped.countdown?.[0] || null;
      setCountdownSection(countdown);
      
      // Utiliser la date de la base ou une date par défaut
      const deadline = countdown?.date_fin_countdown 
        ? new Date(countdown.date_fin_countdown).toISOString()
        : "December, 31, 2024";
      
      getTime(deadline);
    } catch (error: any) {
      // Extract error information with better handling
      let errorMessage = 'Erreur inconnue lors du chargement de la section countdown';
      let errorStatus: number | string = 'N/A';
      let errorDetails: any = {};

      if (!error) {
        errorMessage = 'Erreur inconnue: aucun détail d\'erreur disponible';
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (typeof error === 'object') {
        const errorKeys = Object.keys(error);
        if (errorKeys.length === 0) {
          errorMessage = 'Erreur inconnue: objet d\'erreur vide. Vérifiez la connexion au serveur.';
        } else {
          errorMessage = error.message || errorMessage;
          errorStatus = error.status || errorStatus;
          errorDetails = {
            ...error,
            name: error.name,
            stack: error.stack,
            errors: error.errors,
          };
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || 'Erreur lors du chargement de la section countdown';
        errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }

      console.error('Erreur lors du chargement de la section countdown', {
        message: errorMessage,
        status: errorStatus,
        error: error,
        errorType: typeof error,
        errorStringified: JSON.stringify(error),
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        details: errorDetails,
        timestamp: new Date().toISOString(),
      });

      // Utiliser une date par défaut en cas d'erreur
      getTime("December, 31, 2024");
    } finally {
      setLoading(false);
    }
  };

  const getTime = (deadline: string) => {
    const time = Date.parse(deadline) - Date.now();

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    if (countdownSection?.date_fin_countdown) {
      const deadline = new Date(countdownSection.date_fin_countdown).toISOString();
      const interval = setInterval(() => getTime(deadline), 1000);
      return () => clearInterval(interval);
    } else {
      const deadline = "December, 31, 2024";
      const interval = setInterval(() => getTime(deadline), 1000);
      return () => clearInterval(interval);
    }
  }, [countdownSection]);

  const getImageUrl = (imagePath: string | null, defaultPath: string) => {
    if (!imagePath) return defaultPath;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.baseURL.replace('/api', '')}/storage/${imagePath}`;
  };

  // Utiliser les données de la base ou les valeurs par défaut
  const sousTitre = countdownSection?.sous_titre || "Don't Miss!!";
  const titre = countdownSection?.titre || "Enhance Your Music Experience";
  const description = countdownSection?.description || "The Havit H206d is a wired PC headphone.";
  const texteBouton = countdownSection?.texte_bouton || "Check it Out!";
  const lienUrl = countdownSection?.lien_url || "#";
  const imageFond = countdownSection?.image_fond;
  const imageProduit = countdownSection?.image_produit;

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-lg bg-[#D0E9F3] p-4 sm:p-7.5 lg:p-10 xl:p-15">
          <div className="max-w-[422px] w-full">
            <span className="block font-medium text-custom-1 text-blue mb-2.5">
              {sousTitre}
            </span>

            <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3">
              {titre}
            </h2>

            <p>{description}</p>

            {/* <!-- Countdown timer --> */}
            <div className="flex flex-wrap gap-6 mt-6">
              {/* <!-- timer day --> */}
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {days < 10 ? "0" + days : days}
                </span>
                <span className="block text-custom-sm text-dark text-center">
                  Days
                </span>
              </div>

              {/* <!-- timer hours --> */}
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {hours < 10 ? "0" + hours : hours}
                </span>
                <span className="block text-custom-sm text-dark text-center">
                  Hours
                </span>
              </div>

              {/* <!-- timer minutes --> */}
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {minutes < 10 ? "0" + minutes : minutes}
                </span>
                <span className="block text-custom-sm text-dark text-center">
                  Minutes
                </span>
              </div>

              {/* <!-- timer seconds --> */}
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {seconds < 10 ? "0" + seconds : seconds}
                </span>
                <span className="block text-custom-sm text-dark text-center">
                  Seconds
                </span>
              </div>
            </div>
            {/* <!-- Countdown timer ends --> */}

            <a
              href={lienUrl}
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-3 px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              {texteBouton}
            </a>
          </div>

          {/* <!-- bg shapes --> */}
          {imageFond ? (
            <Image
              src={getImageUrl(imageFond, "/images/countdown/countdown-bg.png")}
              alt="bg shapes"
              className="hidden sm:block absolute right-0 bottom-0 -z-1"
              width={737}
              height={482}
            />
          ) : (
            <Image
              src="/images/countdown/countdown-bg.png"
              alt="bg shapes"
              className="hidden sm:block absolute right-0 bottom-0 -z-1"
              width={737}
              height={482}
            />
          )}
          
          {/* <!-- product image --> */}
          {imageProduit ? (
            <Image
              src={getImageUrl(imageProduit, "/images/countdown/countdown-01.png")}
              alt="product"
              className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1"
              width={411}
              height={376}
            />
          ) : (
            <Image
              src="/images/countdown/countdown-01.png"
              alt="product"
              className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1"
              width={411}
              height={376}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default CounDown;
