/**
 * Adaptateurs pour convertir les données de l'API
 * en format attendu par les composants existants
 */

import type { Produit } from './api.types';
import type { Product } from './product';

/**
 * Convertir un Produit de l'API en Product pour les composants
 */
export function adaptProduitToProduct(produit: Produit): Product {
  // Construire les URLs des images
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
  const storagePath = `${baseUrl}/storage/`;
  
  const images = produit.images ? JSON.parse(produit.images as any) : [];
  const thumbnails = images.length > 0 
    ? images.map((img: string) => `${storagePath}${img}`)
    : ['/images/products/default.png'];
    
  const previews = thumbnails; // Utiliser les mêmes images pour les previews
  
  // Si on a une image principale, l'utiliser en premier
  if (produit.image_principale) {
    const mainImage = `${storagePath}${produit.image_principale}`;
    thumbnails.unshift(mainImage);
    previews.unshift(mainImage);
  }

  return {
    id: produit.id,
    title: produit.nom,
    reviews: produit.nombre_avis || 0,
    price: produit.prix,
    discountedPrice: produit.prix_promo || produit.prix,
    imgs: {
      thumbnails,
      previews,
    },
  };
}

/**
 * Convertir un tableau de Produits en Products
 */
export function adaptProduitsToProducts(produits: Produit[]): Product[] {
  return produits.map(adaptProduitToProduct);
}
