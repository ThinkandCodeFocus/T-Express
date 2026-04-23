import React, { Suspense } from "react";
import ShopDetailsNew from "@/components/ShopDetails/ShopDetailsNew";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Détails Produit | T-Express E-commerce",
  description: "Découvrez les détails du produit - T-Express Sénégal",
  // other metadata
};

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
