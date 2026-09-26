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

  const fallback = '/images/products/default.png';
  let images: string[] = [];
  if (Array.isArray(produit.images)) {
    images = produit.images;
  } else if (typeof produit.images === 'string' && produit.images) {
    try {
      const parse = JSON.parse(produit.images);
      images = Array.isArray(parse) ? parse : [];
    } catch {
      images = [];
    }
  }

  // L'image principale vit dans son propre champ et figure souvent aussi dans
  // `images` : `Set` evite de l'afficher deux fois dans la bande de vignettes.
  //
  // Auparavant `previews` etait une simple reference vers `thumbnails`, et
  // l'image principale etait inseree par `unshift` sur les deux : la meme
  // insertion se faisait donc deux fois sur un seul tableau, et chaque produit
  // affichait sa photo principale en double dans l'apercu rapide.
  const liste = Array.from(
    new Set(
      [
        ...(produit.image_principale ? [produit.image_principale] : []),
        ...images,
      ]
        .filter((img): img is string => typeof img === 'string' && img !== '')
        .map(toUrl)
    )
  );
  const thumbnails = liste.length > 0 ? liste : [fallback];
  const previews = [...thumbnails];

  // L'API renvoie les prix en chaine (« 260000.00 »). Sans conversion, toute
  // comparaison en aval porte sur du texte : « 90000.00 » < « 260000.00 » est
  // faux, et une promotion reelle passait alors inapercue.
  const prix = Number(produit.prix ?? 0);
  const prixPromo = produit.prix_promo != null ? Number(produit.prix_promo) : null;
  const enPromotion = prixPromo !== null && prixPromo > 0 && prixPromo < prix;

  return {
    id: produit.id,
    title: produit.nom,
    reviews: Number(produit.nombre_avis ?? 0),
    rating: Number(produit.note_moyenne ?? 0),
    price: prix,
    discountedPrice: enPromotion ? (prixPromo as number) : prix,
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
