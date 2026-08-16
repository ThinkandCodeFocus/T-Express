import React, { Suspense } from "react";
import ShopDetailsNew from "@/components/ShopDetails/ShopDetailsNew";
import { Metadata } from "next";
import { catalogueService } from "@/services/catalogue.service";

const TITRE_DEFAUT = "Détails Produit | T-Express E-commerce";
const DESCRIPTION_DEFAUT = "Découvrez les détails du produit - T-Express Sénégal";

// L'id du produit vient d'un query param (?id=), pas d'un segment de route
// dynamique (voir ShopDetailsNew.tsx) : generateMetadata le lit via searchParams
// pour que partager un lien produit affiche sa vraie photo/titre au lieu du
// logo générique du site.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { id } = await searchParams;
  const produitId = id ? Number(id) : null;

  if (!produitId || Number.isNaN(produitId)) {
    return { title: TITRE_DEFAUT, description: DESCRIPTION_DEFAUT };
  }

  try {
    const produit = await catalogueService.getDetail(produitId);
    const titre = `${produit.nom} | T-Express`;
    const description = produit.description
      ? produit.description.slice(0, 160)
      : DESCRIPTION_DEFAUT;

    return {
      title: titre,
      description,
      openGraph: {
        title: titre,
        description,
        images: produit.image_principale ? [{ url: produit.image_principale }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: titre,
        description,
        images: produit.image_principale ? [produit.image_principale] : undefined,
      },
    };
  } catch {
    // Produit introuvable/API indisponible : retomber sur le générique plutôt
    // que faire échouer le rendu de la page pour un souci de métadonnées.
    return { title: TITRE_DEFAUT, description: DESCRIPTION_DEFAUT };
  }
}

const ShopDetailsPage = () => {
  return (
    <main>
      <Suspense
        fallback={
          <section className="overflow-hidden py-20">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="animate-pulse">
                <div className="flex flex-col lg:flex-row gap-7.5">
                  <div className="lg:max-w-[570px] w-full">
                    <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="h-32 bg-gray-200 rounded mb-6"></div>
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        }
      >
        <ShopDetailsNew />
      </Suspense>
    </main>
  );
};

export default ShopDetailsPage;
