"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { useHeroContext } from "@/context/HeroContext";
import { type HeroSection } from "@/services/hero.service";
import { API_CONFIG } from "@/config/api.config";

const PromoBanner = () => {
  const { data, loading } = useHeroContext();

  // Extraire et trier les bannières promo depuis le contexte
  const promoBanners = useMemo(() => {
    if (!data) return [];
    const banners = data.grouped.promo_banners || [];
    // Trier par position (promo_1, promo_2, promo_3) puis par ordre pour conserver la position
    return [...banners].sort((a, b) => {
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

  const getImageUrl = (imagePath: string | null, defaultPath: string) => {
    if (!imagePath) return defaultPath;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.baseURL.replace('/api', '')}/storage/${imagePath}`;
  };

  const getBackgroundColor = (color: string | null, defaultColor: string) => {
    return color || defaultColor;
  };

  // Séparer les bannières: la première (grande) et les autres (petites)
  // Toujours afficher au moins les bannières par défaut si aucune n'existe
  const mainBanner = promoBanners.length > 0 
    ? (promoBanners.find(b => b.position === 'promo_1') || promoBanners[0])
    : null;
  // Chercher spécifiquement promo_2 et promo_3, toujours dans l'ordre : promo_2 (gauche) puis promo_3 (droite)
  const banner2 = promoBanners.find(b => b.position === 'promo_2');
  const banner3 = promoBanners.find(b => b.position === 'promo_3');
  // Garantir l'ordre : promo_2 toujours en premier (gauche), promo_3 en deuxième (droite)
  const smallBanners: HeroSection[] = [];
  if (banner2) smallBanners.push(banner2);
  if (banner3) smallBanners.push(banner3);

  if (loading) {
    return (
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-7.5"></div>
            <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        {mainBanner ? (
          <div 
            className="relative z-1 overflow-hidden rounded-lg py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5"
            style={{ backgroundColor: getBackgroundColor(mainBanner.couleur_fond, '#F5F5F7') }}
          >
            <div className="max-w-[550px] w-full relative z-10">
              {mainBanner.sous_titre && (
                <span className="block font-medium text-xl text-dark mb-3">
                  {mainBanner.sous_titre}
                </span>
              )}

              {mainBanner.titre && (
                <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                  {mainBanner.titre}
                </h2>
              )}

              {mainBanner.description && (
                <p>{mainBanner.description}</p>
              )}

              {mainBanner.lien_url && mainBanner.lien_url.startsWith('/') && mainBanner.texte_bouton && (
                <a
                  href={mainBanner.lien_url}
                  className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
                >
                  {mainBanner.texte_bouton}
                </a>
              )}
            </div>

            {mainBanner.image && (
              <Image
                src={getImageUrl(mainBanner.image, "/images/promo/promo-01.png")}
                alt={mainBanner.titre || "promo img"}
                className="absolute bottom-0 right-4 lg:right-26 z-0"
                width={274}
                height={350}
              />
            )}
          </div>
        ) : (
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
            <div className="max-w-[550px] w-full">
              <span className="block font-medium text-xl text-dark mb-3">
                Apple iPhone 14 Plus
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                UP TO 30% OFF
              </h2>

              <p>
                iPhone 14 has the same superspeedy chip that&apos;s in iPhone 13 Pro,
                A15 Bionic, with a 5‑core GPU, powers all the latest features.
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
              >
                Buy Now
              </a>
            </div>

            <Image
              src="/images/promo/promo-01.png"
              alt="promo img"
              className="absolute bottom-0 right-4 lg:right-26 -z-1"
              width={274}
              height={350}
            />
          </div>
        )}

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {smallBanners.length > 0 ? smallBanners.map((banner, index) => (
            <div
              key={banner.id}
              className="relative z-1 overflow-hidden rounded-lg py-6 sm:py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10 min-h-[200px] sm:min-h-[280px]"
              style={{ backgroundColor: getBackgroundColor(banner.couleur_fond, index === 0 ? '#DBF4F3' : '#FFECE1') }}
            >
              {banner.image && (
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 z-0 ${index === 0 ? 'left-2 sm:left-10' : 'right-2 sm:right-8.5'}`}
                >
                  <Image
                    src={getImageUrl(banner.image, index === 0 ? "/images/promo/promo-02.png" : "/images/promo/promo-03.png")}
                    alt={banner.titre || "promo img"}
                    width={index === 0 ? 241 : 200}
                    height={index === 0 ? 241 : 200}
                    className="w-24 h-24 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain"
                  />
                </div>
              )}

              <div className={`relative z-10 ${index === 0 ? "text-right ml-auto pl-28 sm:pl-44" : "text-left mr-auto pr-28 sm:pr-44"}`}>
                {banner.sous_titre && (
                  <span className="block text-sm sm:text-lg text-dark mb-1.5">
                    {banner.sous_titre}
                  </span>
                )}

                {banner.titre && (
                  <h2 className="font-bold text-lg sm:text-xl lg:text-heading-4 text-dark mb-2.5">
                    {banner.pourcentage_reduction ? (
                      <>
                        Up to <span className="text-orange">{banner.pourcentage_reduction}%</span> off
                      </>
                    ) : (
                      banner.titre
                    )}
                  </h2>
                )}

                {banner.texte_reduction && (
                  <p className={`font-semibold text-sm sm:text-custom-1 ${index === 0 ? 'text-teal' : 'text-orange'}`}>
                    {banner.texte_reduction}
                  </p>
                )}

                {banner.description && (
                  <p className={`max-w-[285px] text-xs sm:text-custom-sm ${index === 0 ? 'ml-auto' : ''}`}>
                    {banner.description}
                  </p>
                )}

                {banner.lien_url && banner.lien_url.startsWith('/') && banner.texte_bouton && (
                  <a
                    href={banner.lien_url}
                    className={`inline-flex font-medium text-xs sm:text-custom-sm text-white py-2 sm:py-2.5 px-4 sm:px-8.5 rounded-md ease-out duration-200 mt-4 sm:mt-7.5 ${
                      index === 0 
                        ? 'bg-teal hover:bg-teal-dark' 
                        : 'bg-orange hover:bg-orange-dark'
                    }`}
                  >
                    {banner.texte_bouton}
                  </a>
                )}
              </div>
            </div>
          )) : (
            <>
              {smallBanners.length > 0 && smallBanners[0] ? (
                <div
                  className="relative z-1 overflow-hidden rounded-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10"
                  style={{ backgroundColor: getBackgroundColor(smallBanners[0].couleur_fond, '#DBF4F3') }}
                >
                  {smallBanners[0].image && (
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 z-0"
                      style={{ width: '241px', height: '241px' }}
                    >
                      <Image
                        src={getImageUrl(smallBanners[0].image, "/images/promo/promo-02.png")}
                        alt={smallBanners[0].titre || "promo img"}
                        width={241}
                        height={241}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="text-right relative z-10 ml-auto" style={{ maxWidth: 'calc(100% - 260px)' }}>
                    {smallBanners[0].sous_titre && (
                      <span className="block text-lg text-dark mb-1.5">
                        {smallBanners[0].sous_titre}
                      </span>
                    )}

                    {smallBanners[0].titre && (
                      <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                        {smallBanners[0].titre}
                      </h2>
                    )}

                    {smallBanners[0].texte_reduction && (
                      <p className="font-semibold text-custom-1 text-teal">
                        {smallBanners[0].texte_reduction}
                      </p>
                    )}

                    {smallBanners[0].lien_url && smallBanners[0].lien_url.startsWith('/') && smallBanners[0].texte_bouton && (
                      <a
                        href={smallBanners[0].lien_url}
                        className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
                      >
                        {smallBanners[0].texte_bouton}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative z-1 overflow-hidden rounded-lg bg-[#DBF4F3] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
                  <Image
                    src="/images/promo/promo-02.png"
                    alt="promo img"
                    className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 z-0"
                    width={241}
                    height={241}
                  />

                  <div className="text-right relative z-10 ml-auto" style={{ maxWidth: 'calc(100% - 260px)' }}>
                    <span className="block text-lg text-dark mb-1.5">
                      Foldable Motorised Treadmill
                    </span>

                    <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                      Workout At Home
                    </h2>

                    <p className="font-semibold text-custom-1 text-teal">
                      Flat 20% off
                    </p>

                    <a
                      href="#"
                      className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
                    >
                      Grab Now
                    </a>
                  </div>
                </div>
              )}

              {smallBanners.length > 1 && smallBanners[1] ? (
                <div
                  className="relative z-1 overflow-hidden rounded-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10"
                  style={{ backgroundColor: getBackgroundColor(smallBanners[1].couleur_fond, '#FFECE1') }}
                >
                  {smallBanners[1].image && (
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 z-0"
                      style={{ width: '200px', height: '200px' }}
                    >
                      <Image
                        src={getImageUrl(smallBanners[1].image, "/images/promo/promo-03.png")}
                        alt={smallBanners[1].titre || "promo img"}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="relative z-10 mr-auto" style={{ maxWidth: 'calc(100% - 220px)' }}>
                    {smallBanners[1].sous_titre && (
                      <span className="block text-lg text-dark mb-1.5">
                        {smallBanners[1].sous_titre}
                      </span>
                    )}

                    {smallBanners[1].titre && (
                      <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                        {smallBanners[1].pourcentage_reduction ? (
                          <>
                            Up to <span className="text-orange">{smallBanners[1].pourcentage_reduction}%</span> off
                          </>
                        ) : (
                          smallBanners[1].titre
                        )}
                      </h2>
                    )}

                    {smallBanners[1].description && (
                      <p className="max-w-[285px] text-custom-sm">
                        {smallBanners[1].description}
                      </p>
                    )}

                    {smallBanners[1].lien_url && smallBanners[1].lien_url.startsWith('/') && smallBanners[1].texte_bouton && (
                      <a
                        href={smallBanners[1].lien_url}
                        className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
                      >
                        {smallBanners[1].texte_bouton}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative z-1 overflow-hidden rounded-lg bg-[#FFECE1] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
                  <Image
                    src="/images/promo/promo-03.png"
                    alt="promo img"
                    className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 z-0"
                    width={200}
                    height={200}
                  />

                  <div className="relative z-10 mr-auto" style={{ maxWidth: 'calc(100% - 220px)' }}>
                    <span className="block text-lg text-dark mb-1.5">
                      Apple Watch Ultra
                    </span>

                    <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                      Up to <span className="text-orange">40%</span> off
                    </h2>

                    <p className="max-w-[285px] text-custom-sm">
                      The aerospace-grade titanium case strikes the perfect balance of
                      everything.
                    </p>

                    <a
                      href="#"
                      className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
                    >
                      Buy Now
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
