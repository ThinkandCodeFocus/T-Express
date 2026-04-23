import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop Page | NextCommerce Nextjs E-commerce template",
  description: "This is Shop Page for NextCommerce Template",
  // other metadata
};

const ShopWithSidebarPage = () => {
  return (
    <main>
      <Suspense
        fallback={
          <section className="overflow-hidden pb-20 pt-5 lg:pt-20 xl:pt-28">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-7.5 xl:gap-10">
                <div className="lg:col-span-1">
                  <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="bg-white rounded-lg p-4 shadow-1 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        }
      >
        <ShopWithSidebar />
      </Suspense>
    </main>
  );
};

export default ShopWithSidebarPage;
