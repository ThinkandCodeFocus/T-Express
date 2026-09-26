export function isBackendImageUrl(src?: string | null): boolean {
  if (!src || typeof src !== "string") {
    return false;
  }

  // If the path explicitly references the storage folder, treat it as a backend image
  if (src.includes('/storage/')) {
    return true;
  }

  // Otherwise, only treat full HTTP(S) URLs that point to the known backend hosts as backend images
  if (/^https?:\/\//i.test(src)) {
    return src.includes("localhost:8000") || src.includes("127.0.0.1:8000");
  }

  return false;
}

export function getBackendOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    return new URL(apiUrl).origin;
  } catch {
    return 'http://localhost:8000';
  }
}

/**
 * Photo à afficher pour un produit, quelle que soit la forme des données.
 *
 * `image_principale` prime, puis la première entrée de `images`. L'API renvoie
 * ce champ tantôt en tableau, tantôt en chaîne JSON, et les chemins tantôt
 * relatifs, tantôt déjà absolus : les quatre cas sont traités ici, plutôt que
 * réécrits à chaque endroit qui affiche un produit.
 */
export function imageProduit(
  produit?: { image_principale?: string | null; images?: unknown } | null,
  fallback = '/images/products/default.png'
): string {
  if (!produit) {
    return fallback;
  }

  if (produit.image_principale) {
    return resolveBackendImageUrl(produit.image_principale, fallback);
  }

  const brut = produit.images;
  let liste: unknown[] = [];

  if (Array.isArray(brut)) {
    liste = brut;
  } else if (typeof brut === 'string' && brut.trim() !== '') {
    try {
      const parse = JSON.parse(brut);
      liste = Array.isArray(parse) ? parse : [brut];
    } catch {
      // Chemin unique stocké en clair plutôt qu'en JSON.
      liste = [brut];
    }
  }

  const premiere = liste.find(
    (i): i is string => typeof i === 'string' && i !== ''
  );

  return premiere ? resolveBackendImageUrl(premiere, fallback) : fallback;
}

export function resolveBackendImageUrl(
  src?: string | null,
  fallback = '/images/products/default.png'
): string {
  if (!src || typeof src !== 'string') {
    return fallback;
  }

  if (/^https?:\/\//i.test(src) || src.startsWith('/images/')) {
    return src;
  }

  const normalized = src.replace(/^\/+/, '');

  if (normalized.startsWith('storage/')) {
    return `${getBackendOrigin()}/${normalized}`;
  }

  return `${getBackendOrigin()}/storage/${normalized}`;
}
