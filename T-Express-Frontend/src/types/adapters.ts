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

  // Le backend renvoie image_principale déjà en URL absolue, et images soit en
  // tableau soit (anciennes données) en chaîne JSON : on gère les deux, et on
  // ne préfixe que les chemins relatifs pour éviter de doubler l'origine.
  const toUrl = (img: string) => (/^https?:\/\//i.test(img) ? img : `${storagePath}${img}`);

  const fallback = '/images/products/product-1-bg-1.png';
  let images: string[] = [];
  if (Array.isArray(produit.images)) {
    images = produit.images;
  } else if (typeof produit.images === 'string' && produit.images) {
    try {
      images = JSON.parse(produit.images);
    } catch {
      images = [];
    }
  }
  const thumbnails = images.length > 0
    ? images.map(toUrl)
    : [fallback];
  const previews = thumbnails; // Utiliser les mêmes images pour les previews

  // Si on a une image principale, l'utiliser en premier
  if (produit.image_principale) {
    const mainImage = toUrl(produit.image_principale);
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
