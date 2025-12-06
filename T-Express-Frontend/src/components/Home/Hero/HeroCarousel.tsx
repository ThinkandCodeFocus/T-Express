"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useEffect, useState } from "react";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import React from "react";
import { heroService, type HeroSection } from "@/services/hero.service";
import { API_CONFIG } from "@/config/api.config";

const HeroCarousal = () => {
  const [slides, setSlides] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const response = await heroService.getListe();
      const carouselSlides = response.grouped.carousel || [];
      // Trier par ordre pour conserver la position
      const sortedSlides = [...carouselSlides].sort((a, b) => {
        return (a.ordre || 0) - (b.ordre || 0);
      });
      setSlides(sortedSlides);
    } catch (error: any) {
      // Extract error information with better handling
      let errorMessage = 'Erreur inconnue lors du chargement du carousel hero';
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
        errorMessage = error.message || 'Erreur lors du chargement du carousel hero';
        errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }

      console.error('Erreur lors du chargement du carousel hero', {
        message: errorMessage,
        status: errorStatus,
        error: error,
        errorType: typeof error,
        errorStringified: JSON.stringify(error),
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        details: errorDetails,
        timestamp: new Date().toISOString(),
      });

      // En cas d'erreur, utiliser des données par défaut
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/images/hero/hero-01.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.baseURL.replace('/api', '')}/storage/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Chargement...</div>
      </div>
    );
  }

  // Si pas de slides, afficher le design par défaut
  const displaySlides = slides.length > 0 ? slides : [
    {
      id: 'default-1',
      pourcentage_reduction: 30,
      texte_reduction: 'Sale\nOff',
      titre: 'True Wireless Noise Cancelling Headphone',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi at ipsum at risus euismod lobortis in',
      texte_bouton: 'Shop Now',
      lien_url: '#',
      image: null,
    } as HeroSection
  ];

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {displaySlides.map((slide) => (
        <SwiperSlide key={slide.id}>
          <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
              <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                  {slide.pourcentage_reduction || 30}%
                </span>
                <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                  {slide.texte_reduction ? (
                    slide.texte_reduction.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < slide.texte_reduction.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))
                  ) : (
                    <>
                      Sale
                      <br />
                      Off
                    </>
                  )}
                </span>
              </div>

              <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                {slide.lien_url ? (
                  <a href={slide.lien_url}>{slide.titre || "True Wireless Noise Cancelling Headphone"}</a>
                ) : (
                  <a href="#">{slide.titre || "True Wireless Noise Cancelling Headphone"}</a>
                )}
              </h1>

              <p>
                {slide.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi at ipsum at risus euismod lobortis in"}
              </p>

              <a
                href={slide.lien_url || "#"}
                className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
              >
                {slide.texte_bouton || "Shop Now"}
              </a>
            </div>

            <div>
              <Image
                src={getImageUrl(slide.image)}
                alt={slide.titre || "headphone"}
                width={351}
                height={358}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
