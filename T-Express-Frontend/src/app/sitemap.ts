import type { MetadataRoute } from "next";
import { API_CONFIG } from "@/config/api.config";
import { SITE_URL } from "@/config/site";

// Les produits changent sans redéploiement : sitemap régénéré au plus toutes
// les heures. Si l'API est injoignable (par ex. pendant le build Docker), on
// publie au moins les pages statiques.
export const revalidate = 3600;

const PAGES_STATIQUES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
  { url: `${SITE_URL}/shop-with-sidebar`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
  { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
];

/** Plafond de pages de 100 produits lues, pour borner la génération. */
const PAGES_PRODUITS_MAX = 50;

type ProduitApi = { id: number; actif?: boolean | number | string; updated_at?: string };
type CategorieApi = { id: number; updated_at?: string; sous_categories?: CategorieApi[] };

async function appelApi<T>(endpoint: string, body: object): Promise<T | null> {
  try {
    const reponse = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    return reponse.ok ? ((await reponse.json()) as T) : null;
  } catch {
    return null;
  }
}

const date = (valeur?: string) => (valeur ? new Date(valeur) : undefined);

async function entreesProduits(): Promise<MetadataRoute.Sitemap> {
  const entrees: MetadataRoute.Sitemap = [];

  for (let page = 1, derniere = 1; page <= derniere && page <= PAGES_PRODUITS_MAX; page++) {
    const reponse = await appelApi<{ data: ProduitApi[]; last_page: number }>(
      API_CONFIG.endpoints.catalogue.rechercher,
      { per_page: 100, page }
    );
    if (!reponse) break;
    derniere = reponse.last_page;

    for (const produit of reponse.data) {
      // `actif` arrive en booléen ou en 0/1 selon le SGBD.
      if (produit.actif !== undefined && !Number(produit.actif)) continue;
      entrees.push({
        url: `${SITE_URL}/shop-details?id=${produit.id}`,
        lastModified: date(produit.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entrees;
}

async function entreesCategories(): Promise<MetadataRoute.Sitemap> {
  const reponse = await appelApi<{ categories: CategorieApi[] }>(API_CONFIG.endpoints.categories.liste, {});
  // L'API publique ne renvoie déjà que les catégories actives.
  const toutes = (reponse?.categories ?? []).flatMap((c) => [c, ...(c.sous_categories ?? [])]);

  return toutes.map((categorie) => ({
    url: `${SITE_URL}/shop-with-sidebar?categorie=${categorie.id}`,
    lastModified: date(categorie.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, produits] = await Promise.all([entreesCategories(), entreesProduits()]);
  return [...PAGES_STATIQUES, ...categories, ...produits];
}
