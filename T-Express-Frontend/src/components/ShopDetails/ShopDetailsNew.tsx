"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { catalogueService } from "@/services/catalogue.service";
import { usePanierContext } from "@/context/PanierContext";
import { useFavorisContext } from "@/context/FavorisContext";
import type { Produit } from "@/types/api.types";
import { API_CONFIG } from "@/config/api.config";

const ShopDetailsNew = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [previewImg, setPreviewImg] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  const { ajouter: ajouterPanier, loading: panierLoading } = usePanierContext();
  const { toggle: toggleFavori, isFavorite } = useFavorisContext();

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const result = await catalogueService.getDetail(Number(productId));
      setProduct(result);
    } catch (error) {
      console.error("Erreur chargement produit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      await ajouterPanier({
        produit_id: product.id,
        quantite: quantity,
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (product) {
      await toggleFavori(product.id);
    }
  };

  const images = product?.images ? JSON.parse(product.images as any) : [];
  const imageUrl = (img: string) => `${API_CONFIG.baseURL.replace('/api', '')}/storage/${img}`;

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Détail Produit"} pages={["Produit"]} />
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
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Breadcrumb title={"Produit non trouvé"} pages={["Erreur"]} />
        <section className="py-20 text-center">
          <p className="text-lg">Produit introuvable</p>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={product.nom} pages={["Boutique", product.nom]} />
      
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            
            {/* Images */}
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                <Image
                  src={images.length > 0 ? imageUrl(images[previewImg]) : "/images/placeholder.jpg"}
                  alt={product.nom}
                  width={500}
                  height={500}
                  className="object-contain"
                />
              </div>

              {images.length > 1 && (
                <div className="flex flex-wrap gap-4.5 mt-6">
                  {images.map((img: string, key: number) => (
                    <button
                      key={key}
                      onClick={() => setPreviewImg(key)}
                      className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                        key === previewImg ? "border-blue" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={imageUrl(img)}
                        alt={`${product.nom} ${key + 1}`}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Détails */}
            <div className="flex-1">
              <h1 className="font-semibold text-2xl xl:text-4xl text-dark mb-3">
                {product.nom}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                {product.prix_promo && product.prix_promo < product.prix ? (
                  <>
                    <p className="font-semibold text-2xl text-blue">
                      {product.prix_promo.toLocaleString()} FCFA
                    </p>
                    <p className="font-medium text-lg text-dark-4 line-through">
                      {product.prix.toLocaleString()} FCFA
                    </p>
                  </>
                ) : (
                  <p className="font-semibold text-2xl text-blue">
                    {product.prix.toLocaleString()} FCFA
                  </p>
                )}
              </div>

              {product.note_moyenne > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.note_moyenne)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300 fill-current"
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-dark-4">
                    ({product.nombre_avis} avis)
                  </span>
                </div>
              )}

              <p className="text-dark-5 mb-8">
                {product.description || "Description non disponible"}
              </p>

              {product.marque && (
                <div className="mb-6">
                  <span className="text-dark font-medium">Marque: </span>
                  <span className="text-dark-5">{product.marque}</span>
                </div>
              )}

              {/* Stock */}
              <div className="mb-8">
                {product.stock && product.stock.quantite > 0 ? (
                  <span className="inline-flex items-center gap-1 text-green">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3337 4.66667L6.00033 12L2.66699 8.66667"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    En stock ({product.stock.quantite} disponibles)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.6663 3.33301L3.33301 12.6663"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Rupture de stock
                  </span>
                )}
              </div>

              {/* Quantité et Panier */}
              {product.stock && product.stock.quantite > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 border border-gray-3 rounded-lg flex items-center justify-center text-xl"
                    aria-label="button to decrease quantity"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock?.quantite || 1, quantity + 1))}
                    className="w-9 h-9 border border-gray-3 rounded-lg flex items-center justify-center text-xl"
                    aria-label="button to increase quantity"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={panierLoading}
                className="flex-1 min-w-[200px] font-medium text-white bg-dark py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue disabled:opacity-50"
              >
                {panierLoading ? "Ajout..." : "Ajouter au panier"}
              </button>

              <button
                onClick={handleAddToWishlist}
                className="flex items-center justify-center w-11.5 h-11.5 rounded-md border border-gray-3 ease-out duration-200 hover:border-blue hover:text-blue"
              >
                <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                  <path d="M11.5313 17.6198C11.3875 17.6836 11.2203 17.7179 11.0531 17.7179C10.8859 17.7179 10.7188 17.6836 10.575 17.6198C8.22656 16.5823 0.6875 12.3948 0.6875 6.73105C0.6875 4.3123 2.61406 2.38574 5.03281 2.38574C6.89219 2.38574 8.54844 3.48324 9.37656 5.06886C9.44531 5.20261 9.58594 5.27824 9.72656 5.27824H12.3453C12.4859 5.27824 12.6266 5.20261 12.6953 5.06886C13.5234 3.48324 15.1797 2.38574 17.0391 2.38574C19.4578 2.38574 21.3844 4.3123 21.3844 6.73105C21.3844 12.3948 13.8797 16.5823 11.5313 17.6198Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopDetailsNew;
