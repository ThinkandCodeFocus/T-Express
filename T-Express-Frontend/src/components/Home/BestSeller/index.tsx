"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { catalogueService } from "@/services/catalogue.service";
import { adaptProduitsToProducts } from "@/types/adapters";
import type { Product } from "@/types/product";

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Récupérer les produits en vedette (Best Sellers)
      const produits = await catalogueService.getFeatured(6);
      const adaptedProducts = adaptProduitsToProducts(produits);
      setProducts(adaptedProducts);
    } catch (error: any) {
      // Extract error information with better handling
      let errorMessage = 'Erreur inconnue lors du chargement des best sellers';
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
        errorMessage = error.message || 'Erreur lors du chargement des best sellers';
        errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }

      console.error('Erreur lors du chargement des best sellers', {
        message: errorMessage,
        status: errorStatus,
        error: error,
        errorType: typeof error,
        errorStringified: JSON.stringify(error),
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        details: errorDetails,
        timestamp: new Date().toISOString(),
      });

      // Check for timeout errors
      if (errorStatus === 408 || errorMessage?.includes('expiré') || errorMessage?.includes('timeout')) {
        console.warn(
          '⚠️ Timeout: Le backend ne répond pas assez rapidement. ' +
          'L\'application fonctionne en mode hors ligne. ' +
          'Vérifiez que le serveur Laravel est démarré sur http://localhost:8000'
        );
      }

      // En cas d'erreur, utiliser un tableau vide pour que l'application continue de fonctionner
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="overflow-hidden">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-10"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Ce mois-ci
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Meilleures ventes
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {/* <!-- Best Sellers item --> */}
          {products.map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            Voir tout
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
