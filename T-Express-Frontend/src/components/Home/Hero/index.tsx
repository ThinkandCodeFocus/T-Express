"use client";
import React, { useMemo } from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import { useHeroContext } from "@/context/HeroContext";
import { type HeroSection } from "@/services/hero.service";
import { API_CONFIG } from "@/config/api.config";

const Hero = () => {
  const { data, loading } = useHeroContext();

  // Extraire et trier les side cards depuis le contexte
  const sideCards = useMemo(() => {
    if (!data) return [];
    const cards = data.grouped.side_cards || [];
    // Trier par position (side_1, side_2) puis par ordre pour conserver la position
    return [...cards].sort((a, b) => {
      // Si les deux ont une position, trier par position
      if (a.position && b.position) {
        return a.position.localeCompare(b.position);
      }
      // Si seulement a a une position, a vient en premier
      if (a.position) return -1;
      // Si seulement b a une position, b vient en premier
      if (b.position) return 1;
      // Sinon trier par ordre
      return (a.ordre || 0) - (b.ordre || 0);
    });
  }, [data]);

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/images/hero/hero-02.png";
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.baseURL.replace('/api', '')}/storage/${imagePath}`;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "";
    return new Intl.NumberFormat('fr-SN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + " FCFA";
  };

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              {/* L'image de fond sera gérée par le carousel si nécessaire */}

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {loading ? (
                <>
                  <div className="w-full animate-pulse bg-gray-200 rounded-[10px] h-48"></div>
                  <div className="w-full animate-pulse bg-gray-200 rounded-[10px] h-48"></div>
                </>
              ) : (
                <>
                  {/* Première carte - toujours affichée */}
                  {sideCards.length > 0 ? (
                    <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                      <div className="flex items-center gap-14">
                        <div>
                          <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                            {sideCards[0].lien_url && sideCards[0].lien_url.startsWith('/') ? (
                              <a href={sideCards[0].lien_url}>{sideCards[0].titre || "iPhone 14 Plus & 14 Pro Max"}</a>
                            ) : (
                              <span>{sideCards[0].titre || "iPhone 14 Plus & 14 Pro Max"}</span>
                            )}
                          </h2>

                          <div>
                            <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                              {sideCards[0].texte_prix || "Offre limitée"}
                            </p>
                            <span className="flex items-center gap-3">
                              <span className="font-medium text-heading-5 text-red">
                                {sideCards[0].prix_actuel ? formatPrice(sideCards[0].prix_actuel) : "420 000 FCFA"}
                              </span>
                              <span className="font-medium text-2xl text-dark-4 line-through">
                                {sideCards[0].prix_ancien ? formatPrice(sideCards[0].prix_ancien) : "600 000 FCFA"}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div>
                          <Image
                            src={getImageUrl(sideCards[0].image)}
                            alt={sideCards[0].titre || "mobile image"}
                            width={123}
                            height={161}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                      <div className="flex items-center gap-14">
                        <div>
                          <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                            <a href="#"> iPhone 14 Plus & 14 Pro Max </a>
                          </h2>

                          <div>
                            <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                              Offre limitée
                            </p>
                            <span className="flex items-center gap-3">
                              <span className="font-medium text-heading-5 text-red">
                                420 000 FCFA
                              </span>
                              <span className="font-medium text-2xl text-dark-4 line-through">
                                600 000 FCFA
                              </span>
                            </span>
                          </div>
                        </div>

                        <div>
                          <Image
                            src="/images/hero/hero-02.png"
                            alt="mobile image"
                            width={123}
                            height={161}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Deuxième carte - toujours affichée */}
                  {sideCards.length > 1 ? (
                    <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                      <div className="flex items-center gap-14">
                        <div>
                          <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                            {sideCards[1].lien_url && sideCards[1].lien_url.startsWith('/') ? (
                              <a href={sideCards[1].lien_url}>{sideCards[1].titre || "Casque sans fil"}</a>
                            ) : (
                              <span>{sideCards[1].titre || "Casque sans fil"}</span>
                            )}
                          </h2>

                          <div>
                            <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                              {sideCards[1].texte_prix || "Offre limitée"}
                            </p>
                            <span className="flex items-center gap-3">
                              <span className="font-medium text-heading-5 text-red">
                                {sideCards[1].prix_actuel ? formatPrice(sideCards[1].prix_actuel) : "25 000 FCFA"}
                              </span>
                              <span className="font-medium text-2xl text-dark-4 line-through">
                                {sideCards[1].prix_ancien ? formatPrice(sideCards[1].prix_ancien) : "40 000 FCFA"}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div>
                          <Image
                            src={getImageUrl(sideCards[1].image)}
                            alt={sideCards[1].titre || "mobile image"}
                            width={123}
                            height={161}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                      <div className="flex items-center gap-14">
                        <div>
                          <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                            <a href="#"> Casque sans fil </a>
                          </h2>

                          <div>
                            <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                              Offre limitée
                            </p>
                            <span className="flex items-center gap-3">
                              <span className="font-medium text-heading-5 text-red">
                                25 000 FCFA
                              </span>
                              <span className="font-medium text-2xl text-dark-4 line-through">
                                40 000 FCFA
                              </span>
                            </span>
                          </div>
                        </div>

                        <div>
                          <Image
                            src="/images/hero/hero-01.png"
                            alt="mobile image"
                            width={123}
                            height={161}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
