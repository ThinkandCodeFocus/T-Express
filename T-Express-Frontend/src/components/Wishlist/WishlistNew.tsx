"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleItemNew from "../Wishlist/SingleItemNew";
import { useFavoris } from "@/hooks/useFavoris";
import { catalogueService } from "@/services/catalogue.service";
import type { Produit } from "@/types/api.types";

// Adapter pour convertir Produit en format attendu par SingleItemNew
const adaptProduitToWishlistItem = (produit: Produit) => ({
  id: produit.id,
  title: produit.nom,
  imgs: {
    thumbnails: produit.images && produit.images.length > 0 
      ? produit.images 
      : ["/images/products/default.png"]
  },
  discountedPrice: produit.prix_promo || produit.prix,
  regularPrice: produit.prix,
  stock: produit.stock?.quantite || 0,
  inStock: (produit.stock?.quantite || 0) > 0
});

export const WishlistNew = () => {
  const { favoris, toggle, loading: favorisLoading } = useFavoris();
  const [produitsDetails, setProduitsDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les détails des produits favoris
  useEffect(() => {
    const loadProduitsDetails = async () => {
      if (favoris.length === 0) {
        setProduitsDetails([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Charger les détails de chaque produit favori
        const promises = favoris.map(favori => 
          catalogueService.getDetail(favori.produit_id)
        );
        
        const produits = await Promise.all(promises);
        const adaptedProduits = produits.map(adaptProduitToWishlistItem);
        
        setProduitsDetails(adaptedProduits);
      } catch (err: any) {
        console.error("Erreur lors du chargement des favoris:", err);
        setError(err.message || "Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    };

    loadProduitsDetails();
  }, [favoris]);

  const handleClearWishlist = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider votre liste de favoris ?")) {
      try {
        // Supprimer tous les favoris via toggle
        await Promise.all(favoris.map(favori => toggle(favori.produit_id)));
      } catch (err) {
        console.error("Erreur lors de la suppression des favoris:", err);
      }
    }
  };

  // Loading skeleton
  if (loading || favorisLoading) {
    return (
      <>
        <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <div className="h-8 w-48 bg-gray-3 animate-pulse rounded"></div>
              <div className="h-10 w-40 bg-gray-3 animate-pulse rounded"></div>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* Table header */}
                  <div className="flex items-center py-5.5 px-10">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark">Product</p>
                    </div>
                    <div className="min-w-[205px]">
                      <p className="text-dark">Unit Price</p>
                    </div>
                    <div className="min-w-[265px]">
                      <p className="text-dark">Stock Status</p>
                    </div>
                    <div className="min-w-[150px]">
                      <p className="text-dark text-right">Action</p>
                    </div>
                  </div>

                  {/* Loading items */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center border-t border-gray-3 py-5 px-10">
                      <div className="min-w-[83px]">
                        <div className="w-9.5 h-9.5 bg-gray-3 animate-pulse rounded-lg"></div>
                      </div>
                      <div className="min-w-[387px] flex items-center gap-5.5">
                        <div className="w-20 h-17.5 bg-gray-3 animate-pulse rounded-[5px]"></div>
                        <div className="h-6 w-40 bg-gray-3 animate-pulse rounded"></div>
                      </div>
                      <div className="min-w-[205px]">
                        <div className="h-6 w-20 bg-gray-3 animate-pulse rounded"></div>
                      </div>
                      <div className="min-w-[265px]">
                        <div className="h-6 w-32 bg-gray-3 animate-pulse rounded"></div>
                      </div>
                      <div className="min-w-[150px] flex justify-end">
                        <div className="h-10 w-32 bg-gray-3 animate-pulse rounded-md"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <p className="text-red text-lg">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex text-white bg-blue py-2.5 px-6 rounded-md"
              >
                Réessayer
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">
              Vos Favoris ({produitsDetails.length})
            </h2>
            {produitsDetails.length > 0 && (
              <button 
                onClick={handleClearWishlist}
                className="text-blue ease-out duration-200 hover:text-red"
              >
                Vider la liste
              </button>
            )}
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* Table header */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-dark">Produit</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-dark">Prix Unitaire</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-dark">Statut Stock</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-dark text-right">Action</p>
                  </div>
                </div>

                {/* Wishlist items */}
                {produitsDetails.length > 0 ? (
                  produitsDetails.map((item, key) => (
                    <SingleItemNew 
                      item={item} 
                      key={key} 
                      onRemove={() => toggle(item.id)}
                    />
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-dark text-lg mb-4">Votre liste de favoris est vide</p>
                    <a 
                      href="/shop" 
                      className="inline-flex text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Découvrir nos produits
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
